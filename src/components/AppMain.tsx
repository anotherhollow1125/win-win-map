import IntegratedFrame from "@/components/IntegratedFrame";
import useAppState from "@/hooks/app_hook";
import { useEffect } from "react";
import CursorConfigElm from "@/components/CursorConfigElm";

function AppMain() {
  const [frames, config, configMethods] = useAppState();

  useEffect(() => {
    configMethods.setSummonPoint({ x: 100, y: 100 });
  }, []);

  return (
    <>
      {frames ? <IntegratedFrame {...frames} /> : <>Loading...</>}
      {config ? (
        <CursorConfigElm config={config} configMethods={configMethods} />
      ) : (
        <>Loading...</>
      )}
    </>
  );
}

export default AppMain;
