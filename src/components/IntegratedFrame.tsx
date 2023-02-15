import WindowFrame from "@/components/WindowFrame";
import { WindowFrameProps } from "@/components/WindowFrame";
import MonitorFrame from "@/components/MonitorFrame";
import { MonitorFrameProps } from "@/components/MonitorFrame";

export interface IntegratedFrameProps {
  width: number;
  height: number;
  monitors: MonitorFrameProps[];
  windows: WindowFrameProps[];
}

export default function FrameManager({
  width,
  height,
  monitors,
  windows,
}: IntegratedFrameProps) {
  return (
    <div className="object base" style={{ width: width, height: height }}>
      {monitors.map((monitor, index) => {
        return <MonitorFrame key={index} {...monitor} />;
      })}
      {windows.map((window, index) => {
        return <WindowFrame key={index} {...window} />;
      })}
    </div>
  );
}
