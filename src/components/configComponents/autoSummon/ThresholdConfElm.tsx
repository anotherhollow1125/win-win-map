import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import { Config, ConfigMethods } from "@/hooks/config-hook";

export interface AutoSummonThresholdConfElmProps {
  config: Config;
  configMethods: ConfigMethods;
}

interface TLRB {
  top: number;
  left: number;
  right: number;
  bottom: number;
}

const confWrap = (config: Config): TLRB => {
  return {
    top: config.auto_summon_threshold?.top ?? 0,
    left: config.auto_summon_threshold?.left ?? 0,
    right: config.auto_summon_threshold?.right ?? 0,
    bottom: config.auto_summon_threshold?.bottom ?? 0,
  };
};

const AutoSummonThresholdConfElm = ({
  config,
  configMethods,
}: AutoSummonThresholdConfElmProps) => {
  return (
    <Grid container spacing={2}>
      <Grid item xs={3}>
        <TextField
          label="Left"
          value={config.auto_summon_threshold?.left ?? 0}
          size="small"
          onChange={(e) => {
            configMethods.setAutoSummonThreshold({
              ...confWrap(config),
              left: Number(e.target.value),
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
          label="Top"
          value={config.auto_summon_threshold?.top ?? 0}
          size="small"
          onChange={(e) => {
            configMethods.setAutoSummonThreshold({
              ...confWrap(config),
              top: Number(e.target.value),
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
          label="Right"
          value={config.auto_summon_threshold?.right ?? 0}
          size="small"
          onChange={(e) => {
            configMethods.setAutoSummonThreshold({
              ...confWrap(config),
              right: Number(e.target.value),
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
          label="Bottom"
          value={config.auto_summon_threshold?.bottom ?? 0}
          size="small"
          onChange={(e) => {
            configMethods.setAutoSummonThreshold({
              ...confWrap(config),
              bottom: Number(e.target.value),
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

export default AutoSummonThresholdConfElm;
