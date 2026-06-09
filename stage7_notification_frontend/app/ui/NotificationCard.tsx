"use client";

import DoneIcon from "@mui/icons-material/Done";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography
} from "@mui/material";
import { CampusNotification, formatTime, getTypeColor } from "../lib/notifications";

export function NotificationCard({
  notification,
  viewed,
  onView
}: {
  notification: CampusNotification;
  viewed: boolean;
  onView: (id: string) => void;
}) {
  return (
    <Card
      variant="outlined"
      sx={{
        borderColor: viewed ? "#e5e7eb" : "#0f766e",
        bgcolor: viewed ? "background.paper" : "#f0fdfa",
        borderLeft: viewed ? "1px solid #e5e7eb" : "5px solid #0f766e"
      }}
    >
      <CardContent sx={{ p: { xs: 2, md: 2.5 }, "&:last-child": { pb: { xs: 2, md: 2.5 } } }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="space-between">
          <Box sx={{ minWidth: 0 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1, flexWrap: "wrap" }}>
              <Chip
                label={notification.Type}
                color={getTypeColor(notification.Type)}
                size="small"
                variant={viewed ? "outlined" : "filled"}
              />
              <Chip
                icon={viewed ? <DoneIcon /> : <FiberManualRecordIcon />}
                label={viewed ? "Viewed" : "New"}
                size="small"
                variant={viewed ? "outlined" : "filled"}
                color={viewed ? "default" : "primary"}
              />
            </Stack>
            <Typography variant="h6" sx={{ fontSize: { xs: 17, md: 19 }, fontWeight: 800, mb: 0.5 }}>
              {notification.Message}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {formatTime(notification.Timestamp)}
            </Typography>
          </Box>
          <Stack alignItems={{ xs: "stretch", sm: "flex-end" }} spacing={1}>
            <Button variant={viewed ? "outlined" : "contained"} onClick={() => onView(notification.ID)}>
              {viewed ? "Open Again" : "Mark Viewed"}
            </Button>
            <Typography variant="caption" color="text.secondary" sx={{ maxWidth: 220, wordBreak: "break-word" }}>
              {notification.ID}
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

