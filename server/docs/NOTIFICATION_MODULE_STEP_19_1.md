# Module 19.1 — Notification Architecture & Foundation

## Executive Summary

This document details the transport-independent foundation and contract specifications for **Module 19.1 — Notification Architecture & Foundation**. Designed according to Clean Architecture, SOLID principles, and the Strategy Pattern, this framework establishes a universal notification dispatch infrastructure supporting multi-channel delivery (EMAIL, SMS, PUSH, IN_APP, WEBHOOK) without vendor lock-in or transport coupling.

---

## 1. Folder Structure Layout

```
server/src/modules/notification/
├── types/
│   └── notification.types.ts             # Enums: Channel, Type, Priority, Status, Template
├── interfaces/
│   ├── notification-recipient.interface.ts  # Recipient target data model
│   ├── notification-attachment.interface.ts # Universal attachment specification
│   ├── notification-metadata.interface.ts   # Distributed tracing and telemetry metadata
│   ├── notification-context.interface.ts    # Template context key-value map
│   ├── notification-payload.interface.ts    # Universal dispatch payload
│   ├── notification-result.interface.ts     # Standardized delivery result wrapper
│   ├── notification-provider.interface.ts   # Vendor provider strategy contract
│   ├── notification-service.interface.ts    # Application service boundary contract
│   ├── notification.interface.ts            # Core aggregate domain shape
│   └── notification-repository.interface.ts # Persistence contract
├── dto/
│   └── notification.dto.ts                  # Request/Response DTO contracts
└── index.ts                                 # Barrel exports
```

---

## 2. Enterprise Enums (`notification.types.ts`)

Location: `src/modules/notification/types/notification.types.ts`

```typescript
export enum NotificationChannel {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  PUSH = 'PUSH',
  IN_APP = 'IN_APP',
  WEBHOOK = 'WEBHOOK',
  MOCK = 'MOCK',
}

export enum NotificationType {
  ORDER_CREATED = 'ORDER_CREATED',
  ORDER_CONFIRMED = 'ORDER_CONFIRMED',
  ORDER_CANCELLED = 'ORDER_CANCELLED',
  ORDER_DELIVERED = 'ORDER_DELIVERED',
  ORDER_SHIPPED = 'ORDER_SHIPPED',
  PAYMENT_SUCCESS = 'PAYMENT_SUCCESS',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  LOW_STOCK = 'LOW_STOCK',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  WELCOME = 'WELCOME',
  PASSWORD_RESET = 'PASSWORD_RESET',
  OTP = 'OTP',
  COUPON_CREATED = 'COUPON_CREATED',
  REVIEW_RECEIVED = 'REVIEW_RECEIVED',
  WISHLIST_PRICE_DROP = 'WISHLIST_PRICE_DROP',
  GENERIC = 'GENERIC',
}

export enum NotificationPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum NotificationStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SENT = 'SENT',
  FAILED = 'FAILED',
  RETRYING = 'RETRYING',
  CANCELLED = 'CANCELLED',
  QUEUED = 'QUEUED',
}
```

---

## 3. Core Interface Contracts

### 3.1 Universal Notification Payload (`NotificationPayload`)

```typescript
export interface NotificationPayload {
  id: string;
  type: NotificationType;
  channel: NotificationChannel;
  priority: NotificationPriority;
  recipient: NotificationRecipient;
  subject?: string;
  templateId?: string;
  context: NotificationContext;
  attachments?: NotificationAttachment[];
  metadata: NotificationMetadata;
  status: NotificationStatus;
  scheduledAt?: Date;
  createdAt: Date;
}
```

### 3.2 Standardized Delivery Result (`NotificationResult`)

```typescript
export interface NotificationResult {
  success: boolean;
  messageId?: string;
  provider?: string;
  channel: NotificationChannel;
  error?: string;
  sentAt?: Date;
  retryCount?: number;
}
```

### 3.3 Provider Strategy Contract (`INotificationProvider`)

```typescript
export interface INotificationProvider {
  readonly providerName: string;
  readonly channel: NotificationChannel;
  send(payload: NotificationPayload): Promise<NotificationResult>;
  supports(channel: NotificationChannel): boolean;
}
```

### 3.4 Application Service Contract (`INotificationService`)

```typescript
export interface INotificationService {
  send(payload: NotificationPayload): Promise<NotificationResult>;
  sendBatch(payloads: NotificationPayload[]): Promise<NotificationResult[]>;
  registerProvider(provider: INotificationProvider): void;
  getProvider(channel: NotificationChannel): INotificationProvider | null;
}
```

---

## 4. Enterprise Architecture & Extensibility Analysis

### 4.1 Transport Independence & Single Responsibility Principle (SRP)
* Domain services (e.g. `OrderService`, `AuthService`) publish business events or request notifications without knowing whether delivery occurs via SendGrid, Twilio, Firebase, or Webhooks.
* The notification framework decouples **event origin** from **transport execution**.

### 4.2 Open/Closed Principle (OCP) & Provider Strategy Pattern
* Adding a new provider (e.g. SendGrid for EMAIL or Twilio for SMS) requires implementing `INotificationProvider` and registering it via `registerProvider(provider)`.
* **Zero changes** to existing business services or core notification contracts are required when plugging in new vendors.

```
                            STRATEGY PATTERN FLOW
                                     
                               [ NotificationPayload ]
                                          │
                                          ▼
                             [ INotificationService ]
                                          │
                  ┌───────────────────────┼───────────────────────┐
                  ▼                       ▼                       ▼
       [ SendGridEmailProvider ]  [ TwilioSmsProvider ]   [ FirebasePushProvider ]
        (Channel: EMAIL)          (Channel: SMS)          (Channel: PUSH)
```

---

## 5. Verification

* **TypeScript Compilation (`npx tsc --noEmit`):** ✅ Clean (0 Errors)
* **Contracts Created:**
  * `src/modules/notification/types/notification.types.ts`
  * `src/modules/notification/interfaces/notification-recipient.interface.ts`
  * `src/modules/notification/interfaces/notification-attachment.interface.ts`
  * `src/modules/notification/interfaces/notification-metadata.interface.ts`
  * `src/modules/notification/interfaces/notification-context.interface.ts`
  * `src/modules/notification/interfaces/notification-payload.interface.ts`
  * `src/modules/notification/interfaces/notification-result.interface.ts`
  * `src/modules/notification/interfaces/notification-provider.interface.ts`
  * `src/modules/notification/interfaces/notification-service.interface.ts`
  * `src/modules/notification/index.ts`
  * `docs/NOTIFICATION_MODULE_STEP_19_1.md`
