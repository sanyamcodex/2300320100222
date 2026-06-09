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

# Stage 2

# Persistent Storage Design

For storing notifications reliably, I suggest using PostgreSQL as the primary database.

PostgreSQL is a good choice because notification data has clear relationships. One notification can be targeted to many departments, years, sections, or students, and every student can have a separate read/unread status for the same notification. PostgreSQL also supports transactions, indexes, JSONB fields, pagination, and reliable querying, which are useful for this platform.

MongoDB can also store notification documents, but for this design PostgreSQL is simpler for read tracking, filtering, and reporting.

## Main Tables

## 1. students

Stores basic student details used for targeting notifications.

```sql
CREATE TABLE students (
  id VARCHAR(50) PRIMARY KEY,
  roll_number VARCHAR(30) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  department VARCHAR(20) NOT NULL,
  year INTEGER NOT NULL,
  section VARCHAR(10),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

## 2. notifications

Stores the main notification content.

```sql
CREATE TABLE notifications (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  message TEXT NOT NULL,
  category VARCHAR(30) NOT NULL CHECK (category IN ('placement', 'event', 'result', 'general')),
  priority VARCHAR(20) NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
  action_url VARCHAR(255),
  expires_at TIMESTAMP,
  created_by VARCHAR(50),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP,
  deleted_at TIMESTAMP
);
```

## 3. notification_targets

Stores target audience rules for a notification.

```sql
CREATE TABLE notification_targets (
  id BIGSERIAL PRIMARY KEY,
  notification_id VARCHAR(50) NOT NULL REFERENCES notifications(id),
  department VARCHAR(20),
  year INTEGER,
  section VARCHAR(10),
  student_id VARCHAR(50),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

If a notification is for all students, department, year, section, and student_id can be null in one target row.

Examples:

- CSE 4th year: `department = 'CSE'`, `year = 4`
- One student: `student_id = 'stu_2300320100222'`
- All students: all target columns null

## 4. student_notifications

Stores delivery/read status for each student.

```sql
CREATE TABLE student_notifications (
  id BIGSERIAL PRIMARY KEY,
  student_id VARCHAR(50) NOT NULL REFERENCES students(id),
  notification_id VARCHAR(50) NOT NULL REFERENCES notifications(id),
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  delivered_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  read_at TIMESTAMP,
  UNIQUE (student_id, notification_id)
);
```

This table helps the frontend show unread count and mark notifications as read without changing the original notification.

## Indexes

Indexes are required because notification list and unread count APIs will be called often.

```sql
CREATE INDEX idx_notifications_category_created
ON notifications(category, created_at DESC);

CREATE INDEX idx_notifications_active
ON notifications(created_at DESC)
WHERE deleted_at IS NULL;

CREATE INDEX idx_student_notifications_student_read
ON student_notifications(student_id, is_read);

CREATE INDEX idx_student_notifications_student_created
ON student_notifications(student_id, delivered_at DESC);

CREATE INDEX idx_notification_targets_rules
ON notification_targets(department, year, section, student_id);
```

## API Based SQL Queries

## 1. Create Notification

Used for `POST /notifications`.

```sql
INSERT INTO notifications (
  id,
  title,
  message,
  category,
  priority,
  action_url,
  expires_at,
  created_by
) VALUES (
  'notif_1002',
  'Semester Results Published',
  'Semester 6 results are now available in the student portal.',
  'result',
  'medium',
  '/results/semester-6',
  '2026-06-20 18:00:00',
  'admin_001'
);
```

Insert target audience:

```sql
INSERT INTO notification_targets (
  notification_id,
  department,
  year,
  section
) VALUES
('notif_1002', 'CSE', 3, NULL),
('notif_1002', 'IT', 3, NULL),
('notif_1002', 'ECE', 3, NULL);
```

Create delivery rows for matching students:

```sql
INSERT INTO student_notifications (student_id, notification_id)
SELECT DISTINCT s.id, 'notif_1002'
FROM students s
JOIN notification_targets nt
  ON nt.notification_id = 'notif_1002'
WHERE
  (
    nt.student_id IS NULL
    OR nt.student_id = s.id
  )
  AND (
    nt.department IS NULL
    OR nt.department = s.department
  )
  AND (
    nt.year IS NULL
    OR nt.year = s.year
  )
  AND (
    nt.section IS NULL
    OR nt.section = s.section
  )
ON CONFLICT (student_id, notification_id) DO NOTHING;
```

## 2. Get Notifications

Used for `GET /notifications?category=placement&status=unread&page=1&limit=10`.

```sql
SELECT
  n.id,
  n.title,
  n.message,
  n.category,
  n.priority,
  sn.is_read,
  n.created_at,
  n.expires_at,
  n.action_url
FROM student_notifications sn
JOIN notifications n
  ON n.id = sn.notification_id
WHERE
  sn.student_id = 'stu_2300320100222'
  AND n.deleted_at IS NULL
  AND (n.expires_at IS NULL OR n.expires_at > CURRENT_TIMESTAMP)
  AND n.category = 'placement'
  AND sn.is_read = FALSE
ORDER BY sn.delivered_at DESC
LIMIT 10 OFFSET 0;
```

For `page = 2`, offset will be `(2 - 1) * 10 = 10`.

## 3. Get Notification Details

Used for `GET /notifications/{notificationId}`.

```sql
SELECT
  n.id,
  n.title,
  n.message,
  n.category,
  n.priority,
  sn.is_read,
  sn.read_at,
  n.created_at,
  n.expires_at,
  n.action_url
FROM student_notifications sn
JOIN notifications n
  ON n.id = sn.notification_id
WHERE
  sn.student_id = 'stu_2300320100222'
  AND n.id = 'notif_1001'
  AND n.deleted_at IS NULL;
```

## 4. Mark Notification As Read

Used for `PATCH /notifications/{notificationId}/read`.

```sql
UPDATE student_notifications
SET
  is_read = TRUE,
  read_at = CURRENT_TIMESTAMP
WHERE
  student_id = 'stu_2300320100222'
  AND notification_id = 'notif_1001';
```

## 5. Mark All Notifications As Read

Used for `PATCH /notifications/read-all`.

```sql
UPDATE student_notifications sn
SET
  is_read = TRUE,
  read_at = CURRENT_TIMESTAMP
FROM notifications n
WHERE
  n.id = sn.notification_id
  AND sn.student_id = 'stu_2300320100222'
  AND sn.is_read = FALSE
  AND n.deleted_at IS NULL
  AND n.category = 'placement';
```

If no category filter is passed, remove the last condition.

## 6. Get Unread Count

Used for `GET /notifications/unread-count`.

```sql
SELECT
  COUNT(*) AS total_unread
FROM student_notifications sn
JOIN notifications n
  ON n.id = sn.notification_id
WHERE
  sn.student_id = 'stu_2300320100222'
  AND sn.is_read = FALSE
  AND n.deleted_at IS NULL
  AND (n.expires_at IS NULL OR n.expires_at > CURRENT_TIMESTAMP);
```

Category-wise unread count:

```sql
SELECT
  n.category,
  COUNT(*) AS unread_count
FROM student_notifications sn
JOIN notifications n
  ON n.id = sn.notification_id
WHERE
  sn.student_id = 'stu_2300320100222'
  AND sn.is_read = FALSE
  AND n.deleted_at IS NULL
  AND (n.expires_at IS NULL OR n.expires_at > CURRENT_TIMESTAMP)
GROUP BY n.category;
```

## 7. Update Notification

Used for `PUT /notifications/{notificationId}`.

```sql
UPDATE notifications
SET
  title = 'Semester 6 Results Published',
  message = 'Semester 6 results are available now.',
  category = 'result',
  priority = 'medium',
  action_url = '/results/semester-6',
  expires_at = '2026-06-20 18:00:00',
  updated_at = CURRENT_TIMESTAMP
WHERE
  id = 'notif_1002'
  AND deleted_at IS NULL;
```

## 8. Delete Notification

Used for `DELETE /notifications/{notificationId}`.

Soft delete is better than hard delete because it keeps history.

```sql
UPDATE notifications
SET deleted_at = CURRENT_TIMESTAMP
WHERE id = 'notif_1002';
```

## Data Volume Problems

As the number of students and notifications increases, these problems may come:

- `student_notifications` table can become very large because one notification may create rows for thousands of students.
- Notification list API can become slow if indexes are missing.
- Unread count API can be called too frequently from frontend.
- Old expired notifications can keep increasing storage size.
- Creating delivery rows for a large audience can take time.
- Real-time broadcasting can put load on one backend server.

## Solutions For Scaling

## 1. Proper Indexing

Use indexes on student id, read status, category, and delivered time. This keeps list and count APIs fast.

## 2. Pagination

Always use pagination for notification list. Do not return all notifications in one API response.

## 3. Archival

Move old expired notifications to archive tables after a fixed period.

```sql
CREATE TABLE archived_notifications AS
SELECT *
FROM notifications
WHERE false;
```

Example archive query:

```sql
INSERT INTO archived_notifications
SELECT *
FROM notifications
WHERE expires_at < CURRENT_TIMESTAMP - INTERVAL '90 days';
```

## 4. Partitioning

Partition large tables by month or year using `created_at` or `delivered_at`.

Example:

```sql
CREATE TABLE student_notifications_2026_06
PARTITION OF student_notifications
FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');
```

In real implementation, `student_notifications` should be created as a partitioned table first.

## 5. Cache Unread Count

Unread count can be stored in Redis to reduce database hits. Whenever a new notification is delivered, increment the count. Whenever student marks it read, decrement it.

Example cache key:

```text
unread_count:stu_2300320100222
```

## 6. Background Jobs

For large target audiences, do not create all `student_notifications` rows inside the request cycle. The API can create the notification and push a job to a queue. A worker can process delivery rows in batches.

Example batches:

```sql
INSERT INTO student_notifications (student_id, notification_id)
SELECT id, 'notif_1002'
FROM students
WHERE department = 'CSE' AND year = 3
LIMIT 1000;
```

## 7. WebSocket Scaling

For multiple backend servers, use Redis Pub/Sub, Kafka, or RabbitMQ so every server receives the notification event and sends it to connected students.

Simple flow:

1. API stores notification in PostgreSQL.
2. API publishes event to message broker.
3. WebSocket servers receive event.
4. WebSocket servers send it only to matching connected students.

## 8. Cleanup Job

Run a scheduled cleanup job to expire old notifications and archive data.

```sql
UPDATE notifications
SET deleted_at = CURRENT_TIMESTAMP
WHERE
  expires_at IS NOT NULL
  AND expires_at < CURRENT_TIMESTAMP - INTERVAL '180 days'
  AND deleted_at IS NULL;
```

## Final Database Choice

PostgreSQL should be used as the main persistent database. Redis can be added later for unread count caching and real-time Pub/Sub support, but PostgreSQL remains the reliable source of truth for notification data.

# Stage 3

# Query Performance Review

The old query is:

```sql
SELECT * FROM notifications
WHERE studentID = 1042 AND isRead = false
ORDER BY createdAt ASC;
```

## Is This Query Accurate?

This query may work only if the `notifications` table stores one row per student per notification. But that design is not fully accurate for a notification system.

A notification is usually created once and then delivered to many students. If the same notification is copied into the `notifications` table for every student, the table will grow very fast and repeated content will be stored many times.

A better relational design is:

- `notifications`: stores the actual notification content.
- `student_notifications`: stores student-specific delivery and read/unread status.

So, in the schema suggested in Stage 2, `studentID` and `isRead` should not be directly inside the main `notifications` table. They should be in `student_notifications`.

## Why Is It Slow?

The query is slow because the table has grown to 5,000,000 rows. If proper indexes are not present, the database may scan a large part of the table to find rows where:

```sql
studentID = 1042
AND isRead = false
```

After filtering, it also has to sort the matching rows by:

```sql
createdAt ASC
```

Main reasons for slowness:

- `SELECT *` fetches every column even if the API needs only a few fields.
- No suitable composite index may exist for `studentID`, `isRead`, and `createdAt`.
- Sorting becomes costly when the database cannot use an index for `ORDER BY`.
- If all notifications are stored in one table, the table becomes too large and repetitive.
- Boolean columns like `isRead` alone are not very selective, so indexing only `isRead` will not help much.

## What I Would Change

If keeping the old single-table design, I would avoid `SELECT *` and add a composite index.

```sql
CREATE INDEX idx_notifications_student_read_created
ON notifications(studentID, isRead, createdAt);
```

Improved query:

```sql
SELECT
  id,
  title,
  message,
  notificationType,
  createdAt
FROM notifications
WHERE
  studentID = 1042
  AND isRead = false
ORDER BY createdAt ASC
LIMIT 50;
```

The `LIMIT` is important because an API should not return unlimited unread notifications in one response.

## Better Query Using Stage 2 Schema

With the normalized schema:

```sql
SELECT
  n.id,
  n.title,
  n.message,
  n.category,
  n.priority,
  n.created_at,
  n.action_url
FROM student_notifications sn
JOIN notifications n
  ON n.id = sn.notification_id
WHERE
  sn.student_id = '1042'
  AND sn.is_read = FALSE
  AND n.deleted_at IS NULL
ORDER BY sn.delivered_at ASC
LIMIT 50;
```

Recommended index:

```sql
CREATE INDEX idx_student_notifications_student_read_delivered
ON student_notifications(student_id, is_read, delivered_at);
```

If most APIs sort by newest first, then use:

```sql
CREATE INDEX idx_student_notifications_student_read_delivered_desc
ON student_notifications(student_id, is_read, delivered_at DESC);
```

## Likely Computation Cost

Without a useful index:

```text
O(N) scan + O(K log K) sort
```

Where:

- `N` is total rows in the table, around 5,000,000.
- `K` is the number of unread notifications found for the student.

This means the database may inspect millions of rows before returning the result.

With a composite index on `(studentID, isRead, createdAt)`:

```text
O(log N + K)
```

The database can jump directly to the matching student and unread rows using the index, and because `createdAt` is already part of the index, it can avoid a separate sort.

With pagination:

```text
O(log N + page_size)
```

For example, if the API returns 50 notifications, the database only needs to fetch around 50 matching rows after locating the correct index range.

## Should We Add Indexes On Every Column?

No, adding indexes on every column is not effective.

Indexes improve read queries only when they match the query pattern. Adding too many indexes creates other problems:

- Inserts become slower because every index must also be updated.
- Updates become slower, especially when indexed columns are changed.
- Indexes consume extra disk space.
- The query planner may have too many options and still not choose a useful one.
- Single-column indexes may not help queries that filter and sort using multiple columns.

For this API, a composite index is better than many random indexes because the query filters by student, filters by read status, and sorts by created time.

Good index:

```sql
CREATE INDEX idx_notifications_student_read_created
ON notifications(studentID, isRead, createdAt);
```

Less useful indexes:

```sql
CREATE INDEX idx_notifications_student ON notifications(studentID);
CREATE INDEX idx_notifications_read ON notifications(isRead);
CREATE INDEX idx_notifications_created ON notifications(createdAt);
```

These separate indexes may not avoid sorting and may still require extra filtering.

## Query To Find Students Who Got Placement Notification In Last 7 Days

Given table column:

```text
notificationType notification_type
```

Where enum values are:

```text
Event, Result, Placement
```

If using the old single-table design:

```sql
SELECT DISTINCT
  studentID
FROM notifications
WHERE
  notificationType = 'Placement'
  AND createdAt >= CURRENT_TIMESTAMP - INTERVAL '7 days';
```

For MySQL, the interval syntax will be:

```sql
SELECT DISTINCT
  studentID
FROM notifications
WHERE
  notificationType = 'Placement'
  AND createdAt >= NOW() - INTERVAL 7 DAY;
```

Recommended index for this query:

```sql
CREATE INDEX idx_notifications_type_created_student
ON notifications(notificationType, createdAt, studentID);
```

If using the normalized Stage 2 schema:

```sql
SELECT DISTINCT
  sn.student_id
FROM student_notifications sn
JOIN notifications n
  ON n.id = sn.notification_id
WHERE
  n.category = 'placement'
  AND n.created_at >= CURRENT_TIMESTAMP - INTERVAL '7 days'
  AND n.deleted_at IS NULL;
```

In the exact enum-based naming given in this stage, the normalized version can be written as:

```sql
SELECT DISTINCT
  sn.student_id
FROM student_notifications sn
JOIN notifications n
  ON n.id = sn.notification_id
WHERE
  n.notificationType = 'Placement'
  AND n.createdAt >= CURRENT_TIMESTAMP - INTERVAL '7 days';
```

Useful indexes:

```sql
CREATE INDEX idx_notifications_type_created
ON notifications(notificationType, createdAt);

CREATE INDEX idx_student_notifications_notification_student
ON student_notifications(notification_id, student_id);
```

# Stage 4

# Reducing Database Load On Page Loads

Currently notifications are fetched on every page load for every student. This can overwhelm the database because many students may open different pages at the same time, and every page load creates repeated notification list and unread count queries.

The main issue is that the application is treating notifications like a normal page resource instead of a mostly event-driven feature.

## Suggested Solution

I would improve the design using a combination of caching, real-time updates, pagination, conditional fetching, and better query/index design.

## 1. Fetch Notifications Only When Needed

Instead of calling notification APIs on every page load, the frontend should fetch notifications when:

- The user opens the notification panel.
- The app starts for the first time.
- WebSocket reconnects and needs to sync missed messages.
- The unread count is stale.

For normal page navigation inside the app, the frontend can reuse already loaded notification data.

Tradeoff:

- Reduces database load immediately.
- Frontend state management becomes slightly more important.
- There is a small chance of stale data if the frontend does not sync correctly.

## 2. Use WebSocket For Real-Time Updates

As designed in Stage 1, WebSocket should push new notifications to students. If the student is already online, the frontend should not keep polling the database.

Flow:

1. Student opens the app.
2. Frontend fetches current unread count and first page of notifications once.
3. Frontend opens WebSocket connection.
4. New notifications are pushed through WebSocket.
5. Frontend updates notification list and unread count locally.

Tradeoff:

- Gives faster user experience.
- Reduces repeated DB reads.
- Requires handling disconnects and reconnects.
- WebSocket servers need scaling when many users are online.

## 3. Cache Unread Count In Redis

Unread count is shown on almost every page in the notification bell. Instead of calculating it from the database every time, store it in Redis.

Example key:

```text
unread_count:stu_2300320100222
```

When a notification is delivered:

```text
INCR unread_count:stu_2300320100222
```

When notification is marked as read:

```text
DECR unread_count:stu_2300320100222
```

Tradeoff:

- Very fast reads for badge count.
- Reduces load on PostgreSQL.
- Cache can become inconsistent if update logic fails.
- Need fallback recalculation from DB if cache key is missing or incorrect.

## 4. Use Pagination And Limit Fields

The notification list API should always use pagination.

Good request:

```http
GET /notifications?page=1&limit=20
```

The API should avoid `SELECT *` and return only fields required by frontend list view.

```sql
SELECT
  n.id,
  n.title,
  n.category,
  n.priority,
  sn.is_read,
  n.created_at,
  n.action_url
FROM student_notifications sn
JOIN notifications n
  ON n.id = sn.notification_id
WHERE
  sn.student_id = 'stu_2300320100222'
  AND n.deleted_at IS NULL
ORDER BY sn.delivered_at DESC
LIMIT 20 OFFSET 0;
```

Tradeoff:

- Keeps response small and fast.
- User may need multiple API calls while scrolling.
- Offset pagination may become slower for very deep pages.

For better large-scale performance, cursor pagination can be used:

```http
GET /notifications?limit=20&before=2026-06-09T11:00:00Z
```

```sql
SELECT
  n.id,
  n.title,
  n.category,
  n.priority,
  sn.is_read,
  sn.delivered_at
FROM student_notifications sn
JOIN notifications n
  ON n.id = sn.notification_id
WHERE
  sn.student_id = 'stu_2300320100222'
  AND sn.delivered_at < '2026-06-09 11:00:00'
  AND n.deleted_at IS NULL
ORDER BY sn.delivered_at DESC
LIMIT 20;
```

Tradeoff:

- Cursor pagination is faster for large data.
- It is slightly more complex than page number based pagination.

## 5. Add Proper Composite Indexes

The most important index for student notification list:

```sql
CREATE INDEX idx_student_notifications_student_delivered
ON student_notifications(student_id, delivered_at DESC);
```

For unread notifications:

```sql
CREATE INDEX idx_student_notifications_student_read_delivered
ON student_notifications(student_id, is_read, delivered_at DESC);
```

Tradeoff:

- Makes common reads fast.
- Increases storage usage.
- Inserts and updates become a little slower because indexes must be updated.

## 6. Use HTTP Cache Validation

For notification list, backend can return an `ETag` or `Last-Modified` header.

Response:

```http
ETag: "student-1042-notifications-v25"
Last-Modified: Tue, 09 Jun 2026 11:30:00 GMT
```

Next request:

```http
If-None-Match: "student-1042-notifications-v25"
```

If nothing changed:

```http
304 Not Modified
```

Tradeoff:

- Reduces response size.
- Still creates some backend work.
- Best used with caching and WebSocket, not as the only solution.

## 7. Read Replica For Heavy Reads

If read traffic is very high, notification reads can go to a PostgreSQL read replica.

Tradeoff:

- Protects primary DB from read overload.
- Adds infrastructure cost.
- Replica may have small replication delay.

## Final Stage 4 Approach

I would use:

- WebSocket for new notification delivery.
- Redis for unread count.
- Fetch notification list only when notification panel opens.
- Cursor pagination for older notifications.
- Composite indexes for common access patterns.
- PostgreSQL as source of truth.

This reduces repeated page-load queries and keeps the user experience fast.

# Stage 5

# Reliable Notify All Design

The proposed pseudocode is:

```text
function notify_all(student_ids: array, message: string):
  for student_id in student_ids:
    send_email(student_id, message)
    save_to_db(student_id, message)
    push_to_app(student_id, message)
```

This implementation is simple, but it is not reliable for 50,000 students.

## Shortcomings

Main problems:

- It processes students one by one, so it will be slow.
- If `send_email` fails midway, the remaining students may not receive anything.
- Email, DB insert, and app push are tightly coupled.
- There is no retry mechanism.
- There is no failure tracking for individual students.
- There is no idempotency, so retries may send duplicate emails or duplicate notifications.
- One slow email API call can block the whole process.
- If server crashes halfway, the system may not know where to resume.
- HR gets no clear delivery status.

## What If Email Failed For 200 Students?

If logs show that `send_email` failed for 200 students midway, we should not rerun the complete process blindly. That may duplicate emails and in-app notifications for students who already received them.

Correct action:

1. Identify the failed student IDs from logs or delivery status table.
2. Mark their email delivery status as `failed`.
3. Retry only failed email jobs.
4. Keep DB notification records unchanged if they were already created.
5. Make retries idempotent using a unique notification id and student id.

Example retry query:

```sql
SELECT
  student_id,
  notification_id
FROM notification_delivery_logs
WHERE
  notification_id = 'notif_bulk_1001'
  AND channel = 'email'
  AND status = 'failed';
```

Then retry email only for these 200 students.

## Should DB Save And Email Sending Happen Together?

No, they should not happen together in the same synchronous flow.

Saving to DB should happen first because the database is the source of truth. Once the notification is stored, email and in-app delivery can happen asynchronously through background workers.

Reason:

- DB insert is internal and usually reliable.
- Email API is external and can fail due to rate limits, downtime, or network issues.
- If both happen together, one email failure can break the whole notification process.
- The system needs retry support for email without creating duplicate DB records.
- In-app notification can be delivered immediately if the student is online, but the stored notification should exist first.

Better order:

1. Create one notification record.
2. Create delivery rows for students.
3. Publish email jobs and in-app jobs to a queue.
4. Workers process jobs in parallel.
5. Track success/failure per student and per channel.

## Additional Table For Delivery Tracking

To make failures trackable, add a delivery log table.

```sql
CREATE TABLE notification_delivery_logs (
  id BIGSERIAL PRIMARY KEY,
  notification_id VARCHAR(50) NOT NULL,
  student_id VARCHAR(50) NOT NULL,
  channel VARCHAR(20) NOT NULL CHECK (channel IN ('email', 'in_app')),
  status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'sent', 'failed')),
  attempt_count INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP,
  UNIQUE (notification_id, student_id, channel)
);
```

Useful index:

```sql
CREATE INDEX idx_delivery_logs_status_channel
ON notification_delivery_logs(channel, status, updated_at);
```

## Redesigned Reliable Flow

The API should not send all emails directly. It should enqueue jobs.

Revised pseudocode:

```text
function notify_all(student_ids, message):
  notification_id = generate_id()

  begin_transaction()

  save_notification(
    id = notification_id,
    title = "Placement Notification",
    message = message,
    notificationType = "Placement"
  )

  for batch in chunks(student_ids, 1000):
    bulk_insert_student_notifications(batch, notification_id)
    bulk_insert_delivery_logs(batch, notification_id, "email", "pending")
    bulk_insert_delivery_logs(batch, notification_id, "in_app", "pending")

  commit_transaction()

  enqueue_job("send_email_bulk", notification_id)
  enqueue_job("push_in_app_bulk", notification_id)

  return {
    "notification_id": notification_id,
    "status": "accepted"
  }
```

Email worker:

```text
function send_email_worker(notification_id):
  pending_rows = get_pending_delivery_logs(
    notification_id = notification_id,
    channel = "email",
    limit = 500
  )

  for row in pending_rows:
    try:
      send_email(row.student_id, notification_id)
      mark_delivery_status(row.student_id, notification_id, "email", "sent")
    catch error:
      increment_attempt_count(row.student_id, notification_id, "email")

      if attempt_count < 3:
        enqueue_retry("send_email", row.student_id, notification_id)
      else:
        mark_delivery_status(
          row.student_id,
          notification_id,
          "email",
          "failed",
          error.message
        )
```

In-app worker:

```text
function push_in_app_worker(notification_id):
  pending_rows = get_pending_delivery_logs(
    notification_id = notification_id,
    channel = "in_app",
    limit = 1000
  )

  for row in pending_rows:
    try:
      push_to_app(row.student_id, notification_id)
      mark_delivery_status(row.student_id, notification_id, "in_app", "sent")
    catch error:
      mark_delivery_status(
        row.student_id,
        notification_id,
        "in_app",
        "failed",
        error.message
      )
```

Retry failed emails:

```text
function retry_failed_emails(notification_id):
  failed_rows = get_failed_delivery_logs(
    notification_id = notification_id,
    channel = "email",
    max_attempts_less_than = 3
  )

  for row in failed_rows:
    enqueue_retry("send_email", row.student_id, notification_id)
```

## SQL For Failed Email Retry

```sql
SELECT
  student_id,
  notification_id
FROM notification_delivery_logs
WHERE
  notification_id = 'notif_bulk_1001'
  AND channel = 'email'
  AND status = 'failed'
  AND attempt_count < 3;
```

Reset failed rows to pending before retry:

```sql
UPDATE notification_delivery_logs
SET
  status = 'pending',
  updated_at = CURRENT_TIMESTAMP
WHERE
  notification_id = 'notif_bulk_1001'
  AND channel = 'email'
  AND status = 'failed'
  AND attempt_count < 3;
```

## Making It Fast

To handle 50,000 students:

- Use bulk inserts instead of one DB insert per student.
- Use queue workers for email and in-app delivery.
- Process jobs in batches.
- Run multiple workers in parallel.
- Respect email provider rate limits.
- Use idempotency keys to avoid duplicate sends.

Example idempotency key:

```text
notif_bulk_1001:stu_2300320100222:email
```

## Final Stage 5 Approach

The reliable design should save notification data first, then process email and in-app delivery asynchronously using queues and workers. Each student and channel should have a delivery status. If 200 email sends fail, only those failed email jobs should be retried, without recreating the notification or resending to all 50,000 students.

# Stage 6

# Priority Inbox Implementation

The product requirement is to show the top `n` most important unread notifications first. For this stage, I implemented code to find the top 10 priority notifications from the provided Notification API.

Code file:

```text
stage6_priority_inbox.py
```

Screenshot output:

```text
stage6_priority_output.png
```

HTML output:

```text
stage6_priority_output.html
```

Log file:

```text
logs/stage6.log
```

## Priority Rule

Priority is calculated using notification type weight first and recency second.

Type weights:

```text
Placement = 3
Result = 2
Event = 1
```

Sorting rule:

```text
higher type weight first
if type weight is same, latest timestamp first
```

Example:

- A recent `Placement` notification is ranked above a `Result`.
- A recent `Result` notification is ranked above an `Event`.
- Between two `Placement` notifications, the newer one is ranked first.

## Implementation Approach

The code fetches notifications from:

```text
http://4.224.186.213/evaluation-service/notifications
```

The route is protected, so the code reads the access token from `.env`. If the saved token is rejected, the script tries to refresh the token using the client details available locally.

The code does not hard-code notifications. It only uses the API response.

The implementation uses a min-heap of size 10:

```text
heap size = 10
```

For each notification:

1. Calculate type weight.
2. Parse timestamp.
3. Create priority score `(type_weight, timestamp)`.
4. Add it to the heap if there is space.
5. If heap already has 10 items, replace the lowest priority item only when the new item is better.

At the end, the heap contains only the top 10 notifications.

## Computation Cost

If total notifications are `m` and top count is `n`:

```text
O(m log n)
```

For this stage:

```text
n = 10
```

So each new notification update costs:

```text
O(log 10)
```

Since 10 is very small, this is almost constant time in practice.

## Maintaining Top 10 When New Notifications Keep Coming

New notifications will keep coming through WebSocket as planned in Stage 1. The frontend or backend can maintain the current top 10 using the same heap approach.

For each new unread notification:

1. Calculate its score.
2. If fewer than 10 items exist, add it.
3. If 10 items already exist, compare it with the lowest priority item.
4. If the new notification has higher priority, replace the lowest item.
5. If a notification is marked as read, remove it from the priority inbox and refill from the next best unread item.

For a production system, the backend can maintain a Redis sorted set per student:

```text
priority_inbox:stu_2300320100222
```

The score can be formed using type weight and timestamp:

```text
score = type_weight * 10000000000 + unix_timestamp
```

To fetch top 10:

```text
ZREVRANGE priority_inbox:stu_2300320100222 0 9
```

Tradeoff:

- Heap is simple and good for application memory.
- Redis sorted set is better when multiple servers need the same priority inbox state.
- Redis needs cache invalidation when notifications are read or expired.

## Stage 6 Output

The script prints the top 10 priority notifications in terminal and also generates a screenshot file. The screenshot proves the output without depending on manual copying from terminal.
