import TextField from "@mui/material/TextField";
import { Config, ConfigMethods } from "@/hooks/config-hook";
import { IconButton } from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import { constructShortcut } from "@/util";

interface AutoSummonShortcutConfElmProps {
  config: Config;
  configMethods: ConfigMethods;
}

const AutoSummonShortcutConfElm = ({
  config,
  configMethods,
}: AutoSummonShortcutConfElmProps) => {
  const handleShortcut = async (e: React.KeyboardEvent<HTMLDivElement>) => {
    const shortcut = constructShortcut(e);
    configMethods.setAutoSummonShortcut(shortcut);
  };

  const resetShortcut = () => {
    configMethods.setAutoSummonShortcut("");
  };

  return (
    <>
      <TextField
        label="AS Toggle Shortcut"
        variant="outlined"
        value={config.auto_summon_shortcut ?? ""}
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

export default AutoSummonShortcutConfElm;
