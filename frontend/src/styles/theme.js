import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#013d79",
    },
    success: {
      main: "#2e7d32",
    },
    text: {
      primary: "#333",
    },
  },
  typography: {
    fontFamily: "Roboto, Arial, sans-serif",
    button: {
      textTransform: "none",
    },
  },
});

export default theme;
