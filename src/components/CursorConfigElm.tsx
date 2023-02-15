import TextField from "@mui/material/TextField";
import { Config, ConfigMethods } from "@/hooks/config_hook";
import { IconButton } from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
// import MouseIcon from "@mui/icons-material/Mouse";

interface CursorConfigElmProps {
  config: Config;
  configMethods: ConfigMethods;
}

function CursorConfigElm({ config, configMethods }: CursorConfigElmProps) {
  const handleShortcut = async (e: React.KeyboardEvent<HTMLDivElement>) => {
    const shortcut_list = [];
    if (e.altKey) {
      shortcut_list.push("Alt");
    }
    if (e.ctrlKey) {
      shortcut_list.push("Control");
    }
    if (e.shiftKey) {
      shortcut_list.push("Shift");
    }
    /*
    if (e.metaKey) {
      shortcut_list.push("Meta");
    }
    */

    if (shortcut_list.indexOf(e.key) == -1) {
      shortcut_list.push(e.key);
    }

    const shortcut = shortcut_list.join("+");
    configMethods.setSummonMouseCursorShortcut(shortcut);
  };

  const resetShortcut = () => {
    configMethods.setSummonMouseCursorShortcut("");
  };

  return (
    <>
      <TextField
        label="Mouse Cursor Summon"
        variant="outlined"
        value={config.summon_mouse_cursor_shortcut}
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
}

export default CursorConfigElm;
