import IntegratedFrame from "@/components/frameComponents/IntegratedFrame";
import useAppState from "@/hooks/app-hook";
import ConfigElm from "@/components/configComponents/ConfigElm";
import ListComponent from "@/components/listComponents/ListComponent";
import { useMediaQuery } from "@mui/material";
import { Box } from "@mui/system";

const AppMain = () => {
  const [
    framesInfo,
    config,
    configMethods,
    updateFrames,
    tagetForceRefresh,
    target,
    setTarget,
    dragState,
    setDragState,
    canvasInfo,
  ] = useAppState();
  const isMobile = useMediaQuery("(max-width: 600px)");
  const isPC = !isMobile;

  return (
    <>
      <Box
        className="mapZone"
        sx={{ position: config?.opened ?? false ? "static" : "sticky" }}
      >
        {config !== undefined && config.showMap && isPC && framesInfo ? (
          <IntegratedFrame
            framesInfo={framesInfo}
            forceUpdate={() =>
              tagetForceRefresh(target?.original.hwnd, framesInfo.windows)
            }
            target={target}
            dragState={dragState}
            setDragState={setDragState}
            canvasInfo={canvasInfo}
            config={config}
          />
        ) : (
          <></>
        )}
        {config ? (
          <ConfigElm config={config} configMethods={configMethods} />
        ) : (
          <>Loading...</>
        )}
      </Box>
      {isPC && framesInfo && config ? (
        <ListComponent
          windows={framesInfo.windows}
          config={config}
          configMethods={configMethods}
          target_hwnd={target?.original.hwnd}
          setTarget={setTarget}
          accessable_windows={framesInfo.windows.map((w) => w.original)}
        />
      ) : (
        <></>
      )}
    </>
  );
};

export default AppMain;
