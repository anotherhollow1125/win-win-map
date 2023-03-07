import WindowFrame from "@/components/frameComponents/WindowFrame";
import MonitorFrame from "@/components/frameComponents/MonitorFrame";
import { FramesInfo, CanvasInfo } from "@/hooks/frame-hook";
import Draggable from "react-draggable";
import { useRef, useState, useEffect } from "react";
import { tryDragMove } from "@/drag-util";
import { Config } from "@/hooks/config-hook";
import { WindowAttr } from "@/hooks/frame-hook";
import { useSelector, useDispatch } from "react-redux";
import { setDragging, setIdling, DragState } from "@/app-store";

export interface IntegratedFrameProps {
  framesInfo: FramesInfo;
  forceUpdate: () => void;
  target: WindowAttr | undefined;
  canvasInfo: CanvasInfo;
  config: Config;
  setTarget: (w: WindowAttr) => void;
}

const FrameManager = ({
  framesInfo: { width, height, monitors, windows },
  forceUpdate,
  target,
  canvasInfo,
  config,
  setTarget,
}: IntegratedFrameProps) => {
  const targetNodeRef = useRef(null);
  const [targetPos, setTargetPos] = useState({ x: 0, y: 0 });
  const dragState = useSelector((state: DragState) => state.dragState.state);
  const dispatch = useDispatch();

  useEffect(() => {
    if (target) {
      const newPos = { x: target.left, y: target.top };
      setTargetPos(newPos);
    }
  }, [target]);

  const targetFrame = target ? (
    <Draggable
      nodeRef={targetNodeRef}
      axis="both"
      position={targetPos}
      bounds={{ left: 0, top: 0, right: width, bottom: height }}
      onStart={() => {
        // dragState.current = "dragging";
        dispatch(setDragging());
      }}
      onStop={(_e, data) => {
        const pos = { x: data.x, y: data.y };
        tryDragMove(target.original, pos, canvasInfo, config).then((res) => {
          // 動機ズレ防止
          setTimeout(() => {
            forceUpdate();
            // dragState.current = "idling";
            dispatch(setIdling());
          }, 100);
        });
      }}
      onDrag={(_e, data) => {
        const { x, y } = data;
        setTargetPos({ x, y });
        const pos = { x: data.x, y: data.y };
        tryDragMove(target.original, pos, canvasInfo, config);
      }}
    >
      <div ref={targetNodeRef}>
        <WindowFrame
          is_target={true}
          is_active={target.original.is_foreground}
          {...target}
          left={0}
          top={0}
          onClick={() => {}}
        />
      </div>
    </Draggable>
  ) : (
    <></>
  );

  return (
    <>
      <div
        className="object base"
        style={{ width: width, height: height }}
        onClick={(_e) => forceUpdate()}
      >
        <>
          {monitors.map((monitor, index) => {
            return <MonitorFrame key={index} {...monitor} />;
          })}
          {windows.flatMap((window, index) => {
            const is_target =
              target?.original.hwnd === window.original.hwnd ?? false;
            return window.is_visible && !is_target
              ? [
                  <WindowFrame
                    key={index}
                    is_target={false}
                    is_active={window.original.is_foreground}
                    {...window}
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      if (window.original.hwnd === target?.original.hwnd) {
                        return;
                      }
                      setTarget(window);
                    }}
                  />,
                ]
              : [];
          })}
        </>
        {targetFrame}
      </div>
    </>
  );
};

export default FrameManager;
