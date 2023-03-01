import TextField from "@mui/material/TextField";
import { Config, ConfigMethods } from "@/hooks/config-hook";
import { IconButton } from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import { constructShortcut } from "@/util";

interface ConfigElmProps {
  config: Config;
  configMethods: ConfigMethods;
}

const WinWinMapSummonConfElm = ({ config, configMethods }: ConfigElmProps) => {
  const handleShortcut = async (e: React.KeyboardEvent<HTMLDivElement>) => {
    const shortcut = constructShortcut(e);
    configMethods.setWinWinMapSummonShortcut(shortcut);
  };

  const resetShortcut = () => {
    configMethods.setWinWinMapSummonShortcut("");
  };

  return (
    <>
      <TextField
        label="WinWinMap Summon Shortcut"
        variant="outlined"
        value={config.winwinmap_summon_shortcut ?? ""}
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

export default WinWinMapSummonConfElm;
