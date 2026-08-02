# Module 20.4 — Email Template Engine Foundation

## Executive Summary

This document details the template engine architecture and renderer infrastructure for **Module 20.4 — Email Template Engine Foundation**. Built following Clean Architecture, SOLID principles, and the Open/Closed Principle, this framework establishes a provider-independent template rendering engine (`EmailTemplateRenderer`) capable of rendering dynamic contexts into HTML layouts (`DefaultEmailLayout`) and plain text fallback outputs without vendor lock-in.

---

## 1. Template Engine Architecture & Layout

Location: `src/modules/email/templates/`

```
server/src/modules/email/templates/
├── interfaces/
│   ├── template-data.interface.ts     # IEmailTemplateData payload map
│   ├── template-result.interface.ts   # IEmailTemplateResult output envelope
│   └── template-renderer.interface.ts # ITemplateRenderer engine contract
├── layouts/
│   └── default-layout.ts              # DefaultEmailLayout HTML wrapper
├── base/
│   └── base-template.ts               # BaseEmailTemplate abstract base class
├── renderer/
│   └── template-renderer.ts           # EmailTemplateRenderer engine class
└── index.ts                           # Barrel exports
```

---

## 2. Core Contracts & Abstractions

### 2.1 Template Engine Interface (`ITemplateRenderer`)
```typescript
export interface ITemplateRenderer {
  render(templateName: string, data: IEmailTemplateData): Promise<IEmailTemplateResult>;
  registerTemplate(template: IEmailTemplate): void;
  hasTemplate(templateName: string): boolean;
}
```

### 2.2 Abstract Base Template (`BaseEmailTemplate`)
Provides template interpolation (`{{variable}}` substitution) and layout wrapping:

```typescript
export abstract class BaseEmailTemplate implements IEmailTemplate {
  abstract readonly templateId: EmailTemplateId | string;
  abstract readonly subject: string;

  protected interpolate(templateStr: string, data: IEmailTemplateData): string;
  protected abstract renderHtmlContent(data: IEmailTemplateData): string;
  protected abstract renderTextContent(data: IEmailTemplateData): string;

  render(context: IEmailTemplateData): IRenderedEmail;
}
```

### 2.3 Shared HTML Layout (`DefaultEmailLayout`)
Provides consistent responsive HTML email wrappers (CSS resets, container bounds, headers, footers, copyright notices).

---

## 3. Template Engine Features & Error Handling

1. **Interpolation Engine:** Internal regex string interpolation (`\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}`) supporting nested dot-notation object paths (`user.name`, `order.total`).
2. **Strict Context Validation:** Asserts non-null context inputs and template registration prior to rendering.
3. **Typed Exception Isolation:** Throws strongly typed errors on missing templates (`Email template 'xyz' is not registered`), invalid inputs, or rendering exceptions.
4. **Provider Decoupling:** Rendering engine operates completely independently of vendor adapters (Nodemailer, Amazon SES, SendGrid).

---

## 4. Verification

* **TypeScript Compilation (`npx tsc --noEmit`):** ✅ Clean (0 Errors)
* **Files Delivered:**
  * `src/modules/email/templates/interfaces/template-data.interface.ts`
  * `src/modules/email/templates/interfaces/template-result.interface.ts`
  * `src/modules/email/templates/interfaces/template-renderer.interface.ts`
  * `src/modules/email/templates/layouts/default-layout.ts`
  * `src/modules/email/templates/base/base-template.ts`
  * `src/modules/email/templates/renderer/template-renderer.ts`
  * `src/modules/email/templates/index.ts`
  * `docs/EMAIL_MODULE_STEP_20_4.md`
