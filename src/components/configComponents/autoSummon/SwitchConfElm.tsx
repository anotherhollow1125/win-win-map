import { Config, ConfigMethods } from "@/hooks/config-hook";
import Switch from "@mui/material/Switch";

export interface AutoSummonSwitchElmProps {
  config: Config;
  configMethods: ConfigMethods;
}

const AutoSummonSwitchElm = ({
  config,
  configMethods,
}: AutoSummonSwitchElmProps) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    configMethods.setAutoSummonEnabled(event.target.checked);
  };

  return (
    <>
      {"Auto Summon: "}
      <Switch checked={config.auto_summon_enabled} onChange={handleChange} />
    </>
  );
};

export default AutoSummonSwitchElm;
