# Module 20.2 — Email Provider Interface & Mock Email Provider

## Executive Summary

This document details the provider abstraction layer and `MockEmailProvider` implementation for **Module 20.2 — Email Provider Interface & Mock Email Provider**. By establishing the `IEmailProvider` contract, the Email Infrastructure abstracts transport-specific drivers (SMTP, Nodemailer, Amazon SES, SendGrid, Mailgun) behind a unified, strongly typed strategy interface suitable for zero-downtime provider swapping and local dev/test simulation.

---

## 1. Strategy Contract Interface (`IEmailProvider`)

Location: `src/modules/email/interfaces/email-provider.interface.ts`

```typescript
export interface IEmailProvider {
  readonly providerName: string;
  getProviderName(): string;
  send(request: IEmailRequest): Promise<IEmailResponse>;
  verifyConnection(): Promise<boolean>;
  supportsCategory?(category: EmailCategory): boolean;
}
```

---

## 2. Request & Response Envelopes

### 2.1 Universal Request Payload (`IEmailRequest`)
Location: `src/modules/email/interfaces/email-request.interface.ts`

```typescript
export interface IEmailRequest {
  to: IEmailRecipient | IEmailRecipient[] | string | string[];
  cc?: IEmailRecipient | IEmailRecipient[] | string | string[];
  bcc?: IEmailRecipient | IEmailRecipient[] | string | string[];
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
  headers?: Record<string, string>;
  metadata?: Record<string, unknown>;
}
```

### 2.2 Standardized Delivery Envelope (`IEmailResponse`)
Location: `src/modules/email/interfaces/email-response.interface.ts`

```typescript
export interface IEmailResponse {
  success: boolean;
  messageId?: string;
  provider: string;
  acceptedRecipients?: string[];
  rejectedRecipients?: string[];
  errorMessage?: string;
  sentAt?: Date;
  statusCode?: number;
}
```

---

## 3. Mock Email Provider (`MockEmailProvider`)

Location: `src/modules/email/providers/mock.provider.ts`

* **Purpose:** Simulates real email delivery behavior during local development, integration testing, and CI/CD pipelines without sending external network requests.
* **Key Features:**
  * Implements `IEmailProvider`.
  * Generates unique mock `messageId` references.
  * Normalizes `to`, `cc`, `bcc` recipient arrays.
  * Logs safe diagnostic telemetry to standard output.
  * Returns 200 OK `IEmailResponse` with accepted recipient lists.

---

## 4. Verification

* **TypeScript Compilation (`npx tsc --noEmit`):** ✅ Clean (0 Errors)
* **Files Delivered:**
  * `src/modules/email/interfaces/email-provider.interface.ts`
  * `src/modules/email/interfaces/email-request.interface.ts`
  * `src/modules/email/interfaces/email-response.interface.ts`
  * `src/modules/email/providers/mock.provider.ts`
  * `docs/EMAIL_MODULE_STEP_20_2.md`
