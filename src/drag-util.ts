import { CanvasInfo } from "@/hooks/frame-hook";
import { Config } from "@/hooks/config-hook";
import { WinInfo } from "@/winwin-type";
import { ForceSummonWindow } from "@/hooks/app-hook";

const rawPos2Pos = (
  raw_pos: { x: number; y: number },
  canvasInfo: CanvasInfo
) => {
  if (canvasInfo.canvas === undefined || canvasInfo.scale === undefined) {
    return raw_pos;
  }

  const x = Math.round(raw_pos.x * canvasInfo.scale + canvasInfo.canvas.min_x);
  const y = Math.round(raw_pos.y * canvasInfo.scale + canvasInfo.canvas.min_y);

  return { x, y };
};

const checkTermInMonitor = (
  pos: { x: number; y: number },
  canvasInfo: CanvasInfo,
  config: Config
): boolean => {
  const { x, y } = pos;

  if (canvasInfo.canvas === undefined) {
    return false;
  }

  for (const monitor of canvasInfo.canvas.monitors) {
    const left = monitor.left + config.dragTermMargin;
    const top = monitor.top + config.dragTermMargin;
    const right = monitor.right - config.dragTermMargin;
    const bottom = monitor.bottom - config.dragTermMargin;

    if (left <= x && top <= y && x <= right && y <= bottom) {
      return true;
    }
  }

  return false;
};

export const tryDragMove = async (
  window: WinInfo,
  raw_pos: { x: number; y: number },
  canvasInfo: CanvasInfo,
  config: Config
): Promise<boolean> => {
  const pos = rawPos2Pos(raw_pos, canvasInfo);

  if (!checkTermInMonitor(pos, canvasInfo, config)) {
    return false;
  }

  await ForceSummonWindow(window.hwnd, pos, {
    width: window.width,
    height: window.height,
  });

  return true;
};
