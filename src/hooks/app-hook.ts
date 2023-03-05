import { useState, useEffect, useRef } from "react";
import { Event, listen } from "@tauri-apps/api/event";
import useConfig from "@/hooks/config-hook";
import { Config, ConfigMethods } from "@/hooks/config-hook";
import { invoke } from "@tauri-apps/api/tauri";
import useFrames from "@/hooks/frame-hook";
import { FramesInfo, CanvasInfo } from "@/hooks/frame-hook";
import { WindowAttr } from "@/hooks/frame-hook";
import { WinInfo } from "@/winwin-type";

type useAppStateRes = [
  frames: FramesInfo | undefined,
  config: Config | undefined,
  configMethods: ConfigMethods,
  updateFrames: () => Promise<void>,
  targetForceRefresh: (
    targettingHwnd: number | undefined,
    windows: WindowAttr[]
  ) => void,
  target: WindowAttr | undefined,
  setTarget: (w: WindowAttr) => void,
  canvasInfo: CanvasInfo
];

interface Payload {
  kind: "active" | "move" | "destroy";
  hwnd: number;
}

const isAllowedAccess = (hwnd: number, accessable_windows: WinInfo[]) => {
  return accessable_windows.map((w) => w.hwnd).includes(hwnd);
};

const summonWindow = async (
  hwnd: number,
  accessable_windows: WinInfo[],
  pos: { x: number; y: number },
  wh: { width: number; height: number }
) => {
  if (!isAllowedAccess(hwnd, accessable_windows)) {
    return;
  }

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

export const ForceSummonWindow = async (
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

const tryAutoSummon = async (
  e: Event<Payload>,
  cnfg: Config,
  accessable_windows: WinInfo[]
) => {
  let winInfo;
  try {
    winInfo = await invoke<WinInfo>("get_window", {
      hwnd: e.payload.hwnd,
    });
  } catch {
    return;
  }

  if (!isAllowedAccess(winInfo.hwnd, accessable_windows)) {
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

  await summonWindow(
    e.payload.hwnd,
    accessable_windows,
    cnfg.summon_point,
    summonSize(cnfg)
  );
};

export const ManualSummonWindow = (
  hwnd: number,
  cnfg: Config,
  accessable_windows: WinInfo[]
) => {
  if (
    cnfg === undefined ||
    cnfg.summon_point === undefined ||
    cnfg.auto_summon_threshold === undefined ||
    cnfg.auto_summon_size === undefined
  ) {
    return;
  }

  summonWindow(hwnd, accessable_windows, cnfg.summon_point, summonSize(cnfg));

  setTimeout(async () => {
    await invoke("set_foreground", {
      hwnd,
    });
  }, 100);
};

const useAppState = (): useAppStateRes => {
  const [
    frames,
    updateFrames,
    targetForceRefresh,
    target,
    setTarget,
    canvasInfo,
  ] = useFrames();
  const [appWH, setAppWH] = useState<undefined[]>([undefined]); // resize イベント用のダミー
  const [config, configMethods] = useConfig();
  const unlisten = useRef<(() => void) | undefined>(undefined);

  const setListenFunc = async (cnfg: Config) => {
    /*
    if (unlisten.current !== undefined) {
      unlisten.current?.();
    }
    */
    const accessable_windows =
      frames?.windows
        .flatMap((w) => (w.is_visible ? [w] : []))
        .map((w) => w.original) ?? [];

    const unlstn = await listen<Payload>("update", async (e) => {
      await tryAutoSummon(e, cnfg, accessable_windows);
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
      await updateFrames();
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
        // console.log("setListenFunc");
        await setListenFunc(config);
      }
    })();
  }, [config]);

  frames?.windows.forEach((w) => {
    const name_incld = config?.nameFilter.has(w.original.title) ?? false;
    const exe_name_incld =
      config?.exeNameFilter.has(w.original.exe_name ?? "-") ?? false;
    w.is_visible = !(name_incld || exe_name_incld);
  });

  return [
    frames,
    config,
    configMethods,
    updateFrames,
    targetForceRefresh,
    target,
    setTarget,
    canvasInfo,
  ];
};

export default useAppState;
