# Module 15 – Step 15.9

Order Notifications Foundation

## Implementation Plan

1. **Why Notifications should be a separate module** — Channels, templates, retries, and vendor SDKs are a distinct bounded context. Isolating them keeps Order focused on commerce lifecycle and avoids leaking email/SMS details into Order services.
2. **Why Order should not directly send emails** — Order owns purchase state; delivery is a side effect. Coupling SES/Twilio into Order would block gateway swaps and mix write-path latency with outbound I/O.
3. **Why Notification Providers should be abstracted** — `INotificationProvider` defines a stable adapter (`send`, `sendEmail`, `sendSMS`, `sendPush`) so concrete vendors stay behind the interface (DIP).
4. **Why Factory Pattern** — `NotificationProviderFactory` selects mock/email/sms/push by config. New channels extend via new classes without changing consumers (OCP).
5. **Future Event-driven architecture** — Order emits domain events (placed/shipped/cancelled); Notification listeners consume them asynchronously without Order importing providers.
6. **Future retry strategy** — Failed sends mark `RETRYING` with backoff; retries live in Notification/queue workers, not Order transactions.
7. **Future queue integration** — Enqueue notification jobs (Bull/SQS/etc.) so Order APIs return quickly while workers deliver.
8. **Future template system** — Named templates (`NotificationTemplate`) render subject/body with order variables; providers only receive final payloads.
9. **SOLID** — SRP per layer; DIP via interfaces; OCP via factory/providers; ISP via focused contracts; LSP via interchangeable providers.

No email/SMS/WhatsApp/push delivery, no SES/SendGrid/Twilio/MSG91.  
Order module and `app.ts` are **not** modified — Notification router is empty and unmounted.

---

## Design Answers

| Question | Answer |
|----------|--------|
| Why separate Notification module? | Delivery, templates, retries, and vendors are their own concern; Order stays commerce-only. |
| Why Provider abstraction? | `INotificationProvider` hides channel SDKs so Service stays vendor-agnostic (DIP). |
| Why Factory Pattern? | Resolves channel by config without hard-coding SES/Twilio in Service. |
| Why future Event-driven architecture? | Order publishes events; Notification reacts — loose coupling and async scale. |
| Why Queue integration? | Decouples Order latency from slow outbound APIs; enables buffering and workers. |
| Why Retry strategy? | Transient provider failures need backoff without failing Order writes. |
| Why Template system? | Centralizes message content/branding; providers only send rendered payloads. |
| SOLID compliance? | SRP layers; DIP interfaces; OCP factory/providers; ISP contracts; LSP swappable providers. |

---

## Delivered

| File | Status | Responsibility |
|------|--------|---------------|
| interfaces/* | ✅ | Enterprise contracts |
| factory/notification-provider.factory.ts | ✅ | Provider factory |
| providers/* | ✅ | Placeholder providers |
| notification.constants.ts | ✅ | Shared constants |
| notification.types.ts | ✅ | Shared types |
| dto/* | ✅ | Placeholder DTOs |
| service/notification.service.ts | ✅ | Placeholder (`services/`) |
| repository/notification.repository.ts | ✅ | Placeholder (`repositories/`) |
| controller/notification.controller.ts | ✅ | Placeholder (`controllers/`) |
| routes/notification.routes.ts | ✅ | Empty router |
| docs/NOTIFICATION_MODULE_STEP_15.md | ✅ | Documentation |

**Not modified:** `app.ts`, Order module (no Notification integration yet).

---

## Verification

Run:

```bash
npx tsc --noEmit
```

Result must be:

**0 TypeScript Errors**

Verify:

- ✓ Factory compiles
- ✓ Providers implement interfaces
- ✓ No circular dependencies
- ✓ No delivery logic
- ✓ No Order coupling

**Step 15.9 complete.** Do not continue to 15.10 until confirmed.
