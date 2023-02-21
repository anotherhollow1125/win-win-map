import IntegratedFrame from "@/components/frameComponents/IntegratedFrame";
import useAppState from "@/hooks/app-hook";
import ConfigElm from "@/components/configComponents/ConfigElm";
import ListComponent from "@/components/listComponents/ListComponent";
import { useMediaQuery } from "@mui/material";

const AppMain = () => {
  const [framesInfo, config, configMethods, updateFrames] = useAppState();
  const isMobile = useMediaQuery("(max-width: 600px)");
  const isPC = !isMobile;

  return (
    <>
      {isPC && framesInfo ? (
        <IntegratedFrame
          framesInfo={framesInfo}
          clickHandle={() => updateFrames()}
        />
      ) : (
        <></>
      )}
      {config ? (
        <ConfigElm config={config} configMethods={configMethods} />
      ) : (
        <>Loading...</>
      )}
      {isPC && framesInfo && config ? (
        (() => {
          const windows = framesInfo.windows.map((w) => w.original);
          return <ListComponent windows={windows} config={config} />;
        })()
      ) : (
        <></>
      )}
    </>
  );
};

export default AppMain;
