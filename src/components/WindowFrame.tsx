export interface WindowFrameProps {
  width: number;
  height: number;
  left: number;
  top: number;
}

export default function WindowFrame(props: WindowFrameProps) {
  return <div className="object child window" style={props}></div>;
}
