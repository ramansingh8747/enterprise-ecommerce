# Module 15 – Step 15.1
Order Architecture

## Implementation Plan

Order Management is introduced as its own bounded module under `src/modules/order/`, following the same Controller → Service → Repository pattern used by Inventory, Brand, and Media.

This step scaffolds folders, contracts, constants, DTOs, validation placeholders, and a composition-root router **without** business logic, schemas, or HTTP endpoints. Routes are **not** mounted in `app.ts` yet (same approach as Inventory Step 14.1).

Integration points prepared for later steps:

| Module | Approach |
|--------|----------|
| Product | Line items reference product ids / price snapshots |
| Variant | Optional variant on line items |
| Inventory | Reserve on place; release/consume on cancel/fulfill |
| Auth | JWT identifies customer / admin actors |
| RBAC | Existing `authenticate` + `authorize(...)` middleware |

Future Payment and Notification modules will hook into Order status transitions without owning Order persistence.

---

## Design Answers

| Question | Answer |
|----------|--------|
| Why separate Order module? | Orders own purchase lifecycle (placement, payment state, fulfillment). Isolating them from Product/Inventory keeps catalog and stock concerns independent and replaceable. |
| Why Repository Layer? | Encapsulates MongoDB access so services stay free of query details and persistence can change without rewriting use cases (DIP). |
| Why Service Layer? | Owns order rules, totals, status transitions, and orchestration with Inventory/Payment — single place for business policy (SRP). |
| Why Controller Layer? | Thin HTTP adapter: parse request, call service, return `ApiResponse`. No domain rules in controllers. |
| Why DTO? | Stable inbound/outbound shapes separate from Mongoose documents and HTTP details, reducing coupling across layers. |
| Why Validation? | Rejects malformed requests early via express-validator before service logic runs; keeps shape checks out of business code. |
| Future Payment Integration? | Payment providers update `paymentStatus` through Order service hooks after authorize/capture/refund — Order remains the source of truth for order state. |
| Future Notification Integration? | Notification listens to order events (created/paid/shipped/cancelled) and sends Email/SMS/Push without mutating Order data. |
| SOLID Compliance? | SRP per layer; DIP via `IOrderRepository` / `IOrderService`; OCP for new statuses/integrations; ISP via focused contracts; LSP via swappable repository implementations. |

---

## Delivered

| File | Status | Responsibility |
|------|--------|---------------|
| `types/order.types.ts` | ✅ | Order / payment / fulfillment enums |
| `constants/order.constants.ts` | ✅ | Shared defaults (status, prefix, currency) |
| `interfaces/order.interface.ts` | ✅ | Domain shape placeholders |
| `interfaces/order-repository.interface.ts` | ✅ | `IOrderRepository` contract |
| `interfaces/order-service.interface.ts` | ✅ | `IOrderService` contract |
| `dto/create-order.dto.ts` | ✅ | Create-order request shape |
| `dto/update-order.dto.ts` | ✅ | Update-order request shape |
| `repositories/order.repository.ts` | ✅ | Repository placeholder |
| `services/order.service.ts` | ✅ | Service placeholder |
| `controllers/order.controller.ts` | ✅ | Controller placeholder |
| `routes/order.routes.ts` | ✅ | Router + DI composition root (no endpoints) |
| `validations/order.validation.ts` | ✅ | Validation placeholders |
| `utils/index.ts` | ✅ | Utils barrel placeholder |
| `index.ts` | ✅ | Module public exports |
| `docs/ORDER_MODULE_STEP_15.md` | ✅ | Step 15.1 documentation |

**Not modified:** `app.ts` (Order routes intentionally unmounted until an API step).

---

## Verification

Run:

```bash
npx tsc --noEmit
```

Result must be:

**0 TypeScript Errors**

**Step 15.1 complete.** Do not continue to the next step until confirmed.

---

## Step 15.2 — Order schema

Collection: `orders` · Model: `Order`

| Field | Purpose |
|-------|---------|
| `orderNumber` | Unique human-readable order id (indexed) |
| `customer` | ObjectId → User |
| `items[]` | Embedded line snapshots (`productId`, `sku`, names, `unitPrice`, `quantity`, `lineTotal`) |
| `orderStatus` / `paymentStatus` | Independent enums from `order.types` |
| `subtotal` / `discount` / `tax` / `shippingCharge` / `grandTotal` | Stored invoice totals |
| `shippingAddress` / `billingAddress?` | Embedded address snapshots |
| `currency` / `notes` / `placedAt` | Metadata |
| audit + timestamps | `createdBy`, `updatedBy`, `timestamps`, `versionKey: false` |

Indexes: `orderNumber` (unique), `customer`, `orderStatus`, `paymentStatus`, `placedAt`, plus compounds `{customer, placedAt}`, `{orderStatus, paymentStatus}`.

No repository / service / API / inventory / payment changes in 15.2.

**Step 15.2 complete.** Do not continue to 15.3 until confirmed.

---

## Step 15.3 — Order Items

Dedicated Order Item domain contract + embedded schema refinement.

| Field | Purpose |
|-------|---------|
| `productId` / `variantId` | Required catalog references (exact sellable SKU) |
| `sku` / `productName` / `variantName?` | Frozen identity snapshot |
| `unitPrice` / `quantity` | Commercial snapshot |
| `discount` / `tax` | Per-line adjustments (stored; not auto-calc) |
| `lineTotal` | Persisted line amount (calc in service Step 15.4) |
| `currency` | Line currency snapshot |
| `metadata?` | Optional bag for future tax/promo engines |

No indexes on embedded items — query via parent Order indexes.  
No order creation, inventory, payment, or APIs in this step.

**Step 15.3 complete.** Do not continue to 15.4 until confirmed.

---

## Step 15.4 — Order Creation

`POST /api/v1/orders` creates an order with immutable line snapshots.

| Step | Behavior |
|------|----------|
| Validate DTO | express-validator (`createOrderSchema`) |
| Load Product + Variant | ProductRepository / VariantRepository |
| Inventory check | Sum Inventory `availableStock` for product+variant (no deduction) |
| Snapshots | SKU, names, `unitPrice` frozen on each line |
| Totals | Service calculates `lineTotal`, `subtotal`, `discount`, `tax`, `shippingCharge`, `grandTotal` |
| Persist | OrderRepository `generateOrderNumber` + `create` |
| Auth | JWT + CUSTOMER / ADMIN / SUPER_ADMIN |

`paymentStatus` starts as `PENDING` for future payment gateway integration.  
Mongo multi-doc transactions deferred until stock deduction + payment writes land.

Mounted in `app.ts` at `/api/v1/orders`.

**Step 15.4 complete.** Do not continue to 15.5 until confirmed.

---

# Module 15 – Step 15.5

Order Status Management

## Implementation Plan

1. **Why Order Status is managed separately from Order Creation** — Creation captures a commercial snapshot (items, totals, addresses) once. Status is a post-placement lifecycle concern that changes many times; separating them keeps create idempotent-ish and status updates focused on transition rules.
2. **Why Order Status and Payment Status are independent** — Fulfillment can progress while payment is pending/authorized/failed; refunds can finish after returns. Coupling them would block valid enterprise flows (COD, split payment, partial refund).
3. **Complete Order lifecycle** — PENDING → CONFIRMED → PROCESSING → PACKED → SHIPPED → DELIVERED → RETURN_REQUESTED → RETURNED → REFUNDED, plus CANCELLED from early states.
4. **Allowed transitions** — Encoded in `ORDER_STATUS_TRANSITIONS` (Service-only enforcement).
5. **Forbidden transitions** — Any move not in the map (e.g. DELIVERED→PROCESSING, SHIPPED→PENDING, CANCELLED→SHIPPED) rejects with enterprise 400.
6. **Why validation belongs in Service** — Request validation checks shape/enum; only Service knows current persisted status and business transition policy.
7. **Future Shipment** — Shipment module will call Order service transitions (e.g. PACKED→SHIPPED) after carrier events; Order remains source of truth for `orderStatus`.
8. **Future Notification** — Notifications subscribe to successful status changes (events/hooks after Service persist); no status rules inside Notification.
9. **Why Repository has no transition rules** — Persistence-only (find + update field); rules in Service keep a single policy center and keep repositories swappable.

`PATCH /api/v1/orders/:id/status` — ADMIN / SUPER_ADMIN. No payment, inventory deduction, shipment, or notification side effects.

---

## Design Answers

| Question | Answer |
|----------|--------|
| Why Service validates transitions? | Only Service has current status + business policy; express-validator only checks request shape/enum. |
| Why Repository remains persistence-only? | Find/update status without domain rules so storage stays replaceable and rules stay centralized. |
| Why Payment Status is separate? | Payment and fulfillment lifecycles are orthogonal (COD, auth/capture, refunds after return). |
| Why Shipment is separate? | Carrier/tracking is its own bounded context; it drives status via Order service, not schema coupling. |
| Future Notifications? | Emit/listen after successful Service transition; Notification never owns status rules. |
| Why lifecycle rules are centralized? | One map (`ORDER_STATUS_TRANSITIONS`) in Order constants + Service prevents divergent rules across controllers/repos. |

---

## Delivered

| File | Status | Responsibility |
|------|--------|---------------|
| order.service.ts | ✅ | updateOrderStatus() |
| order.repository.ts | ✅ | Status persistence |
| order.controller.ts | ✅ | PATCH endpoint |
| order.routes.ts | ✅ | Route registration |
| dto/* | ✅ | Update status DTO |
| validation/* | ✅ | Request validation |
| docs/ORDER_MODULE_STEP_15.md | ✅ | Step documentation |

**Step 15.5 complete.** Do not continue to 15.6 until confirmed.

---

## Step 15.6 — Payment Integration Foundation

Scaffolded under `src/modules/payment/` (interfaces, factory, placeholder providers, DTOs, empty router).  
See `docs/PAYMENT_MODULE_STEP_15.md`. Order is **not** wired to Payment yet; Payment routes are **not** mounted in `app.ts`.

---

# Module 15 – Step 15.7

Order APIs

## Implementation Plan

1. **REST API design** — Resource-oriented `/api/v1/orders` with POST create, GET list, GET by id, PATCH status. Stable enterprise envelope (`ApiResponse` + pagination meta).
2. **Thin Controllers** — Parse auth/query/body, call Service, return HTTP status + envelope. No ownership or filter policy in controllers.
3. **Services own business logic** — Reuse `createOrder` / `updateOrderStatus`; add `getOrder` / `getOrders` for ownership and RBAC-scoped filters.
4. **Repository persistence only** — `findById` / `findOrders` build Mongo queries (sort `createdAt` desc); no RBAC.
5. **RBAC strategy** — Reuse `authenticate` + `authorize(...)` on routes; Service enforces customer ownership for reads.
6. **Customer vs Admin** — Customer: create/list/get own; cannot status or others’ orders. Admin/Super Admin: list all, filter, update status.
7. **Pagination** — `page` / `limit` (defaults 1/20, max 100) with total/totalPages/hasNext/hasPrevious.
8. **Filtering** — `status` → `orderStatus`, `paymentStatus`, `customerId` (admin), optional `fromDate`/`toDate` on `createdAt`.
9. **Future API versioning** — Keep `/api/v1` prefix; breaking changes ship as `/api/v2` without rewriting clients on v1.

No payment gateway, reports, notifications, or shipment. Create/status business rules unchanged.

---

## Design Answers

| Question | Answer |
|----------|--------|
| Why REST? | Standard resource verbs/paths for Order CRUD-style ops; fits Express + existing `/api/v1` conventions. |
| Why thin Controller? | Keeps HTTP concerns isolated; business rules stay testable in Service (SRP). |
| Why Service reuse? | Avoids duplicating create/status rules; query APIs only add ownership/filter orchestration. |
| Why RBAC? | Prevents customers from mutating status or reading others’ orders; admins get operations access. |
| Why pagination? | Protects DB/API from unbounded lists; predictable admin/customer browsing. |
| Why filtering? | Lets admins narrow by lifecycle/payment without reporting aggregates. |
| Future API versioning? | Mount new majors under `/api/v2`; keep v1 stable for existing clients. |

---

## Delivered

| File | Status | Responsibility |
|------|--------|---------------|
| order.routes.ts | ✅ | REST endpoints |
| order.controller.ts | ✅ | API handlers |
| order.service.ts | ✅ | Query methods |
| order.repository.ts | ✅ | Query persistence |
| validation/* | ✅ | API validation |
| docs/ORDER_MODULE_STEP_15.md | ✅ | Step documentation |

---

## Verification

Run:

```bash
npx tsc --noEmit
```

Result must be:

**0 TypeScript Errors**

**Step 15.7 complete.** Do not continue to 15.8 until confirmed.

---

# Module 15 – Step 15.8

Order Reports

## Implementation Plan

1. **Why reporting is separate from Order processing** — Create/status are write-path transactional rules; reports are read-only analytics. Separating them avoids slowing checkout with heavy aggregations and keeps processing APIs stable.
2. **Why aggregation belongs in Repository** — MongoDB pipelines are persistence concerns (`$match`/`$group`/`$sort`). Repository returns shaped rows; no RBAC or KPI policy there.
3. **Why Service owns report orchestration** — Parses filters, validates date ranges, composes `getDashboardMetrics` from multiple repo calls; single place for report use-case rules.
4. **Why Controllers stay thin** — HTTP adapter only: query → service → `ApiResponse`.
5. **Future dashboard integration** — Admin UI calls `/orders/reports/*` or `getDashboardMetrics()` for cards/charts without coupling to Order writes.
6. **Future BI / Power BI** — Same aggregation contracts (or export jobs) can feed warehouses; Order processing remains untouched.
7. **Performance strategy** — Server-side aggregation; never load all orders into Node memory; `$match` first.
8. **Index usage** — `placedAt` for date windows; `orderStatus` / `paymentStatus` / compound `{orderStatus, paymentStatus}`; `{customer, placedAt}` for top-customer foundation.
9. **Pagination strategy** — Optional `page`/`limit` on report query schema for future list-style reports; time-series and group reports return buckets (top customers capped).

Create/status business logic unchanged. RBAC: ADMIN / SUPER_ADMIN. Filters: `dateFrom`, `dateTo`, `status`, `paymentStatus`.

---

## Design Answers

| Question | Answer |
|----------|--------|
| Why Aggregation? | Computes counts/sums in MongoDB without hydrating every Order document in app memory. |
| Why Repository owns reporting queries? | Pipelines are data-access; keeps Service free of Mongo operators and storage details. |
| Why Service orchestrates? | Filter mapping, date-range rules, and composing dashboard metrics from multiple queries. |
| Why Controllers stay thin? | Only HTTP + RBAC boundary; no aggregation or KPI logic. |
| Dashboard integration? | Frontends consume report endpoints / `getDashboardMetrics` for admin widgets. |
| BI integration? | Export or replicate the same aggregates into a warehouse without changing Order writes. |
| Performance strategy? | `$match` early, indexed fields (`placedAt`, status), aggregation-only — no full collection load. |

---

## Delivered

| File | Status | Responsibility |
|------|--------|---------------|
| order.repository.ts | ✅ | Aggregation queries |
| order.service.ts | ✅ | Report orchestration |
| order.controller.ts | ✅ | Report endpoints |
| order.routes.ts | ✅ | Report routes |
| validation/* | ✅ | Report validation |
| docs/ORDER_MODULE_STEP_15.md | ✅ | Step documentation |

---

## Verification

Run:

```bash
npx tsc --noEmit
```

Result must be:

**0 TypeScript Errors**

**Step 15.8 complete.** Do not continue to 15.9 until confirmed.

---

## Step 15.9 — Order Notifications Foundation

Scaffolded under `src/modules/notification/` (interfaces, factory, placeholder providers, DTOs, empty router).  
See `docs/NOTIFICATION_MODULE_STEP_15.md`. Order is **not** wired to Notification yet; Notification routes are **not** mounted in `app.ts`.
---

# Module 15 � Step 15.10

End-to-End Testing

## Test Summary

Production-readiness verification of Module 15 (Order Management) using existing HTTP verify scripts plus foundation contract checks. No production code was modified � testing only.

**Lifecycle:** PENDING ? CONFIRMED ? PROCESSING ? PACKED ? SHIPPED ? DELIVERED ? RETURN_REQUESTED ? RETURNED ? REFUNDED (invalid transitions reject).

**Request flow:** Route ? `authenticate` ? `authorize` ? express-validator ? Controller ? Service ? Repository ? MongoDB ? `ApiResponse`.

**Auth / RBAC:** JWT Bearer; Customer create/list/get own; Admin/Super Admin status + reports; Customer status/other-orders ? 403.

**Layer checks:** Repository = queries/aggregations only; Service = business rules (no HTTP); Controller = thin HTTP adapter.

**Reports:** summary / revenue / status / daily / monthly (ADMIN).

**Foundations:** Payment + Notification factories/providers compile; placeholders throw `Not Implemented`.

**Regression:** `tsc`/build green across full server (Inventory, Product, Category, Brand, Media, Variant, Auth untouched).

Runner: `scripts/verify-order-e2e-15-10.ts` ? **7/7 passed**.

---

## Results

| Area | Status |
|------|--------|
| TypeScript | ? |
| Build | ? |
| RBAC | ? |
| Validation | ? |
| APIs | ? |
| Reports | ? |
| Payment Foundation | ? |
| Notification Foundation | ? |
| Regression | ? |

---

## Production Readiness Review

| Check | Status |
|--------|--------|
| Architecture | ? |
| SOLID | ? |
| Repository Pattern | ? |
| Service Layer | ? |
| Controller Layer | ? |
| Security | ? |
| Backward Compatibility | ? |

---

## Delivered

| Item | Status |
|------|--------|
| E2E Verification | ? |
| Regression Testing | ? |
| Documentation | ? |

---

## Final Verification

Run:

```bash
npx tsc --noEmit
```

Result:

**0 TypeScript Errors**

Build:

**Successful** (`npm run build` ? exit 0)

Lint:

**Not Configured** (no `lint` script in `package.json`)

**Step 15.10 complete.** Module 15 Order Management verified for delivered steps. No production defects found; no code fixes required.
