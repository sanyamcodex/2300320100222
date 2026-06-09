"use client";

import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import InboxIcon from "@mui/icons-material/Inbox";
import { Alert, Box, CircularProgress, Stack, Typography } from "@mui/material";

export function LoadingState() {
  return (
    <Stack alignItems="center" justifyContent="center" sx={{ py: 8 }} spacing={2}>
      <CircularProgress />
      <Typography color="text.secondary">Loading notifications</Typography>
    </Stack>
  );
}

export function EmptyState() {
  return (
    <Box sx={{ textAlign: "center", py: 8 }}>
      <InboxIcon color="disabled" sx={{ fontSize: 48, mb: 1 }} />
      <Typography variant="h6">No notifications found</Typography>
      <Typography color="text.secondary">Try changing the filter or page.</Typography>
    </Box>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <Alert icon={<ErrorOutlineIcon />} severity="error" sx={{ mb: 2 }}>
      {message}
    </Alert>
  );
}

