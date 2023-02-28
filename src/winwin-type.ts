export interface WinInfo {
  hwnd: number;
  title: string;
  left: number;
  top: number;
  width: number;
  height: number;
  is_foreground: boolean;
}

export interface Rect {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export interface Canvas {
  min_x: number;
  min_y: number;
  max_x: number;
  max_y: number;
  monitors: Rect[];
}
