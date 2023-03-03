import { invoke } from "@tauri-apps/api/tauri";
import { WinInfo, Canvas } from "@/winwin-type";
import { FramesInfo } from "@/hooks/frame-hook";

// ハードコードでごめん...
const margin = 8;

export const calcScale = (
  width: number,
  height: number,
  appWidth: number,
  appHeight: number
): { scale: number; w_is_larger: boolean } => {
  const x_scale = width / (appWidth - margin * 2);
  const y_scale = height / (appHeight - margin * 2);
  const w_is_larger = width > height;
  const scale = width > height ? x_scale : y_scale;
  return { scale, w_is_larger };
};

export const fetchObjects = async (): Promise<FramesInfo> => {
  const canvas = await invoke<Canvas>("get_canvas");
  const { scale } = calcScale(
    canvas.max_x - canvas.min_x,
    canvas.max_y - canvas.min_y,
    document.body.clientWidth,
    document.body.clientHeight
  );

  const monitors = [
    ...canvas.monitors.map((rect) => {
      return {
        left: (rect.left - canvas.min_x) / scale,
        top: (rect.top - canvas.min_y) / scale,
        width: (rect.right - rect.left) / scale,
        height: (rect.bottom - rect.top) / scale,
      };
    }),
  ];

  const thread_windows_hwnds = await (
    await invoke<WinInfo[]>("get_thread_windows")
  ).map((w) => w.hwnd);
  // console.log("thread_windows_raw", thread_windows_raw);

  const windows_raw = await invoke<WinInfo[]>("get_windows");
  // console.log("windows_raw", windows_raw);

  const windows = windows_raw.map((w) => {
    return {
      left: (w.left - canvas.min_x) / scale,
      top: (w.top - canvas.min_y) / scale,
      width: w.width / scale,
      height: w.height / scale,
      is_relative: thread_windows_hwnds.includes(w.hwnd),
      original: w,
      is_visible: true,
    };
  });

  return {
    width: (canvas.max_x - canvas.min_x) / scale,
    height: (canvas.max_y - canvas.min_y) / scale,
    monitors: monitors,
    windows: [...windows],
  };
};

export default fetchObjects;
