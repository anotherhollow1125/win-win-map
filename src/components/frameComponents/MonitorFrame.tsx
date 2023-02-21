export interface MonitorFrameProps {
  width: number;
  height: number;
  left: number;
  top: number;
}

export const MonitorFrame = (props: MonitorFrameProps) => {
  return <div className="object child monitor" style={props}></div>;
};

export default MonitorFrame;
