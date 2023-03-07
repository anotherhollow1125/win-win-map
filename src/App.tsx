import "./App.css";
import AppMain from "@/components/AppMain";
import { useMemo } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { Provider } from "react-redux";
import store from "@/app-store";

const App = () => {
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
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <AppMain />
      </ThemeProvider>
    </Provider>
  );
};

export default App;
