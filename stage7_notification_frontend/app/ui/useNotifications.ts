"use client";

import { useCallback, useEffect, useState } from "react";
import { Log } from "../lib/clientLogger";
import { CampusNotification } from "../lib/notifications";

type NotificationResponse = {
  notifications: CampusNotification[];
  message?: string;
};

export function useViewedNotifications() {
  const [viewedIds, setViewedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const stored = window.localStorage.getItem("viewed_notifications");
    if (stored) {
      setViewedIds(new Set(JSON.parse(stored)));
    }
    Log("frontend", "info", "stage7-viewed", "Loaded viewed notification ids");
  }, []);

  const markViewed = useCallback((id: string) => {
    setViewedIds((current) => {
      const next = new Set(current);
      next.add(id);
      window.localStorage.setItem("viewed_notifications", JSON.stringify(Array.from(next)));
      Log("frontend", "info", "stage7-viewed", `Marked notification viewed ${id}`);
      return next;
    });
  }, []);

  return { viewedIds, markViewed };
}

export function useNotifications({
  page,
  limit,
  type,
  refreshKey = 0
}: {
  page: number;
  limit: number;
  type: string;
  refreshKey?: number;
}) {
  const [notifications, setNotifications] = useState<CampusNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadNotifications() {
      setLoading(true);
      setError("");
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit)
      });

      if (type !== "All") {
        params.set("notification_type", type);
      }

      try {
        Log("frontend", "info", "stage7-api", `Requesting notifications ${params.toString()}`);
        const response = await fetch(`/api/notifications?${params.toString()}`, {
          signal: controller.signal
        });
        const parsed = (await response.json()) as NotificationResponse;

        if (!response.ok) {
          throw new Error(parsed.message ?? "Notification request failed");
        }

        setNotifications(parsed.notifications ?? []);
        Log("frontend", "info", "stage7-api", `Loaded ${(parsed.notifications ?? []).length} notifications`);
      } catch (requestError) {
        if ((requestError as Error).name === "AbortError") {
          return;
        }
        setError((requestError as Error).message);
        Log("frontend", "error", "stage7-api", (requestError as Error).message);
      } finally {
        setLoading(false);
      }
    }

    loadNotifications();
    return () => controller.abort();
  }, [page, limit, type, refreshKey]);

  return { notifications, loading, error };
}
