export interface WindowFrameProps {
  width: number;
  height: number;
  left: number;
  top: number;
  is_target: boolean;
  is_active: boolean;
  onClick: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}

const WindowFrame = (props: WindowFrameProps) => {
  return (
    <div
      className={`object child window ${props.is_active ? "active" : ""} ${
        props.is_target ? "target" : ""
      }`}
      style={props}
      onClick={props.onClick}
    ></div>
  );
};

export default WindowFrame;
