# Module 20.3 — Email Service Business Layer

## Executive Summary

This document details the application business service implementation for **Module 20.3 — Email Service (Business Layer)**. Built following Clean Architecture, SOLID principles, and the Strategy Pattern, `EmailService` acts as a transport-independent orchestrator between domain modules (Auth, Orders, Coupons) and underlying vendor adapters (`IEmailProvider`). It enforces strict request validation, default normalization, attachment limit checks, and registry provider lookups without leaking vendor-specific details (SMTP, SES, SendGrid) into application logic.

---

## 1. Service Architecture & Public API

Location: `src/modules/email/services/email.service.ts`

```typescript
export class EmailService implements IEmailService {
  constructor(private defaultProvider: IEmailProvider) {}

  async sendEmail(request: IEmailRequest): Promise<IEmailResponse>;
  async sendBulkEmails(requests: IEmailRequest[]): Promise<IEmailResponse[]>;
  async verifyProviderConnection(): Promise<boolean>;
  getProviderName(): string;
  registerProvider(provider: IEmailProvider): void;
  getProvider(providerName?: string): IEmailProvider | null;
}
```

---

## 2. Business Validations & Normalization Rules

1. **Request Payload Assertion (`validateRequest`):**
   * Asserts `to` recipient target is provided.
   * Asserts `subject` is a non-empty string.
   * Asserts `category` and `priority` match `EmailCategory` and `EmailPriority` enums.
   * Asserts presence of content body (`html`, `text`, or `templateId`).
   * Asserts attachment count does not exceed `ATTACHMENT_LIMITS.maxCount` (10 files).
2. **Default Normalization (`normalizeRequest`):**
   * Dynamically populates `from` sender defaults using `DEFAULT_SENDER` configuration if omitted by caller.
3. **Registry Provider Resolution:**
   * Resolves target provider strategy via `getProvider(request.metadata?.provider)` or falls back cleanly to `defaultProvider`.

---

## 3. Extensibility Hooks & Error Handling

* **Telemetry Hook (`logTelemetry`):** Prepared interface hook for correlation ID tracking and metrics reporting.
* **Queue Integration Hook (`enqueueForDelivery`):** Prepared hook for future background queue workers (BullMQ / RabbitMQ).
* **Retry Policy Hook (`executeWithRetry`):** Prepared wrapper for exponential backoff retries.
* **Enterprise Error Isolation:** Exceptions during dispatch execution are caught and returned as strongly typed `IEmailResponse` objects (`success: false`, `errorMessage`, status `500`) without crashing upper application services.

---

## 4. Verification

* **TypeScript Compilation (`npx tsc --noEmit`):** ✅ Clean (0 Errors)
* **Files Delivered:**
  * `src/modules/email/services/email.service.ts`
  * `src/modules/email/interfaces/email-service.interface.ts`
  * `src/modules/email/index.ts`
  * `docs/EMAIL_MODULE_STEP_20_3.md`
