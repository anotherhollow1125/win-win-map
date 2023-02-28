import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import { WinInfo } from "@/winwin-type";
import FrameRowComponent from "@/components/listComponents/FrameRowComponent";
import { Config } from "@/hooks/config-hook";
import { WindowAttr, SetTargetProps } from "@/hooks/frame-hook";

interface ListComponentProps {
  windows: WindowAttr[];
  config: Config;
  target: number | undefined;
  setTarget: (w: SetTargetProps) => void;
}

const ListComponent = ({
  windows,
  config,
  target,
  setTarget,
}: ListComponentProps) => {
  return (
    <List>
      {windows.map((window) => (
        <ListItem key={window.original.hwnd}>
          <FrameRowComponent
            window={window}
            config={config}
            target={target}
            setTarget={setTarget}
          />
        </ListItem>
      ))}
    </List>
  );
};

export default ListComponent;
