import { WinInfo } from "@/winwin-type";
import { Grid } from "@mui/material";
import { ManualSummonWindow } from "@/hooks/app-hook";
import IconButton from "@mui/material/IconButton";
import MoveUpIcon from "@mui/icons-material/MoveUp";
import { Config } from "@/hooks/config-hook";
import { WindowAttr, SetTargetProps } from "@/hooks/frame-hook";
import { invoke } from "@tauri-apps/api";

interface FrameRowComponentProps {
  window: WindowAttr;
  config: Config;
  target: number | undefined;
  setTarget: (w: SetTargetProps) => void;
}

const FrameRowComponent = ({
  window,
  config,
  target,
  setTarget,
}: FrameRowComponentProps) => {
  return (
    <Grid container spacing={2} alignItems="center">
      <Grid item xs={1}>
        <IconButton
          onClick={() => {
            ManualSummonWindow(window.original.hwnd, config);
          }}
        >
          <MoveUpIcon />
        </IconButton>
      </Grid>
      <Grid
        item
        xs={11}
        onClick={() => {
          if (window.original.hwnd === target) {
            return;
          }
          console.log(
            `window.original.hwnd: ${window.original.hwnd}, target: ${target}`
          );
          setTarget({
            is_relative: window.is_relative,
            hwnd: window.original.hwnd,
          });
        }}
        onDoubleClick={() => {
          if (target === undefined) {
            return;
          }
          invoke("set_foreground", {
            hwnd: target,
          });
        }}
      >
        {window.original.title} {` (${window.original.hwnd})`}
      </Grid>
    </Grid>
  );
};

export default FrameRowComponent;
