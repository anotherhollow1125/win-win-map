import { useState } from "react";
import fetchObjects from "@/fetch-objects";
import { WinInfo } from "@/winwin-type";

export interface MonitorAttr {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface WindowAttr {
  left: number;
  top: number;
  width: number;
  height: number;
  is_relative: boolean;
  original: WinInfo; // YAGNI原則的には良くないけど表示用にオリジナルの情報をすべて残したいというモチベーション
  is_visible: boolean;
}

export interface FramesInfo {
  width: number;
  height: number;
  monitors: MonitorAttr[];
  windows: WindowAttr[];
}

export interface SetTargetProps {
  is_relative: boolean;
  hwnd: number;
}

type useFrameRes = [
  frames: FramesInfo | undefined,
  updateFrames: () => Promise<void>,
  target: number | undefined,
  setTarget: (target: SetTargetProps) => void
];

const useFrame = (): useFrameRes => {
  const [frames, setFrames] = useState<FramesInfo | undefined>(undefined);
  const [target, setTargetInner] = useState<number | undefined>(undefined);

  const setTarget = (w: SetTargetProps) => {
    if (!w.is_relative) {
      setTargetInner(w.hwnd);
    }
  };

  const updateFrames = async () => {
    const frames = await fetchObjects();

    frames.windows.forEach((w) => {
      // 状況的にここのsetTargetと外でのsetTargetが競合することはないはず
      if (w.original.is_foreground) {
        setTarget({ is_relative: w.is_relative, hwnd: w.original.hwnd });
      }
    });

    setFrames(frames);
  };

  return [frames, updateFrames, target, setTarget];
};

export default useFrame;
