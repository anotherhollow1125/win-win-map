import { useState, useEffect, useRef } from "react";
import { IntegratedFrameProps } from "@/components/IntegratedFrame";
import fetchObjects from "@/fetch-objects";
import { listen } from "@tauri-apps/api/event";
import useConfig from "@/hooks/config_hook";
import { Config, ConfigMethods } from "@/hooks/config_hook";

type useAppStateRes = [
  IntegratedFrameProps | undefined,
  Config | undefined,
  ConfigMethods
];

const useAppState = (): useAppStateRes => {
  const [frames, setFrames] = useState<IntegratedFrameProps | undefined>(
    undefined
  );
  const [appWH, setAppWH] = useState<undefined[]>([undefined]); // resize イベント用のダミー
  const [config, configMethods] = useConfig();

  const updateFunc = async () => {
    const frames = await fetchObjects();
    setFrames(frames);
  };

  useEffect(() => {
    (async () => {
      updateFunc();
      const _unlisten = listen("update", updateFunc);
    })();
    window.addEventListener("resize", () => {
      setAppWH([undefined]);
    });
  }, []);

  useEffect(() => {
    updateFunc();
  }, [appWH]);

  return [frames, config, configMethods];
};

export default useAppState;
