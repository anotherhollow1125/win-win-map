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

export interface ThresholdRect {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export interface WH {
  width: number;
  height: number;
}

export interface Config {
  summon_mouse_cursor_shortcut: string | undefined;
  summon_point: { x: number; y: number } | undefined;
  auto_summon_enabled: boolean | undefined;
  auto_summon_threshold: ThresholdRect | undefined;
  auto_summon_size: WH | undefined;
  auto_summon_shortcut: string | undefined;
}

const DefaultConfig = () => {
  return {
    summon_mouse_cursor_shortcut: "",
    summon_point: { x: 0, y: 0 },
    auto_summon_enabled: false,
    auto_summon_threshold: {
      left: 0,
      top: 0,
      right: 0,
      bottom: 0,
    },
    auto_summon_size: {
      width: 0,
      height: 0,
    },
  } as Config;
};

export interface ConfigMethods {
  setSummonMouseCursorShortcut: (shortcut: string) => void;
  setSummonPoint: (point: { x: number; y: number }) => void;
  setAutoSummonEnabled: (enabled: boolean) => void;
  setAutoSummonThreshold: (threshold: ThresholdRect) => void;
  setAutoSummonSize: (size: WH) => void;
  setAutoSummonShortcut: (shortcut: string) => void;
  toggleShowMap: () => void;
}

type useConfigRes = [Config | undefined, ConfigMethods, boolean];

const useConfig = (): useConfigRes => {
  const [config, setConfig] = useState<Config | undefined>(undefined);
  const [showMap, setShowMap] = useState<boolean>(true);
  const initializeAsyncFn = useRef<(() => Promise<void>) | undefined>(
    undefined
  );

  const setSummonMouseCursorShortcut = (shortcut: string) => {
    const c = config ?? DefaultConfig();
    c.summon_mouse_cursor_shortcut = shortcut;
    setConfig({ ...c });
  };

  const setSummonPoint = (point: { x: number; y: number }) => {
    const c = config ?? DefaultConfig();
    c.summon_point = point;
    setConfig({ ...c });
  };

  const setAutoSummonEnabled = (enabled: boolean) => {
    const c = config ?? DefaultConfig();
    c.auto_summon_enabled = enabled;
    setConfig({ ...c });
  };

  const setAutoSummonThreshold = (threshold: ThresholdRect) => {
    const c = config ?? DefaultConfig();
    c.auto_summon_threshold = threshold;
    setConfig({ ...c });
  };

  const setAutoSummonSize = (size: WH) => {
    const c = config ?? DefaultConfig();
    c.auto_summon_size = size;
    setConfig({ ...c });
  };

  const setAutoSummonShortcut = (shortcut: string) => {
    const c = config ?? DefaultConfig();
    c.auto_summon_shortcut = shortcut;
    setConfig({ ...c });
  };

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
          ...DefaultConfig(),
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

      // Cursor Summon Shortcut
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

      // Auto Summon Toggle Shortcut
      if (
        config.auto_summon_shortcut !== undefined &&
        config.auto_summon_shortcut !== ""
      ) {
        await register(config.auto_summon_shortcut, async () => {
          if (config.auto_summon_enabled === undefined) {
            return;
          }
          setAutoSummonEnabled(!config.auto_summon_enabled);
        });
      }
    })();
  }, [config]);

  return [
    config,
    {
      setSummonMouseCursorShortcut,
      setSummonPoint,
      setAutoSummonEnabled,
      setAutoSummonThreshold,
      setAutoSummonSize,
      setAutoSummonShortcut,
      toggleShowMap: () => setShowMap(!showMap),
    },
    showMap,
  ];
};

export default useConfig;
