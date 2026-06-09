"use client";

import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#0f766e"
    },
    secondary: {
      main: "#7c3aed"
    },
    background: {
      default: "#f6f7f4",
      paper: "#ffffff"
    }
  },
  shape: {
    borderRadius: 8
  },
  typography: {
    fontFamily: "Arial, sans-serif",
    h4: {
      fontWeight: 700,
      letterSpacing: 0
    },
    h5: {
      fontWeight: 700,
      letterSpacing: 0
    },
    button: {
      textTransform: "none",
      fontWeight: 700
    }
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: "none"
        }
      }
    }
  }
});

