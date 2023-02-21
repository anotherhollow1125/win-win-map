import WindowFrame from "@/components/frameComponents/WindowFrame";
import { WindowFrameProps } from "@/components/frameComponents/WindowFrame";
import MonitorFrame from "@/components/frameComponents/MonitorFrame";
import { MonitorFrameProps } from "@/components/frameComponents/MonitorFrame";
import { FramesInfo } from "@/hooks/frame-hook";

export interface IntegratedFrameProps {
  framesInfo: FramesInfo;
  clickHandle: () => void;
}

const FrameManager = ({
  framesInfo: { width, height, monitors, windows },
  clickHandle,
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
        return <WindowFrame key={index} {...window} />;
      })}
    </div>
  );
};

export default FrameManager;
