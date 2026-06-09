"use client";

import RefreshIcon from "@mui/icons-material/Refresh";
import {
  Box,
  Button,
  Paper,
  Stack,
  Typography
} from "@mui/material";
import { useState } from "react";
import { TypeFilter, Pager } from "./FilterBar";
import { NotificationCard } from "./NotificationCard";
import { AppShell } from "./AppShell";
import { EmptyState, ErrorState, LoadingState } from "./StateViews";
import { useNotifications, useViewedNotifications } from "./useNotifications";

export function NotificationsPage() {
  const [page, setPage] = useState(1);
  const [type, setType] = useState("All");
  const [reloadKey, setReloadKey] = useState(0);
  const { viewedIds, markViewed } = useViewedNotifications();
  const { notifications, loading, error } = useNotifications({ page, limit: 12, type, refreshKey: reloadKey });

  const unreadCount = notifications.filter((notification) => !viewedIds.has(notification.ID)).length;

  return (
    <AppShell active="all">
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4">All Notifications</Typography>
          <Typography color="text.secondary">
            Browse campus updates and mark notifications as viewed when opened.
          </Typography>
        </Box>

        <Paper variant="outlined" sx={{ p: 2 }}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between">
            <TypeFilter
              value={type}
              onChange={(nextType) => {
                setType(nextType);
                setPage(1);
              }}
            />
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="body2" color="text.secondary">
                {unreadCount} new on this page
              </Typography>
              <Button
                startIcon={<RefreshIcon />}
                variant="outlined"
                onClick={() => setReloadKey((current) => current + 1)}
              >
                Refresh
              </Button>
            </Stack>
          </Stack>
        </Paper>

        {error && <ErrorState message={error} />}
        {loading && <LoadingState />}
        {!loading && !error && notifications.length === 0 && <EmptyState />}
        {!loading && !error && notifications.length > 0 && (
          <Stack spacing={1.5}>
            {notifications.map((notification) => (
              <NotificationCard
                key={notification.ID}
                notification={notification}
                viewed={viewedIds.has(notification.ID)}
                onView={markViewed}
              />
            ))}
            <Pager page={page} onChange={setPage} />
          </Stack>
        )}
      </Stack>
    </AppShell>
  );
}
