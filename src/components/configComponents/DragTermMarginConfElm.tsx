import TextField from "@mui/material/TextField";
import { Config, ConfigMethods } from "@/hooks/config-hook";

interface DragTermMarginConfElmProps {
  config: Config;
  configMethods: ConfigMethods;
}

const DragTermMarginConfElm = ({
  config,
  configMethods,
}: DragTermMarginConfElmProps) => {
  return (
    <TextField
      label="Drag Term Margin"
      value={config.dragTermMargin}
      size="small"
      onChange={(e) => {
        configMethods.setDragTermMargin(Number(e.target.value));
      }}
      inputProps={{
        step: 1,
        type: "number",
      }}
    />
  );
};

export default DragTermMarginConfElm;
