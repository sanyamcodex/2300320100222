export type NotificationType = "Event" | "Result" | "Placement";

export type CampusNotification = {
  ID: string;
  Type: NotificationType;
  Message: string;
  Timestamp: string;
};

export const typeWeights: Record<NotificationType, number> = {
  Placement: 3,
  Result: 2,
  Event: 1
};

export function getPriorityScore(notification: CampusNotification) {
  const time = new Date(notification.Timestamp.replace(" ", "T")).getTime();
  return typeWeights[notification.Type] * 10000000000000 + time;
}

export function sortByPriority(notifications: CampusNotification[]) {
  return [...notifications].sort((first, second) => getPriorityScore(second) - getPriorityScore(first));
}

export function formatTime(timestamp: string) {
  const date = new Date(timestamp.replace(" ", "T"));
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

export function getTypeColor(type: NotificationType) {
  if (type === "Placement") {
    return "success";
  }
  if (type === "Result") {
    return "info";
  }
  return "warning";
}

