import TextField from "@mui/material/TextField";
import { Config, ConfigMethods } from "@/hooks/config-hook";
import Grid from "@mui/material/Grid";

export interface SummonPosConfElmProps {
  config: Config;
  configMethods: ConfigMethods;
}

const SummonPosConfElm = ({ config, configMethods }: SummonPosConfElmProps) => {
  return (
    <Grid container spacing={2} alignItems="center">
      <Grid item xs={4}>
        {"Summon Pos: "}
      </Grid>
      <Grid item xs={3}>
        <TextField
          label="X"
          value={config.summon_point?.x ?? 0}
          size="small"
          onChange={(e) => {
            configMethods.setSummonPoint({
              x: Number(e.target.value),
              y: config.summon_point?.y ?? 0,
            });
          }}
          inputProps={{
            step: 1,
            type: "number",
          }}
        />
      </Grid>
      <Grid item xs={3}>
        <TextField
          label="Y"
          value={config.summon_point?.y ?? 0}
          size="small"
          onChange={(e) => {
            configMethods.setSummonPoint({
              x: config.summon_point?.x ?? 0,
              y: Number(e.target.value),
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

export default SummonPosConfElm;
