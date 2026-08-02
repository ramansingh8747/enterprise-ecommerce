# Module 19.2 — Notification Data Model & Persistence Layer

## Executive Summary

This document details the provider-independent database persistence design for **Module 19.2 – Notification Data Model**. Implemented using Mongoose and TypeScript, the `NotificationModel` provides a transport-independent document schema capable of storing notification logs, worker queue states, user inbox items, and template contexts without coupling to external vendor attributes (no Twilio SIDs, SendGrid IDs, or FCM tokens stored on the root aggregate).

---

## 1. Mongoose Model & Schema Specification

Location: `src/modules/notification/models/notification.model.ts`

* **Collection Name:** `notifications`
* **Schema Configuration:**
  * `timestamps: true` (`createdAt`, `updatedAt`)
  * `versionKey: false`
  * `strict: true`

### 1.1 Field Definitions

| Field Name | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `_id` | `ObjectId` | Primary Key | Unique document identifier. |
| `userId` | `ObjectId` | Optional, ref `User`, indexed | Recipient user ID if targeted to a registered customer. |
| `type` | `String` | Required, Enum `NotificationType`, indexed | Domain event type (e.g. `ORDER_CREATED`, `LOW_STOCK`). |
| `channel` | `String` | Required, Enum `NotificationChannel`, indexed | Channel target (`EMAIL`, `SMS`, `PUSH`, `IN_APP`, `WEBHOOK`). |
| `status` | `String` | Required, Enum `NotificationStatus`, default `PENDING`, indexed | Lifecycle state (`PENDING`, `PROCESSING`, `SENT`, `FAILED`). |
| `priority` | `String` | Required, Enum `NotificationPriority`, default `NORMAL`, indexed | Delivery priority (`LOW`, `NORMAL`, `HIGH`, `CRITICAL`). |
| `title` | `String` | Optional, max 250 chars | Subject line or notification header. |
| `message` | `String` | Required, max 10000 chars | Body text or rendered template content. |
| `payload` | `Mixed` | Default `{}` | Dynamic context key-value map for rendering or client data. |
| `metadata` | `Mixed` | Default `{}` | Telemetry metadata (`source`, `correlationId`, `tenantId`, `tags`). |
| `recipient` | Subdocument | Required | Generic target (`userId`, `email`, `phone`, `deviceToken`, `webhookUrl`). |
| `attachments` | Subdocument[]| Default `[]` | List of attachments (`filename`, `contentType`, `path`, `cid`). |
| `scheduledAt` | `Date` | Optional, indexed | UTC timestamp for deferred or scheduled notifications. |
| `sentAt` | `Date` | Optional | UTC timestamp when successfully dispatched. |
| `readAt` | `Date` | Optional | UTC timestamp when read by user. |
| `failureReason` | `String` | Optional, max 2000 chars | Diagnostic error message if delivery failed. |
| `retryCount` | `Number` | Required, default `0`, min 0 | Number of failed delivery attempts. |
| `maxRetries` | `Number` | Required, default `3`, min 0 | Maximum allowed retry attempts. |
| `isRead` | `Boolean` | Required, default `false`, indexed | Read/unread flag for IN_APP inbox. |

---

## 2. MongoDB Index Strategy

| Index Name | Index Keys | Query Use Case & Performance Justification |
| :--- | :--- | :--- |
| `idx_notification_user_inbox` | `{ userId: 1, isRead: 1, createdAt: -1 }` | Powers the customer **In-App Notification Inbox** API with fast recency sorting and unread filtering. |
| `idx_notification_queue_worker` | `{ status: 1, priority: -1, scheduledAt: 1, createdAt: 1 }` | Powers background **Queue Worker Dispatchers** scanning for `PENDING` notifications sorted by priority. |
| `idx_notification_status_created` | `{ status: 1, createdAt: 1 }` | Powers automated **Log Retention & Archiving Jobs** sweeping old sent/failed notification logs. |
| Single Field Indexes | `userId`, `type`, `channel`, `status`, `priority`, `isRead`, `scheduledAt` | Fast single-column filter operations. |

---

## 3. Provider Independence & Scalability Analysis

1. **Vendor Decoupling:** Provider-specific metadata (such as vendor transaction SIDs or API response headers) is stored in the flexible `metadata.attributes` map rather than top-level fields. This guarantees zero schema changes when switching vendors (e.g. moving from Twilio to AWS SNS).
2. **Multi-Channel Single Collection:** Unified notification lifecycle model simplifies cross-channel audit logging, analytics dashboards, and queue management.
3. **Queue & Inbox Hybrid Support:** The schema naturally supports both asynchronous background queue worker picking (`status`, `priority`, `scheduledAt`) and customer-facing inbox queries (`userId`, `isRead`, `readAt`).

---

## 4. Verification

* **TypeScript Compilation (`npx tsc --noEmit`):** ✅ Clean (0 Errors)
* **Files Delivered:**
  * `src/modules/notification/models/notification.model.ts`
  * `src/modules/notification/interfaces/notification.interface.ts`
  * `src/modules/notification/index.ts`
  * `docs/NOTIFICATION_MODULE_STEP_19_2.md`
