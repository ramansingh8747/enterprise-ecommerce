# Module 19.4 — Notification Service & Business Logic

## Executive Summary

This document details the business logic implementation for **Module 19.4 – Notification Service**. Built according to Clean Architecture and SOLID principles, `NotificationService` implements `INotificationService` and encapsulates all domain rules, state machine transitions, retry policies, scheduling validations, and inbox mark-as-read orchestration while remaining completely transport-independent.

---

## 1. Service Architecture & Public API

Location: `src/modules/notification/services/notification.service.ts`

```typescript
export class NotificationService implements INotificationService {
  constructor(private readonly notificationRepository: INotificationRepository) {}

  async createNotification(data: Partial<INotification>): Promise<INotification>;
  async createBulkNotifications(items: Partial<INotification>[]): Promise<INotification[]>;
  async scheduleNotification(data: Partial<INotification>, scheduledAt: Date): Promise<INotification>;
  async getNotificationById(id: string): Promise<INotification | null>;
  async getUserNotifications(userId: string, filter?: INotificationQueryFilter): Promise<INotificationQueryResult>;
  async getUnreadUserNotifications(userId: string, filter?: INotificationQueryFilter): Promise<INotificationQueryResult>;
  async countUnreadNotifications(userId: string): Promise<number>;
  async markAsRead(userId: string, notificationId: string): Promise<INotification>;
  async markAllAsRead(userId: string, notificationIds?: string[]): Promise<number>;
  async updateNotificationStatus(id: string, newStatus: NotificationStatus, failureReason?: string): Promise<INotification>;
  async retryNotification(id: string): Promise<INotification>;
  async cancelNotification(id: string): Promise<INotification>;
  async deleteNotification(id: string): Promise<boolean>;
}
```

---

## 2. Business Rules & Invariants

### 2.1 State Machine Lifecycle Transition Rules
Status transitions are strictly validated by `validateStatusTransition(currentStatus, newStatus)`:

```
                            STATE MACHINE TRANSITION FLOW

      ┌────────────────────────────────────────────────────────┐
      │                                                        │
      ▼                                                        │
[ PENDING ] ──────▶ [ QUEUED ] ──────▶ [ PROCESSING ] ─────▶ [ SENT ] (Terminal)
     │                    │                   │
     ├────────────────────┼───────────────────┼───────────┐
     ▼                    ▼                   ▼           ▼
[ CANCELLED ]       [ CANCELLED ]        [ FAILED ]  [ RETRYING ]
 (Terminal)          (Terminal)               │           │
                                              ▼           ▼
                                         [ RETRYING ] ──▶ [ PROCESSING ]
```

* `PENDING` $\rightarrow$ `PROCESSING`, `QUEUED`, `CANCELLED`, `FAILED`
* `QUEUED` $\rightarrow$ `PROCESSING`, `CANCELLED`, `FAILED`
* `PROCESSING` $\rightarrow$ `SENT`, `FAILED`
* `FAILED` $\rightarrow$ `RETRYING`, `CANCELLED`, `PENDING`
* `RETRYING` $\rightarrow$ `PROCESSING`, `FAILED`, `CANCELLED`
* `SENT` $\rightarrow$ Terminal state (no status modifications permitted)
* `CANCELLED` $\rightarrow$ Terminal state

### 2.2 Input & Scheduling Validation
* **Enum Validation:** Asserts `type`, `channel`, and `priority` match predefined architectural enums.
* **Recipient Target Assertion:** Verifies recipient object contains at least one destination endpoint (`userId`, `email`, `phone`, `deviceToken`, or `webhookUrl`).
* **Scheduled Timestamp Validation:** Reject scheduling dates that lie in the past (`scheduledAt < Date.now()`). Automatically sets initial status to `QUEUED`.

### 2.3 Retry Policy (State Only)
* Asserts `notification.status === FAILED` or `RETRYING`.
* Enforces `retryCount < maxRetries` limit. Throws domain exception if max retries exceeded.
* Increments `retryCount` and records failure notes.

---

## 3. Verification

* **TypeScript Compilation (`npx tsc --noEmit`):** ✅ Clean (0 Errors)
* **Files Delivered:**
  * `src/modules/notification/services/notification.service.ts`
  * `src/modules/notification/interfaces/notification-service.interface.ts`
  * `src/modules/notification/index.ts`
  * `docs/NOTIFICATION_MODULE_STEP_19_4.md`
