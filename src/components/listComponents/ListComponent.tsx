import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import { WinInfo } from "@/winwin-type";
import FrameRowComponent from "@/components/listComponents/FrameRowComponent";
import { Config, ConfigMethods } from "@/hooks/config-hook";
import { WindowAttr } from "@/hooks/frame-hook";

interface ListComponentProps {
  windows: WindowAttr[];
  config: Config;
  configMethods: ConfigMethods;
  target_hwnd: number | undefined;
  setTarget: (w: WindowAttr) => void;
  accessable_windows: WinInfo[];
}

const ListComponent = ({
  windows,
  config,
  configMethods,
  target_hwnd: target,
  setTarget,
  accessable_windows,
}: ListComponentProps) => {
  windows.sort((a, b) => {
    if (a.original.hwnd === target) {
      return -1;
    } else if (b.original.hwnd === target) {
      return 1;
    }

    if (a.is_visible && !b.is_visible) {
      return -1;
    } else if (!a.is_visible && b.is_visible) {
      return 1;
    }

    return 0;
  });

  return (
    <List>
      {windows.map((window) => (
        <ListItem key={window.original.hwnd}>
          <FrameRowComponent
            window={window}
            config={config}
            configMethods={configMethods}
            target={target}
            setTarget={setTarget}
            accessable_windows={accessable_windows}
          />
        </ListItem>
      ))}
    </List>
  );
};

export default ListComponent;
