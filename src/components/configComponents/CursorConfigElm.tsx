import TextField from "@mui/material/TextField";
import { Config, ConfigMethods } from "@/hooks/config-hook";
import { IconButton } from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import { constructShortcut } from "@/util";
// import MouseIcon from "@mui/icons-material/Mouse";

interface CursorConfigElmProps {
  config: Config;
  configMethods: ConfigMethods;
}

const CursorConfigElm = ({ config, configMethods }: CursorConfigElmProps) => {
  const handleShortcut = async (e: React.KeyboardEvent<HTMLDivElement>) => {
    const shortcut = constructShortcut(e);
    configMethods.setSummonMouseCursorShortcut(shortcut);
  };

  const resetShortcut = () => {
    configMethods.setSummonMouseCursorShortcut("");
  };

  return (
    <>
      <TextField
        label="Cursor Summon Shortcut"
        variant="outlined"
        value={config.summon_mouse_cursor_shortcut ?? ""}
        onKeyDown={handleShortcut}
        inputProps={{
          sx: { boxShadow: 0 },
        }}
        InputProps={{
          sx: { boxShadow: 0 },
          endAdornment: (
            <IconButton onClick={resetShortcut} sx={{ boxShadow: 0 }}>
              <ClearIcon />
            </IconButton>
          ),
        }}
      />
    </>
  );
};

export default CursorConfigElm;
