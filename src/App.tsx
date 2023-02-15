import "./App.css";
import AppMain from "@/components/AppMain";
import { useMemo } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

function App() {
  // https://amateur-engineer.com/react-mui-dark-mode/
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: prefersDarkMode ? "dark" : "light",
        },
      }),
    [prefersDarkMode]
  );

  return (
    <ThemeProvider theme={theme}>
      <AppMain />
    </ThemeProvider>
  );
}

export default App;
