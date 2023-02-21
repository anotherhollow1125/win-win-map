import { useState, useEffect, useRef } from "react";
import { Event, listen } from "@tauri-apps/api/event";
import useConfig from "@/hooks/config-hook";
import { Config, ConfigMethods } from "@/hooks/config-hook";
import { invoke } from "@tauri-apps/api/tauri";
import useFrames from "@/hooks/frame-hook";
import { FramesInfo } from "@/hooks/frame-hook";

type useAppStateRes = [
  FramesInfo | undefined,
  Config | undefined,
  ConfigMethods,
  () => Promise<void>
];

interface Payload {
  kind: "active" | "move" | "destroy";
  hwnd: number;
}

interface WinInfo {
  hwnd: number;
  title: string;
  left: number;
  top: number;
  width: number;
  height: number;
}

const summonWindow = async (
  hwnd: number,
  pos: { x: number; y: number },
  wh: { width: number; height: number }
) => {
  setTimeout(async () => {
    await invoke("set_window_pos_and_size", {
      hwnd: hwnd,
      x: pos.x,
      y: pos.y,
      width: wh.width,
      height: wh.height,
    });
  }, 100);
};

const inThreshold = (cnfg: Config, winInfo: WinInfo): boolean => {
  if (cnfg.auto_summon_threshold === undefined) {
    return false;
  }

  return (
    cnfg.auto_summon_threshold.left <= winInfo.left &&
    cnfg.auto_summon_threshold.top <= winInfo.top &&
    cnfg.auto_summon_threshold.right >= winInfo.left &&
    cnfg.auto_summon_threshold.bottom >= winInfo.top
  );
};

const summonSize = (cnfg: Config) => {
  if (cnfg.auto_summon_size === undefined) {
    return {
      width: 100,
      height: 100,
    };
  }

  return {
    width: cnfg.auto_summon_size.width > 0 ? cnfg.auto_summon_size.width : 100,
    height:
      cnfg.auto_summon_size.height > 0 ? cnfg.auto_summon_size.height : 100,
  };
};

const tryAutoSummon = async (e: Event<Payload>, cnfg: Config) => {
  let winInfo;
  try {
    winInfo = await invoke<WinInfo>("get_window", { hwnd: e.payload.hwnd });
  } catch {
    return;
  }

  if (
    cnfg === undefined ||
    cnfg.summon_point === undefined ||
    cnfg.auto_summon_threshold === undefined ||
    cnfg.auto_summon_size === undefined
  ) {
    return;
  }

  const autoSummonCond =
    cnfg !== undefined &&
    cnfg.auto_summon_enabled &&
    e.payload.kind === "active" &&
    cnfg.summon_point !== undefined &&
    cnfg.auto_summon_threshold !== undefined &&
    !inThreshold(cnfg, winInfo);

  if (!autoSummonCond) {
    return;
  }

  await summonWindow(e.payload.hwnd, cnfg.summon_point, summonSize(cnfg));
};

export const ManualSummonWindow = (hwnd: number, cnfg: Config) => {
  if (
    cnfg === undefined ||
    cnfg.summon_point === undefined ||
    cnfg.auto_summon_threshold === undefined ||
    cnfg.auto_summon_size === undefined
  ) {
    return;
  }

  summonWindow(hwnd, cnfg.summon_point, summonSize(cnfg));

  setTimeout(async () => {
    await invoke("set_foreground", {
      hwnd,
    });
  }, 100);
};

const useAppState = (): useAppStateRes => {
  const [frames, updateFrames] = useFrames();
  const [appWH, setAppWH] = useState<undefined[]>([undefined]); // resize イベント用のダミー
  const [config, configMethods] = useConfig();
  const unlisten = useRef<(() => void) | undefined>(undefined);

  const setListenFunc = async (cnfg: Config) => {
    /*
    if (unlisten.current !== undefined) {
      unlisten.current?.();
    }
    */
    const unlstn = await listen<Payload>("update", async (e) => {
      await tryAutoSummon(e, cnfg);
      await updateFrames();
    });
    // init時二重呼び出しに対処するため、await後に解除
    if (unlisten.current !== undefined) {
      unlisten.current?.();
    }
    unlisten.current = unlstn;
  };

  useEffect(() => {
    (async () => {
      updateFrames();
      if (config !== undefined) {
        await setListenFunc(config);
      }
    })();
    window.addEventListener("resize", () => {
      setAppWH([undefined]);
    });
  }, []);

  useEffect(() => {
    updateFrames();
  }, [appWH]);

  useEffect(() => {
    (async () => {
      if (config !== undefined) {
        console.log("setListenFunc");
        await setListenFunc(config);
      }
    })();
  }, [config]);

  return [frames, config, configMethods, updateFrames];
};

export default useAppState;
