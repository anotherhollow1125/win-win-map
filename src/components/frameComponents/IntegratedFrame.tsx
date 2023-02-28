import WindowFrame from "@/components/frameComponents/WindowFrame";
import { WindowFrameProps } from "@/components/frameComponents/WindowFrame";
import MonitorFrame from "@/components/frameComponents/MonitorFrame";
import { MonitorFrameProps } from "@/components/frameComponents/MonitorFrame";
import { FramesInfo } from "@/hooks/frame-hook";

export interface IntegratedFrameProps {
  framesInfo: FramesInfo;
  clickHandle: () => void;
  target_hwnd?: number;
}

const FrameManager = ({
  framesInfo: { width, height, monitors, windows },
  clickHandle,
  target_hwnd,
}: IntegratedFrameProps) => {
  return (
    <div
      className="object base"
      style={{ width: width, height: height }}
      onClick={(_e) => clickHandle()}
    >
      {monitors.map((monitor, index) => {
        return <MonitorFrame key={index} {...monitor} />;
      })}
      {windows.map((window, index) => {
        return (
          <WindowFrame
            key={index}
            is_target={
              target_hwnd ? target_hwnd === window.original.hwnd : false
            }
            is_active={window.original.is_foreground}
            {...window}
          />
        );
      })}
    </div>
  );
};

export default FrameManager;
