export interface WindowFrameProps {
  width: number;
  height: number;
  left: number;
  top: number;
}

const WindowFrame = (props: WindowFrameProps) => {
  return <div className="object child window" style={props}></div>;
};

export default WindowFrame;
