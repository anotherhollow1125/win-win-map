import { WinInfo } from "@/winwin-type";
import { Grid } from "@mui/material";
import { ManualSummonWindow } from "@/hooks/app-hook";
import IconButton from "@mui/material/IconButton";
import MoveUpIcon from "@mui/icons-material/MoveUp";
import { Config, ConfigMethods } from "@/hooks/config-hook";
import { WindowAttr } from "@/hooks/frame-hook";
import { invoke } from "@tauri-apps/api";
import Tooltip from "@mui/material/Tooltip";
import Box from "@mui/material/Box";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

interface FrameRowComponentProps {
  window: WindowAttr;
  config: Config;
  configMethods: ConfigMethods;
  target: number | undefined;
  setTarget: (w: WindowAttr) => void;
  accessable_windows: WinInfo[];
}

const FrameRowComponent = ({
  window,
  config,
  configMethods,
  target,
  setTarget,
  accessable_windows,
}: FrameRowComponentProps) => {
  const full_exe_name = window.original.exe_name ?? "-";
  const exe_name = full_exe_name.replace(/^.*?[\/\\]?([^\/\\]*?)$/, "$1");

  const title_eye = !config.nameFilter.has(window.original.title) ? (
    <IconButton
      onClick={() => {
        configMethods.addFilteredName(window.original.title);
      }}
    >
      <VisibilityIcon />
    </IconButton>
  ) : (
    <IconButton
      onClick={() => {
        configMethods.removeFilteredName(window.original.title);
      }}
    >
      <VisibilityOffIcon />
    </IconButton>
  );

  const exe_name_eye = !config.exeNameFilter.has(full_exe_name) ? (
    <IconButton
      onClick={() => {
        configMethods.addFilteredExeName(full_exe_name);
      }}
    >
      <VisibilityIcon />
    </IconButton>
  ) : (
    <IconButton
      onClick={() => {
        configMethods.removeFilteredExeName(full_exe_name);
      }}
    >
      <VisibilityOffIcon />
    </IconButton>
  );

  const enabledItem = (
    <Grid container spacing={2} alignItems="center">
      <Grid item xs={1}>
        <IconButton
          onClick={() => {
            ManualSummonWindow(
              window.original.hwnd,
              config,
              accessable_windows
            );
          }}
        >
          <MoveUpIcon />
        </IconButton>
      </Grid>
      <Grid
        item
        xs={5}
        onClick={() => {
          if (window.original.hwnd === target) {
            return;
          }
          setTarget(window);
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
      <Grid item xs={1}>
        {title_eye}
      </Grid>
      <Grid item xs={4}>
        <Tooltip title={window.original.exe_name}>
          <Box>{exe_name}</Box>
        </Tooltip>
      </Grid>
      <Grid item xs={1}>
        {exe_name_eye}
      </Grid>
    </Grid>
  );

  const disabledItem = (
    <Grid container spacing={2} alignItems="center" className="disabled">
      <Grid item xs={1}></Grid>
      <Grid item xs={5}>
        {window.original.title} {` (${window.original.hwnd})`}
      </Grid>
      <Grid item xs={1}>
        {title_eye}
      </Grid>
      <Grid item xs={4}>
        <Tooltip title={window.original.exe_name}>
          <Box>{exe_name}</Box>
        </Tooltip>
      </Grid>
      <Grid item xs={1}>
        {exe_name_eye}
      </Grid>
    </Grid>
  );

  return window.is_visible ? enabledItem : disabledItem;
};

export default FrameRowComponent;
