import { useState, useRef } from "react";
import fetchObjects from "@/fetch-objects";
import { WinInfo } from "@/winwin-type";

import { Canvas } from "@/winwin-type";
import { useDispatch } from "react-redux";
import { DragStateEnum, setHandle } from "@/app-store";

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
  const dispatch = useDispatch();
  const dragState = useRef<DragStateEnum>("idling");
  const dragStateChangeHandle = (st: DragStateEnum) => {
    dragState.current = st;
  };
  dispatch(setHandle(dragStateChangeHandle));

  const setTarget = (w: WindowAttr | undefined) => {
    if (w === undefined) {
      setTargetInner(undefined);
      return;
    }

    if (w.is_relative) {
      setTargetInner(undefined);
      return;
    }

    setTargetInner({ ...w });
  };

  const updateFrames = async () => {
    if (dragState.current !== "idling") {
      console.log("cannot update");
      return;
    }

    const [frames, cnvs, scl] = await fetchObjects();

    const newTarget = frames.windows.find((w) => w.original.is_foreground);
    const preTarget = frames.windows.find(
      (w) => target !== undefined && w.original.hwnd == target.original.hwnd
    );
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
