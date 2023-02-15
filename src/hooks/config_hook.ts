import { useState, useEffect, useRef } from "react";
import {
  readTextFile,
  writeTextFile,
  exists,
  createDir,
  BaseDirectory,
} from "@tauri-apps/api/fs";
import { register, unregisterAll } from "@tauri-apps/api/globalShortcut";
import { invoke } from "@tauri-apps/api/tauri";

export interface Config {
  summon_mouse_cursor_shortcut: string | undefined;
  summon_point: { x: number; y: number } | undefined;
}

const DefaultConfig = () => {
  return {
    summon_mouse_cursor_shortcut: undefined,
    summon_point: { x: 0, y: 0 },
  } as Config;
};

export interface ConfigMethods {
  setSummonMouseCursorShortcut: (shortcut: string) => void;
  setSummonPoint: (point: { x: number; y: number }) => void;
}

type useConfigRes = [Config | undefined, ConfigMethods];

const useConfig = (): useConfigRes => {
  const [config, setConfig] = useState<Config | undefined>(undefined);
  const initializeAsyncFn = useRef<(() => Promise<void>) | undefined>(
    undefined
  );

  useEffect(() => {
    if (initializeAsyncFn.current !== undefined) {
      return;
    }

    initializeAsyncFn.current = async () => {
      try {
        const profileBookStr = await readTextFile("config.json", {
          dir: BaseDirectory.AppConfig,
        });
        const config = JSON.parse(profileBookStr) as Config;
        setConfig(config);
      } catch (error) {
        console.warn(error);
        setConfig({
          summon_mouse_cursor_shortcut: undefined,
          summon_point: { x: 0, y: 0 },
        });
      }

      console.log("Config initialized");
    };
    initializeAsyncFn.current();
  }, []);

  useEffect(() => {
    if (config === undefined) {
      return;
    }

    (async () => {
      // file save
      const ext = await exists("", { dir: BaseDirectory.AppConfig });
      if (!ext) {
        await createDir("", { dir: BaseDirectory.AppConfig });
      }

      await writeTextFile("config.json", JSON.stringify(config), {
        dir: BaseDirectory.AppConfig,
      });

      // register shortcut
      await unregisterAll();

      if (
        config.summon_mouse_cursor_shortcut !== undefined &&
        config.summon_mouse_cursor_shortcut !== ""
      ) {
        await register(config.summon_mouse_cursor_shortcut, async () => {
          if (config.summon_point === undefined) {
            return;
          }
          await invoke("set_cursor_pos", config.summon_point);
        });
      }
    })();
  }, [config]);

  const setMouseCursorSummonShortcut = (shortcut: string) => {
    const c = config ?? DefaultConfig();
    c.summon_mouse_cursor_shortcut = shortcut;
    setConfig({ ...c });
  };

  const setSummonPoint = (point: { x: number; y: number }) => {
    const c = config ?? DefaultConfig();
    c.summon_point = point;
    setConfig({ ...c });
  };

  return [
    config,
    {
      setSummonMouseCursorShortcut: setMouseCursorSummonShortcut,
      setSummonPoint,
    },
  ];
};

export default useConfig;
