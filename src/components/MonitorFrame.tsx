export interface MonitorFrameProps {
  width: number;
  height: number;
  left: number;
  top: number;
}

export default function MonitorFrame(props: MonitorFrameProps) {
  return <div className="object child monitor" style={props}></div>;
}
