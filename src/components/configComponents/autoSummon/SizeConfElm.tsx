import Grid from "@mui/material/Grid";
import { Config, ConfigMethods } from "@/hooks/config-hook";
import TextField from "@mui/material/TextField";

interface AutoSummonSizeConfElmProps {
  config: Config;
  configMethods: ConfigMethods;
}

const AutoSummonSizeConfElm = ({
  config,
  configMethods,
}: AutoSummonSizeConfElmProps) => {
  return (
    <Grid container spacing={2}>
      <Grid item xs={6}>
        <TextField
          label="Width"
          value={config.auto_summon_size?.width ?? 0}
          size="small"
          onChange={(e) => {
            configMethods.setAutoSummonSize({
              width: Number(e.target.value),
              height: config.auto_summon_size?.height ?? 0,
            });
          }}
          inputProps={{
            step: 1,
            type: "number",
          }}
        />
      </Grid>
      <Grid item xs={6}>
        <TextField
          label="Height"
          value={config.auto_summon_size?.height ?? 0}
          size="small"
          onChange={(e) => {
            configMethods.setAutoSummonSize({
              width: config.auto_summon_size?.width ?? 0,
              height: Number(e.target.value),
            });
          }}
          inputProps={{
            step: 1,
            type: "number",
          }}
        />
      </Grid>
    </Grid>
  );
};

export default AutoSummonSizeConfElm;
