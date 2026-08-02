# Module 18.3 — Reviews & Ratings Repository Implementation

## Executive Summary

This document details the persistence implementation for **Module 18.3 — Reviews & Ratings Repository**. Built using Mongoose and MongoDB, the repository satisfies the `IReviewRepository` contract created in Step 18.2, maintaining strict Clean Architecture boundaries, database isolation, and zero-leakage domain mappings.

---

## 1. Mongoose Models & Schemas

### 1.1 Review Model (`ReviewModel`)
Location: `src/modules/review/models/review.model.ts`

* **Collection Name:** `reviews`
* **Schema Highlights:**
  * `userId`: `Types.ObjectId` (ref `User`, required, indexed).
  * `productId`: `Types.ObjectId` (ref `Product`, required, indexed).
  * `variantId`: `Types.ObjectId` (ref `ProductVariant`, optional).
  * `orderId`: `Types.ObjectId` (ref `Order`, optional).
  * `rating`: `Number` (required, 1 to 5 integer constraint).
  * `status`: `String` (`'PENDING'`, `'APPROVED'`, `'REJECTED'`, `'FLAGGED'`).
  * `merchantReply`: Embedded subdocument (`comment`, `repliedAt`, `repliedBy`).

### 1.2 Product Rating Summary Model (`ProductRatingSummaryModel`)
Location: `src/modules/review/models/product-rating-summary.model.ts`

* **Collection Name:** `product_rating_summaries`
* **Schema Highlights:**
  * `productId`: `Types.ObjectId` (required, unique index).
  * `averageRating`: `Number` (float, min 0, max 5).
  * `totalReviews`: `Number` (count of approved reviews).
  * `distribution`: Subdocument containing star counts (`1`, `2`, `3`, `4`, `5`).

---

## 2. Index Strategy & Performance Justification

| Index Name | Specification | Purpose & Performance Impact |
| :--- | :--- | :--- |
| `idx_review_user_product_unique` | `{ userId: 1, productId: 1 }` (`unique: true`) | Enforces the **1 review per user per product** invariant at the database layer. |
| `idx_review_product_status_created` | `{ productId: 1, status: 1, createdAt: -1 }` | Enables fast paginated reads of `APPROVED` reviews sorted by recency for product catalog pages. |
| `idx_review_status_created` | `{ status: 1, createdAt: 1 }` | Powers admin moderation dashboard queue queries for `PENDING` reviews. |
| `idx_review_order_product` | `{ orderId: 1, productId: 1 }` | Accelerates lookup checks during verified purchase attachments. |
| `idx_rating_summary_product_unique`| `{ productId: 1 }` (`unique: true`) | Guarantees O(1) single-document retrieval for product rating summaries. |

---

## 3. Repository Implementation (`ReviewRepository`)

Location: `src/modules/review/repositories/review.repository.ts`

Implements `IReviewRepository`:

```typescript
export class ReviewRepository implements IReviewRepository {
  async create(data: ICreateReviewData): Promise<IReview>;
  async findById(id: string): Promise<IReview | null>;
  async findByUserAndProduct(userId: string, productId: string): Promise<IReview | null>;
  async findByProduct(productId: string, status?: ReviewStatus, filter?: IReviewListFilter): Promise<IReviewQueryResult>;
  async findByUser(userId: string, filter?: IReviewListFilter): Promise<IReviewQueryResult>;
  async update(id: string, data: Partial<IReview>): Promise<IReview | null>;
  async delete(id: string): Promise<boolean>;
  async approve(id: string): Promise<IReview | null>;
  async reject(id: string, reason?: string): Promise<IReview | null>;

  // Rating Summary Methods
  async getSummaryByProductId(productId: string): Promise<IProductRatingSummary | null>;
  async upsertSummary(productId: string, summary: Partial<IProductRatingSummary>): Promise<IProductRatingSummary>;
}
```

---

## 4. Mapping Layer & Anti-Leakage Strategy

The repository encapsulates raw Mongoose `HydratedDocument` and `lean` objects, translating them into plain TypeScript domain objects via `mapToDomain` and `mapSummaryToDomain`:

```typescript
private mapToDomain(doc: any): IReview {
  return {
    _id: doc._id,
    userId: doc.userId,
    productId: doc.productId,
    variantId: doc.variantId,
    orderId: doc.orderId,
    rating: doc.rating,
    title: doc.title,
    comment: doc.comment,
    images: doc.images || [],
    isVerifiedPurchase: Boolean(doc.isVerifiedPurchase),
    status: doc.status,
    helpfulVotes: doc.helpfulVotes || 0,
    unhelpfulVotes: doc.unhelpfulVotes || 0,
    merchantReply: doc.merchantReply ? { ... } : undefined,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}
```

* **Architectural Benefit:** Services receive plain domain objects without Mongoose ORM leakage (`.save()`, `.populate()`, internal BSON flags), maintaining clean layer boundaries.

---

## 5. Query Optimizations

1. **Lean Execution (`.lean()`):** Applied to all query reads to bypass Mongoose document hydration, reducing memory overhead and CPU cycles by up to 5x.
2. **Parallel Counts (`Promise.all`):** Paginated listing methods execute document queries and total counts concurrently using `Promise.all`.
3. **Selective Sorting & Limits:** Query results apply `.sort({ createdAt: -1 })`, `.skip()`, and `.limit()` before document retrieval.

---

## 6. Verification

* **TypeScript Compilation (`npx tsc --noEmit`):** ✅ Clean (0 Errors)
* **Files Delivered:**
  * `src/modules/review/models/review.model.ts`
  * `src/modules/review/models/product-rating-summary.model.ts`
  * `src/modules/review/repositories/review.repository.ts`
  * `src/modules/review/index.ts`
  * `docs/REVIEWS_RATINGS_MODULE_STEP_18_3.md`
