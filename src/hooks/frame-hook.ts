import { useState } from "react";
import fetchObjects from "@/fetch-objects";
import { WinInfo } from "@/winwin-type";

export interface FramesInfo {
  width: number;
  height: number;
  monitors: {
    left: number;
    top: number;
    width: number;
    height: number;
  }[];
  windows: {
    left: number;
    top: number;
    width: number;
    height: number;
    original: WinInfo;
  }[];
}

type useFrameRes = [
  frames: FramesInfo | undefined,
  updateFrames: () => Promise<void>
];

const useFrame = (): useFrameRes => {
  const [frames, setFrames] = useState<FramesInfo | undefined>(undefined);

  const updateFrames = async () => {
    const frames = await fetchObjects();
    setFrames(frames);
  };

  return [frames, updateFrames];
};

export default useFrame;
