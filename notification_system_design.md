# Stage 1

# Notification System REST API Design

This document describes the REST API contract for the campus notification platform. The platform is used to send and display updates related to placements, events, results, and other campus announcements.

For this assessment, users are assumed to be already authorised. So the APIs do not include login or registration.

## Core Actions

The notification platform should support these main actions:

- Show latest notifications to a student.
- Filter notifications by category like placement, event, result, or general.
- View one notification in detail.
- Mark a notification as read.
- Mark all notifications as read.
- Get unread notification count for badge display.
- Create a notification from admin/backend side.
- Update or expire a notification if needed.
- Delete or archive a notification.
- Receive real-time notifications without refreshing the page.

## Common API Details

Base URL:

```http
https://api.campusnotify.com/api/v1
```

Common request headers:

```http
Content-Type: application/json
Accept: application/json
X-Request-Id: 8f3b9b92-2d76-4b2d-973d-642a29c73110
X-User-Id: stu_2300320100222
```

Since users are treated as pre-authorised, `X-User-Id` can be passed by the upstream system or API gateway.

Common response headers:

```http
Content-Type: application/json
Cache-Control: no-store
X-Request-Id: 8f3b9b92-2d76-4b2d-973d-642a29c73110
```

Common error response:

```json
{
  "success": false,
  "message": "Notification not found",
  "error": {
    "code": "NOTIFICATION_NOT_FOUND",
    "details": "No notification exists for the given notificationId"
  }
}
```

## Notification Object

```json
{
  "id": "notif_1001",
  "title": "Placement Drive: Affordmed",
  "message": "Affordmed placement drive is scheduled for 15 June 2026.",
  "category": "placement",
  "priority": "high",
  "targetAudience": {
    "departments": ["CSE", "IT"],
    "years": [3, 4],
    "sections": ["A", "B"]
  },
  "isRead": false,
  "createdAt": "2026-06-09T10:30:00Z",
  "expiresAt": "2026-06-16T18:00:00Z",
  "actionUrl": "/placements/notif_1001"
}
```

Valid category values:

```json
["placement", "event", "result", "general"]
```

Valid priority values:

```json
["low", "medium", "high"]
```

## REST Endpoints

## 1. Get Notifications

Used by frontend to display the notification list.

```http
GET /notifications?category=placement&status=unread&page=1&limit=10
```

Request headers:

```http
Accept: application/json
X-Request-Id: 8f3b9b92-2d76-4b2d-973d-642a29c73110
X-User-Id: stu_2300320100222
```

Query parameters:

| Name | Required | Description |
| --- | --- | --- |
| category | No | Filter by placement, event, result, or general |
| status | No | Filter by read, unread, or all |
| page | No | Page number, default is 1 |
| limit | No | Number of records per page, default is 10 |

Success response:

```json
{
  "success": true,
  "message": "Notifications fetched successfully",
  "data": {
    "notifications": [
      {
        "id": "notif_1001",
        "title": "Placement Drive: Affordmed",
        "message": "Affordmed placement drive is scheduled for 15 June 2026.",
        "category": "placement",
        "priority": "high",
        "isRead": false,
        "createdAt": "2026-06-09T10:30:00Z",
        "expiresAt": "2026-06-16T18:00:00Z",
        "actionUrl": "/placements/notif_1001"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    }
  }
}
```

## 2. Get Notification Details

Used when a student opens a notification.

```http
GET /notifications/{notificationId}
```

Example:

```http
GET /notifications/notif_1001
```

Success response:

```json
{
  "success": true,
  "message": "Notification details fetched successfully",
  "data": {
    "id": "notif_1001",
    "title": "Placement Drive: Affordmed",
    "message": "Affordmed placement drive is scheduled for 15 June 2026. Eligible students from CSE and IT can attend.",
    "category": "placement",
    "priority": "high",
    "targetAudience": {
      "departments": ["CSE", "IT"],
      "years": [3, 4],
      "sections": ["A", "B"]
    },
    "isRead": false,
    "createdAt": "2026-06-09T10:30:00Z",
    "expiresAt": "2026-06-16T18:00:00Z",
    "actionUrl": "/placements/notif_1001"
  }
}
```

## 3. Mark Notification As Read

Used after a student opens or clicks a notification.

```http
PATCH /notifications/{notificationId}/read
```

Request body:

```json
{
  "isRead": true
}
```

Success response:

```json
{
  "success": true,
  "message": "Notification marked as read",
  "data": {
    "id": "notif_1001",
    "isRead": true,
    "readAt": "2026-06-09T11:00:00Z"
  }
}
```

## 4. Mark All Notifications As Read

Used by frontend when student clicks "mark all as read".

```http
PATCH /notifications/read-all
```

Request body:

```json
{
  "category": "placement"
}
```

`category` is optional. If not sent, all notifications for that student are marked as read.

Success response:

```json
{
  "success": true,
  "message": "All matching notifications marked as read",
  "data": {
    "updatedCount": 7,
    "readAt": "2026-06-09T11:05:00Z"
  }
}
```

## 5. Get Unread Count

Used for notification bell badge count.

```http
GET /notifications/unread-count
```

Success response:

```json
{
  "success": true,
  "message": "Unread notification count fetched successfully",
  "data": {
    "totalUnread": 5,
    "categoryWiseCount": {
      "placement": 2,
      "event": 1,
      "result": 1,
      "general": 1
    }
  }
}
```

## 6. Create Notification

Used by admin/backend service to create a new notification.

```http
POST /notifications
```

Request body:

```json
{
  "title": "Semester Results Published",
  "message": "Semester 6 results are now available in the student portal.",
  "category": "result",
  "priority": "medium",
  "targetAudience": {
    "departments": ["CSE", "IT", "ECE"],
    "years": [3],
    "sections": []
  },
  "expiresAt": "2026-06-20T18:00:00Z",
  "actionUrl": "/results/semester-6"
}
```

Success response:

```json
{
  "success": true,
  "message": "Notification created successfully",
  "data": {
    "id": "notif_1002",
    "title": "Semester Results Published",
    "category": "result",
    "priority": "medium",
    "createdAt": "2026-06-09T11:10:00Z"
  }
}
```

## 7. Update Notification

Used when title, message, expiry, or target audience needs correction.

```http
PUT /notifications/{notificationId}
```

Request body:

```json
{
  "title": "Semester 6 Results Published",
  "message": "Semester 6 results are available now.",
  "category": "result",
  "priority": "medium",
  "targetAudience": {
    "departments": ["CSE", "IT", "ECE"],
    "years": [3],
    "sections": []
  },
  "expiresAt": "2026-06-20T18:00:00Z",
  "actionUrl": "/results/semester-6"
}
```

Success response:

```json
{
  "success": true,
  "message": "Notification updated successfully",
  "data": {
    "id": "notif_1002",
    "updatedAt": "2026-06-09T11:20:00Z"
  }
}
```

## 8. Delete Notification

Used to remove a wrong or cancelled notification.

```http
DELETE /notifications/{notificationId}
```

Success response:

```json
{
  "success": true,
  "message": "Notification deleted successfully",
  "data": {
    "id": "notif_1002",
    "deletedAt": "2026-06-09T11:30:00Z"
  }
}
```

## Real-Time Notification Mechanism

For real-time notifications, the platform can use WebSocket because students should receive updates immediately without repeatedly calling the list API.

WebSocket URL:

```http
wss://api.campusnotify.com/ws/notifications
```

Connection headers:

```http
X-User-Id: stu_2300320100222
X-Request-Id: 8f3b9b92-2d76-4b2d-973d-642a29c73110
```

Connection flow:

1. Frontend opens WebSocket connection after the student enters the application.
2. Backend identifies the student using `X-User-Id`.
3. Backend subscribes the socket to matching rooms like department, year, section, and global.
4. When a new notification is created, backend stores it first and then broadcasts it to matching connected students.
5. Frontend receives the event and adds it to the notification list and updates unread count.
6. If WebSocket disconnects, frontend reconnects and calls `GET /notifications` to sync missed notifications.

Real-time event sent from server:

```json
{
  "event": "notification.created",
  "data": {
    "id": "notif_1003",
    "title": "Technical Fest Registration",
    "message": "Registrations for the technical fest are open till 12 June 2026.",
    "category": "event",
    "priority": "medium",
    "isRead": false,
    "createdAt": "2026-06-09T12:00:00Z",
    "expiresAt": "2026-06-12T18:00:00Z",
    "actionUrl": "/events/technical-fest"
  }
}
```

Acknowledgement from frontend:

```json
{
  "event": "notification.received",
  "notificationId": "notif_1003",
  "receivedAt": "2026-06-09T12:00:05Z"
}
```

Fallback option:

If WebSocket is blocked by network, frontend can use Server-Sent Events:

```http
GET /notifications/stream
```

Response headers:

```http
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
X-Accel-Buffering: no
```

Example SSE event:

```text
event: notification.created
data: {"id":"notif_1003","title":"Technical Fest Registration","category":"event","priority":"medium"}
```

## Status Codes

| Status Code | Meaning |
| --- | --- |
| 200 | Request completed successfully |
| 201 | Notification created successfully |
| 400 | Invalid request body or query parameter |
| 404 | Notification not found |
| 409 | Duplicate or conflicting notification operation |
| 500 | Internal server error |

## Notes For Frontend Integration

- Show unread count using `GET /notifications/unread-count`.
- Load first page using `GET /notifications?page=1&limit=10`.
- Use category filters through query params.
- Open WebSocket once and listen for `notification.created`.
- On receiving real-time notification, update local list and badge count.
- Call mark as read API when user opens a notification.
- On reconnect, call list API again to avoid missing notifications.
