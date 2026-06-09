"use client";

import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import {
  AppBar,
  Box,
  Button,
  Container,
  Stack,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme
} from "@mui/material";
import Link from "next/link";
import { ReactNode } from "react";

export function AppShell({ children, active }: { children: ReactNode; active: "all" | "priority" }) {
  const theme = useTheme();
  const compact = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom: "1px solid #e5e7eb" }}>
        <Toolbar sx={{ gap: 2, minHeight: 64 }}>
          <NotificationsActiveIcon color="primary" />
          <Typography variant={compact ? "h6" : "h5"} sx={{ flexGrow: 1, fontWeight: 800 }}>
            Campus Notifications
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button
              LinkComponent={Link}
              href="/"
              variant={active === "all" ? "contained" : "text"}
              startIcon={<NotificationsActiveIcon />}
              size={compact ? "small" : "medium"}
            >
              All
            </Button>
            <Button
              LinkComponent={Link}
              href="/priority"
              variant={active === "priority" ? "contained" : "outlined"}
              startIcon={<PriorityHighIcon />}
              size={compact ? "small" : "medium"}
            >
              Priority
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
        {children}
      </Container>
    </Box>
  );
}

