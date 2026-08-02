# Module 20.1 — Email Service Architecture & Folder Structure

## Executive Summary

This document details the provider-independent email infrastructure architecture for **Module 20.1 — Email Service Architecture & Folder Structure**. Built using Clean Architecture, SOLID principles, and the Strategy Pattern, this framework establishes a centralized email dispatch system capable of handling transactional, authentication, order status, invoice, coupon, and marketing communications across multiple vendors (Nodemailer, Amazon SES, SendGrid, Mailgun) without leaking transport-specific code into business domain services.

---

## 1. Folder Structure Layout

```
server/src/modules/email/
├── types/
│   └── email.types.ts             # Enums: EmailCategory, EmailPriority, EmailStatus, EmailTemplateId
├── constants/
│   └── email.constants.ts         # DEFAULT_SENDER, RETRY_CONFIG, ATTACHMENT_LIMITS
├── interfaces/
│   ├── email-recipient.interface.ts  # IEmailRecipient target contract
│   ├── email-attachment.interface.ts # IEmailAttachment specification
│   ├── email-request.interface.ts    # IEmailRequest universal dispatch payload
│   ├── email-response.interface.ts   # IEmailResponse vendor result envelope
│   ├── email-provider.interface.ts   # IEmailProvider Strategy Pattern contract
│   ├── email-service.interface.ts    # IEmailService application boundary contract
│   └── email-template.interface.ts   # IEmailTemplate rendering contract
├── providers/
│   ├── smtp.provider.ts           # SmtpEmailProvider placeholder
│   ├── nodemailer.provider.ts     # NodemailerEmailProvider placeholder
│   ├── ses.provider.ts            # AmazonSesEmailProvider placeholder
│   ├── sendgrid.provider.ts       # SendGridEmailProvider placeholder
│   ├── mailgun.provider.ts        # MailgunEmailProvider placeholder
│   └── mock.provider.ts           # MockEmailProvider local dev implementation
└── index.ts                       # Barrel exports
```

---

## 2. Enums & Constants

### 2.1 Types (`email.types.ts`)
* **`EmailCategory`:** `TRANSACTIONAL`, `AUTH`, `ORDER`, `INVOICE`, `PROMOTIONAL`, `NEWSLETTER`, `ADMIN_NOTIFICATION`, `VENDOR_NOTIFICATION`, `SYSTEM`.
* **`EmailPriority`:** `LOW`, `NORMAL`, `HIGH`, `CRITICAL`.
* **`EmailStatus`:** `PENDING`, `PROCESSING`, `SENT`, `FAILED`, `BOUNCED`, `QUEUED`.
* **`EmailTemplateId`:** `otp`, `welcome`, `password_reset`, `order_confirmation`, `order_shipped`, `order_delivered`, `order_cancelled`, `refund_issued`, `invoice`, `coupon_reward`, `promotional`, `newsletter`, `admin_alert`.

### 2.2 Constants (`email.constants.ts`)
* **`DEFAULT_SENDER`:** Default sender name and email address.
* **`RETRY_CONFIG`:** Max retries (3), initial delay (1000ms), backoff factor (2000ms).
* **`ATTACHMENT_LIMITS`:** Max attachment size (25MB), max count (10).

---

## 3. Core Strategy Contracts

### 3.1 Universal Request Payload (`IEmailRequest`)
```typescript
export interface IEmailRequest {
  to: IEmailRecipient | IEmailRecipient[] | string | string[];
  from?: IEmailRecipient | string;
  replyTo?: IEmailRecipient | string;
  subject: string;
  templateId?: EmailTemplateId | string;
  context?: Record<string, unknown>;
  html?: string;
  text?: string;
  attachments?: IEmailAttachment[];
  category: EmailCategory;
  priority: EmailPriority;
  metadata?: Record<string, unknown>;
}
```

### 3.2 Provider Strategy Contract (`IEmailProvider`)
```typescript
export interface IEmailProvider {
  readonly providerName: string;
  send(request: IEmailRequest): Promise<IEmailResponse>;
  supportsCategory?(category: EmailCategory): boolean;
}
```

### 3.3 Application Boundary Contract (`IEmailService`)
```typescript
export interface IEmailService {
  send(request: IEmailRequest): Promise<IEmailResponse>;
  sendBatch(requests: IEmailRequest[]): Promise<IEmailResponse[]>;
  registerProvider(provider: IEmailProvider): void;
  getProvider(providerName?: string): IEmailProvider | null;
}
```

---

## 4. Enterprise Architecture & Extensibility Analysis

1. **Strategy Pattern & Open/Closed Principle (OCP):** New email vendors (e.g. switching from Nodemailer to AWS SES or SendGrid) are introduced by adding a class that implements `IEmailProvider` and registering it via `registerProvider()`. Core application services call `IEmailService.send()` without changing code.
2. **Transport Independence:** Business domain services dispatch `IEmailRequest` objects containing functional categories and template contexts without coupling to vendor-specific SDKs or HTTP payload formats.
3. **Dependency Injection (DIP):** Clean Architecture interface boundaries isolate domain callers from concrete delivery drivers.

---

## 5. Verification

* **TypeScript Compilation (`npx tsc --noEmit`):** ✅ Clean (0 Errors)
* **Files Created:**
  * `src/modules/email/types/email.types.ts`
  * `src/modules/email/constants/email.constants.ts`
  * `src/modules/email/interfaces/email-recipient.interface.ts`
  * `src/modules/email/interfaces/email-attachment.interface.ts`
  * `src/modules/email/interfaces/email-request.interface.ts`
  * `src/modules/email/interfaces/email-response.interface.ts`
  * `src/modules/email/interfaces/email-provider.interface.ts`
  * `src/modules/email/interfaces/email-service.interface.ts`
  * `src/modules/email/interfaces/email-template.interface.ts`
  * `src/modules/email/providers/smtp.provider.ts`
  * `src/modules/email/providers/nodemailer.provider.ts`
  * `src/modules/email/providers/ses.provider.ts`
  * `src/modules/email/providers/sendgrid.provider.ts`
  * `src/modules/email/providers/mailgun.provider.ts`
  * `src/modules/email/providers/mock.provider.ts`
  * `src/modules/email/index.ts`
  * `docs/EMAIL_MODULE_STEP_20_1.md`
