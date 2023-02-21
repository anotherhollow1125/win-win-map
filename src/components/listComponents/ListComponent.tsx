import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import { WinInfo } from "@/winwin-type";
import FrameRowComponent from "@/components/listComponents/FrameRowComponent";
import { Config } from "@/hooks/config-hook";

interface ListComponentProps {
  windows: WinInfo[];
  config: Config;
}

const ListComponent = ({ windows, config }: ListComponentProps) => {
  return (
    <List>
      {windows.map((window) => (
        <ListItem key={window.hwnd}>
          <FrameRowComponent window={window} config={config} />
        </ListItem>
      ))}
    </List>
  );
};

export default ListComponent;
