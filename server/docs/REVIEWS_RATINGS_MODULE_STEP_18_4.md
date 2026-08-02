# Module 18.4 — Reviews & Ratings Service & Business Logic

## Executive Summary

This document details the application service implementation for **Module 18.4 — Reviews & Ratings Service**. Built following Clean Architecture principles, the `ReviewService` implements `IReviewService` and encapsulates all domain rules, verified purchase verification, 1-review-per-user invariant checks, moderation workflows, and asynchronous product rating aggregate calculations.

---

## 1. Application Service Architecture

Location: `src/modules/review/services/review.service.ts`

```typescript
export class ReviewService implements IReviewService {
  constructor(private readonly reviewRepository: IReviewRepository) {}

  async createReview(userId: string, data: CreateReviewRequest): Promise<ReviewResponse>;
  async getProductReviews(productId: string, query?: ListProductReviewsQuery): Promise<PaginatedReviewsResponse>;
  async getUserReviews(userId: string, query?: ListUserReviewsQuery): Promise<PaginatedReviewsResponse>;
  async updateReview(userId: string, reviewId: string, data: UpdateReviewRequest): Promise<ReviewResponse>;
  async deleteReview(userId: string, reviewId: string): Promise<boolean>;
  async approveReview(adminId: string, reviewId: string): Promise<ReviewResponse>;
  async rejectReview(adminId: string, reviewId: string, reason?: string): Promise<ReviewResponse>;
}
```

---

## 2. Business Rules Implemented

### 2.1 Review Submission & Invariants
* **Integer Rating Constraint:** Rating scores must be integer values between `1` and `5` inclusive.
* **Active Product Verification:** Verifies target product exists and is not archived in Catalog.
* **1 Review per User per Product:** Queries `reviewRepository.findByUserAndProduct(userId, productId)`. Rejects duplicate submissions with an explicit domain exception.
* **Verified Purchase Verification:** Cross-checks `Order` aggregate for completed purchases (`DELIVERED`, `COMPLETED`, `SHIPPED`) by the user containing `productId`. Sets `isVerifiedPurchase: true` dynamically.
* **Initial Status:** All new reviews enter `PENDING` moderation state.

### 2.2 Review Updating & Re-Moderation Workflow
* **Authorship Verification:** Only the authoring user (`userId === review.userId`) can modify content.
* **Re-Moderation Trigger:** If an `APPROVED` review is edited by the customer, its status automatically reverts to `PENDING`, and the product's rating summary is updated to exclude the un-moderated edit until re-approved.

### 2.3 Moderation Actions (Admin Only)
* **Approval (`approveReview`):** Transitions review to `APPROVED` and immediately triggers `recalculateRatingSummary(productId)`.
* **Rejection (`rejectReview`):** Transitions status to `REJECTED`. If previously approved, updates product rating aggregate.

---

## 3. Product Rating Summary Aggregation Engine (`recalculateRatingSummary`)

Whenever a review transitions into or out of the `APPROVED` state (on approval, deletion, or modification of an approved review), `ReviewService` executes asynchronous aggregate recalculation:

$$\text{averageRating} = \frac{\sum_{i=1}^{N} \text{rating}_i}{N}$$

```typescript
const queryResult = await this.reviewRepository.findByProduct(productId, 'APPROVED', { page: 1, limit: 10000 });
const approvedReviews = queryResult.items;
const totalReviews = approvedReviews.length;

const distribution: IRatingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
let ratingSum = 0;

approvedReviews.forEach((review) => {
  ratingSum += review.rating;
  distribution[review.rating]++;
});

const averageRating = totalReviews > 0 ? Number((ratingSum / totalReviews).toFixed(2)) : 0;
await this.reviewRepository.upsertSummary(productId, { averageRating, totalReviews, distribution });
```

---

## 4. Verification

* **TypeScript Compilation (`npx tsc --noEmit`):** ✅ Clean (0 Errors)
* **Files Delivered:**
  * `src/modules/review/services/review.service.ts`
  * `src/modules/review/index.ts`
  * `docs/REVIEWS_RATINGS_MODULE_STEP_18_4.md`
