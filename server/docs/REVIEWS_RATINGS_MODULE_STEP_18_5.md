# Module 18.5 — Reviews & Ratings Controller & Request Validations

## Executive Summary

This document details the REST controller implementation and request validation architecture for **Module 18.5 — Reviews & Ratings Controller & Validations**. Built following Clean Architecture and SOLID principles, the `ReviewController` acts as a thin HTTP adapter that delegates business execution to `IReviewService` while enforcing request sanitization via `express-validator` middleware chains.

---

## 1. Request Flow Architecture

```
[ Client Request ]
       │
       ▼
[ Express Router ] (Modules / App wiring)
       │
       ▼
[ JWT Auth Middleware ] ───▶ Validates Bearer token; injects req.user (401 on failure)
       │
       ▼
[ RBAC Middleware ] ───▶ (For Admin actions) Authorizes ADMIN / SUPER_ADMIN role (403 on failure)
       │
       ▼
[ Validation Chains ] ───▶ Validates payload/param shapes via express-validator (400 on failure)
       │
       ▼
[ ReviewController ] ───▶ Extracts req.user._id & params; calls IReviewService
       │
       ▼
[ ReviewService ] ───▶ Enforces business rules, eligibility, & moderation workflows
       │
       ▼
[ Standardized ApiResponse ] ───▶ Returns 200 OK / 201 Created envelope
```

---

## 2. Validation Chains (`review.validation.ts`)

Location: `src/modules/review/validations/review.validation.ts`

| Validation Chain | Validated Targets | Enforced Rules |
| :--- | :--- | :--- |
| `createReviewValidation` | `body('productId')`<br>`body('rating')`<br>`body('comment')` | `productId` must be valid MongoId.<br>`rating` must be integer 1 to 5.<br>`comment` must be 5–5000 characters. |
| `updateReviewValidation` | `param('reviewId')`<br>`body('rating')`<br>`body('comment')` | `reviewId` must be valid MongoId.<br>Optional rating must be integer 1–5.<br>Optional comment 5–5000 chars. |
| `deleteReviewValidation` | `param('reviewId')` | `reviewId` must be valid MongoId. |
| `approveReviewValidation`| `param('reviewId')` | `reviewId` must be valid MongoId. |
| `rejectReviewValidation` | `param('reviewId')`<br>`body('reason')` | `reviewId` must be valid MongoId.<br>Optional reason max 500 chars. |
| `getProductReviewsValidation` | `param('productId')`<br>`query('page')`, `query('limit')` | `productId` must be valid MongoId.<br>Optional `page` & `limit` positive integers. |

---

## 3. Controller Implementation (`ReviewController`)

Location: `src/modules/review/controllers/review.controller.ts`

```typescript
export class ReviewController {
  constructor(private readonly reviewService: IReviewService) {}

  async createReview(req: Request, res: Response, next: NextFunction): Promise<void>;
  async getProductReviews(req: Request, res: Response, next: NextFunction): Promise<void>;
  async getUserReviews(req: Request, res: Response, next: NextFunction): Promise<void>;
  async updateReview(req: Request, res: Response, next: NextFunction): Promise<void>;
  async deleteReview(req: Request, res: Response, next: NextFunction): Promise<void>;
  async approveReview(req: Request, res: Response, next: NextFunction): Promise<void>;
  async rejectReview(req: Request, res: Response, next: NextFunction): Promise<void>;
}
```

---

## 4. Enterprise Design Explanations

### 4.1 Why Controllers Remain Thin
* **Single Responsibility Principle (SRP):** The controller handles HTTP adapter concerns exclusively (header/token extraction, status code mapping, DTO envelope wrapping).
* **Decoupled Architecture:** Business rules reside entirely within `ReviewService`. Keeping controllers thin allows the service layer to be invoked by alternative transports (gRPC, message queue consumers, scheduled cron jobs) without duplicating code.

### 4.2 Security Invariants
* **User Identity Protection:** The authoring `userId` is extracted strictly from `req.user._id` populated by the JWT authentication middleware. The controller **never accepts `userId` from request body or query parameters**, preventing impersonation attacks.
* **Role-Based Access Control:** Moderation actions (`approveReview`, `rejectReview`) require `ADMIN` or `SUPER_ADMIN` authorization.

### 4.3 Standard API Response Envelopes
* **Success Envelope (200 OK / 201 Created):**
  ```json
  {
    "success": true,
    "message": "Review submitted successfully and is pending approval.",
    "data": { ... }
  }
  ```

---

## 5. Verification

* **TypeScript Compilation (`npx tsc --noEmit`):** ✅ Clean (0 Errors)
* **Files Delivered:**
  * `src/modules/review/validations/review.validation.ts`
  * `src/modules/review/controllers/review.controller.ts`
  * `src/modules/review/index.ts`
  * `docs/REVIEWS_RATINGS_MODULE_STEP_18_5.md`
