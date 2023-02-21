import { WinInfo } from "@/winwin-type";
import { Grid } from "@mui/material";
import { ManualSummonWindow } from "@/hooks/app-hook";
import IconButton from "@mui/material/IconButton";
import MoveUpIcon from "@mui/icons-material/MoveUp";
import { Config } from "@/hooks/config-hook";

interface FrameRowComponentProps {
  window: WinInfo;
  config: Config;
}

const FrameRowComponent = ({ window, config }: FrameRowComponentProps) => {
  return (
    <Grid container spacing={2} alignItems="center">
      <Grid item xs={1}>
        <IconButton
          onClick={() => {
            ManualSummonWindow(window.hwnd, config);
          }}
        >
          <MoveUpIcon />
        </IconButton>
      </Grid>
      <Grid item xs={11}>
        {window.title} {` (${window.hwnd})`}
      </Grid>
    </Grid>
  );
};

export default FrameRowComponent;
