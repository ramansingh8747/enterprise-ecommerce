# Module 20.5 — Base Email Layout & Shared Components

## Executive Summary

This document details the reusable layout system, component partials, style helpers, and branding configurations for **Module 20.5 — Base Email Layout & Shared Components**. Built following Clean Architecture, SOLID principles, and HTML email compatibility standards (presentation tables, inline-style ready CSS, email-safe typography), this module establishes a modular layout foundation (`BaseEmailLayout`) that all future transactional and marketing templates will inherit without hardcoding business brand details.

---

## 1. Layout & Component System Architecture

Location: `src/modules/email/templates/`

```
server/src/modules/email/templates/
├── interfaces/
│   └── layout-options.interface.ts  # IBrandingConfig, IButtonConfig, IEmailLayoutOptions
├── helpers/
│   ├── style.helper.ts              # StyleHelper (embedded email CSS resets & themes)
│   └── html.helper.ts               # HtmlHelper (escaping & table wrapping)
├── partials/
│   ├── header.partial.ts            # HeaderPartial (logo & company name)
│   ├── footer.partial.ts            # FooterPartial (footer links & unsubscribe)
│   ├── button.partial.ts            # ButtonPartial (responsive CTA buttons)
│   ├── divider.partial.ts           # DividerPartial (horizontal rules)
│   ├── copyright.partial.ts         # CopyrightPartial (copyright notice)
│   └── social-links.partial.ts      # SocialLinksPartial (social channels)
├── layouts/
│   └── base-email.layout.ts         # BaseEmailLayout HTML document assembler
└── index.ts                         # Barrel exports
```

---

## 2. Reusable Component Partials

* **`HeaderPartial`:** Displays brand logo image or formatted text header linked to corporate website.
* **`FooterPartial`:** Assembles footer text, social channel links, optional unsubscribe URL, and copyright notice.
* **`ButtonPartial`:** Renders email-safe call-to-action (CTA) buttons (`IButtonConfig`).
* **`DividerPartial`:** Renders email-safe horizontal rule dividers.
* **`CopyrightPartial`:** Generates dynamic copyright year string (`© 2026 Enterprise Store`).
* **`SocialLinksPartial`:** Renders social network channel links.

---

## 3. Configuration Interfaces (`layout-options.interface.ts`)

```typescript
export interface IBrandingConfig {
  companyName: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  textColor?: string;
  backgroundColor?: string;
  contactEmail?: string;
  websiteUrl?: string;
}

export interface IButtonConfig {
  text: string;
  url: string;
  backgroundColor?: string;
  textColor?: string;
  align?: 'left' | 'center' | 'right';
}

export interface IEmailLayoutOptions {
  title?: string;
  preheader?: string;
  branding?: Partial<IBrandingConfig>;
  unsubscribeUrl?: string;
  showSocialLinks?: boolean;
}
```

---

## 4. Verification

* **TypeScript Compilation (`npx tsc --noEmit`):** ✅ Clean (0 Errors)
* **Files Delivered:**
  * `src/modules/email/templates/interfaces/layout-options.interface.ts`
  * `src/modules/email/templates/helpers/style.helper.ts`
  * `src/modules/email/templates/helpers/html.helper.ts`
  * `src/modules/email/templates/partials/header.partial.ts`
  * `src/modules/email/templates/partials/footer.partial.ts`
  * `src/modules/email/templates/partials/button.partial.ts`
  * `src/modules/email/templates/partials/divider.partial.ts`
  * `src/modules/email/templates/partials/copyright.partial.ts`
  * `src/modules/email/templates/partials/social-links.partial.ts`
  * `src/modules/email/templates/layouts/base-email.layout.ts`
  * `src/modules/email/templates/index.ts`
  * `docs/EMAIL_MODULE_STEP_20_5.md`
