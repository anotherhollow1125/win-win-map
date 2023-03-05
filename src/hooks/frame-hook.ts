import { useState } from "react";
import fetchObjects from "@/fetch-objects";
import { WinInfo } from "@/winwin-type";

import { Canvas } from "@/winwin-type";

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

export interface CanvasInfo {
  canvas: Canvas | undefined;
  scale: number | undefined;
}

type useFrameRes = [
  frames: FramesInfo | undefined,
  updateFrames: () => Promise<void>,
  targetForceRefresh: (
    targettingHwnd: number | undefined,
    windows: WindowAttr[]
  ) => void,
  target: WindowAttr | undefined,
  setTarget: (target: WindowAttr) => void,
  canvasInfo: CanvasInfo
];

const useFrame = (): useFrameRes => {
  const [frames, setFrames] = useState<FramesInfo | undefined>(undefined);
  const [target, setTargetInner] = useState<WindowAttr | undefined>(undefined);
  const [canvas, setCanvas] = useState<Canvas | undefined>(undefined);
  const [scale, setScale] = useState<number | undefined>(undefined);

  const setTarget = (w: WindowAttr | undefined) => {
    if (w === undefined) {
      setTargetInner(undefined);
      return;
    }

    if (w.is_relative) {
      return;
    }

    setTargetInner({ ...w });
  };

  const updateFrames = async () => {
    const [frames, cnvs, scl] = await fetchObjects();

    const newTarget = frames.windows.find((w) => w.original.is_foreground);
    setTarget(newTarget);

    setFrames(frames);
    setCanvas(cnvs);
    setScale(scl);
  };

  const targetForceRefresh = async (
    targettingHwnd: number | undefined,
    windows: WindowAttr[]
  ) => {
    const [frames, cnvs, scl] = await fetchObjects();

    const newTarget = frames.windows.find(
      (w) => targettingHwnd !== undefined && w.original.hwnd == targettingHwnd
    );
    setTarget(newTarget);

    setFrames(frames);
    setCanvas(cnvs);
    setScale(scl);
  };

  return [
    frames,
    updateFrames,
    targetForceRefresh,
    target,
    setTarget,
    { canvas, scale },
  ];
};

export default useFrame;
