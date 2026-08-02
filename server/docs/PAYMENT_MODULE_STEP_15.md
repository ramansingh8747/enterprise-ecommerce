# Module 15 – Step 15.6

Payment Integration Foundation

## Implementation Plan

1. **Why Payment should be a separate module** — Gateways, webhooks, refunds, and provider credentials are a distinct bounded context. Isolating them keeps Order focused on commerce lifecycle and avoids leaking SDK details into Order services.
2. **Why Order must not depend on a specific payment provider** — Switching Razorpay → Stripe (or multi-provider) must not rewrite Order creation/status code. Order only cares about payment outcomes (`paymentStatus`), not how money moved.
3. **Why Payment Gateway should be abstracted** — `IPaymentProvider` defines a stable adapter surface (`createPayment`, `verifyPayment`, `cancelPayment`, `refundPayment`) so concrete SDKs stay behind the interface (DIP).
4. **Why Interface + Factory** — Callers depend on `IPaymentProvider`; `PaymentProviderFactory` selects mock/razorpay/stripe/cashfree by config. New providers extend via new classes without changing consumers (OCP).
5. **Why Payment Status is stored on Order** — Checkout, fulfillment gates, and admin views need a single order-facing payment signal without joining Payment collections on every read.
6. **Why Provider Transaction ID is stored separately** — Gateway IDs are provider-specific opaque strings used for verify/refund/webhook correlation; they belong on Payment records, not as Order domain language.
7. **Future webhook flow** — Provider → Payment webhook endpoint → verify signature → PaymentService → update Payment + Order `paymentStatus`.
8. **Future refund flow** — Admin/API → PaymentService.refundPayment → provider.refundPayment → persist refund → mirror Order payment status / order status hooks.
9. **Future inventory deduction after successful payment** — On verified PAID (or CONFIRMED policy), Inventory consume/reserve finalization runs from orchestration — not inside a gateway SDK.
10. **SOLID** — SRP per layer; DIP via interfaces; OCP via factory/providers; ISP via focused contracts; LSP via interchangeable providers.

No Razorpay/Stripe/Cashfree SDKs, webhooks, capture, refunds, or inventory changes in this step.  
Order module and `app.ts` are **not** modified — Payment router is empty and unmounted.

---

## Design Answers

| Question | Answer |
|----------|--------|
| Why Payment is separate? | Payments own gateway/webhook/refund concerns; Order owns purchase lifecycle — clear module boundaries. |
| Why Factory Pattern? | Resolves provider by config without hard-coding SDKs in Service; easy to add gateways. |
| Why Provider abstraction? | `IPaymentProvider` hides vendor APIs so Order/Payment Service stay provider-agnostic (DIP). |
| Why store payment status in Order? | Order is the commerce source of truth for “is this order paid?” without always loading Payment docs. |
| Why transaction IDs are provider-specific? | Each gateway issues its own ids; stored on Payment for verify/refund/webhook matching. |
| Future webhook flow? | Webhook → Payment Service verify → update Payment + Order `paymentStatus`. |
| Future refund flow? | Payment Service → provider.refund → persist → sync Order payment/status hooks. |
| Future inventory deduction? | After successful payment verification, orchestration deducts/consumes stock — outside providers. |
| SOLID compliance? | SRP layers; DIP interfaces; OCP factory/providers; ISP narrow contracts; LSP swappable providers. |

---

## Delivered

| File | Status | Responsibility |
|------|--------|---------------|
| interfaces/* | ✅ | Enterprise contracts |
| factory/payment-provider.factory.ts | ✅ | Provider factory |
| providers/* | ✅ | Placeholder providers |
| payment.constants.ts | ✅ | Shared constants |
| payment.types.ts | ✅ | Shared types |
| dto/* | ✅ | Placeholder DTOs |
| service/payment.service.ts | ✅ | Placeholder (`services/`) |
| repository/payment.repository.ts | ✅ | Placeholder (`repositories/`) |
| controller/payment.controller.ts | ✅ | Placeholder (`controllers/`) |
| routes/payment.routes.ts | ✅ | Empty router |
| docs/PAYMENT_MODULE_STEP_15.md | ✅ | Documentation |

**Not modified:** `app.ts`, Order module (no Payment integration yet).

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
- ✓ No business logic added

**Step 15.6 complete.** Do not continue to 15.7 until confirmed.
