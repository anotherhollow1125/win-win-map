import SwitchConfElm from "@/components/configComponents/autoSummon/SwitchConfElm";
import ThresholdConfElm from "@/components/configComponents/autoSummon/ThresholdConfElm";
import SizeConfElm from "@/components/configComponents/autoSummon/SizeConfElm";
import AutoSummonShortcutConfElm from "@/components/configComponents/autoSummon/ShortcutConfElm";
import Grid from "@mui/material/Grid";
import { Config, ConfigMethods } from "@/hooks/config-hook";

export interface AutoSummonConfElmProps {
  config: Config;
  configMethods: ConfigMethods;
}

const AutoSummonConfElm = ({
  config,
  configMethods,
}: AutoSummonConfElmProps) => {
  return (
    <Grid container spacing={2} alignItems="center">
      <Grid item xs={3}>
        <SwitchConfElm config={config} configMethods={configMethods} />
      </Grid>
      <Grid item xs={8}>
        <ThresholdConfElm config={config} configMethods={configMethods} />
      </Grid>
      <Grid item xs={6}>
        <SizeConfElm config={config} configMethods={configMethods} />
      </Grid>
      <Grid item xs={6}>
        <AutoSummonShortcutConfElm
          config={config}
          configMethods={configMethods}
        />
      </Grid>
    </Grid>
  );
};

export default AutoSummonConfElm;
