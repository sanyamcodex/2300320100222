"use client";

import { CssBaseline, ThemeProvider } from "@mui/material";
import { ReactNode } from "react";
import { theme } from "./theme";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}

