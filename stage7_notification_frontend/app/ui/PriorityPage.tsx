"use client";

import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import {
  Box,
  Paper,
  Stack,
  Typography
} from "@mui/material";
import { useMemo, useState } from "react";
import { AppShell } from "./AppShell";
import { LimitSelect, TypeFilter } from "./FilterBar";
import { NotificationCard } from "./NotificationCard";
import { EmptyState, ErrorState, LoadingState } from "./StateViews";
import { useNotifications, useViewedNotifications } from "./useNotifications";
import { sortByPriority } from "../lib/notifications";

export function PriorityPage() {
  const [type, setType] = useState("All");
  const [topN, setTopN] = useState(10);
  const { viewedIds, markViewed } = useViewedNotifications();
  const { notifications, loading, error } = useNotifications({ page: 1, limit: 100, type });

  const priorityNotifications = useMemo(() => {
    return sortByPriority(notifications)
      .filter((notification) => !viewedIds.has(notification.ID))
      .slice(0, topN);
  }, [notifications, topN, viewedIds]);

  return (
    <AppShell active="priority">
      <Stack spacing={3}>
        <Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <AutoAwesomeIcon color="primary" />
            <Typography variant="h4">Priority Inbox</Typography>
          </Stack>
          <Typography color="text.secondary">
            Highest priority unread notifications, ranked by type and recency.
          </Typography>
        </Box>

        <Paper variant="outlined" sx={{ p: 2 }}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between">
            <TypeFilter value={type} onChange={setType} />
            <LimitSelect value={topN} options={[10, 15, 20]} onChange={setTopN} />
          </Stack>
        </Paper>

        {error && <ErrorState message={error} />}
        {loading && <LoadingState />}
        {!loading && !error && priorityNotifications.length === 0 && <EmptyState />}
        {!loading && !error && priorityNotifications.length > 0 && (
          <Stack spacing={1.5}>
            {priorityNotifications.map((notification) => (
              <NotificationCard
                key={notification.ID}
                notification={notification}
                viewed={viewedIds.has(notification.ID)}
                onView={markViewed}
              />
            ))}
          </Stack>
        )}
      </Stack>
    </AppShell>
  );
}

