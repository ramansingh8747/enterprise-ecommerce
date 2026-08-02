# Module 18.1 — Reviews & Ratings Architecture & Database Design

## Executive Summary

This document establishes the enterprise architectural blueprint and database design for **Module 18 — Reviews & Ratings System**. Before implementing business logic, repositories, controllers, or services, this architectural specification defines the domain boundaries, aggregate relationships, persistence schemas, indexing strategies, moderation state machine, eventual consistency rating summaries, and scalability considerations for the Reviews & Ratings module within our NestJS/Node.js Enterprise E-Commerce Platform.

---

## 1. Domain Driven Architecture & Core Principles

### 1.1 Why Reviews & Ratings is a Separate Aggregate Root

In Domain-Driven Design (DDD), **Review & Rating** represents its own distinct Bounded Context separate from Product Catalog, Orders, or User Accounts.

```
       +-------------------------------------------------------------+
       |               REVIEWS & RATINGS BOUNDED CONTEXT             |
       |                                                             |
       |  +-------------------------------------------------------+  |
       |  |                 Review Aggregate Root                 |  |
       |  |  - _id: ObjectId                                      |  |
       |  |  - userId: ObjectId (Reviewer)                        |  |
       |  |  - productId: ObjectId (Catalog Target)               |  |
       |  |  - variantId?: ObjectId (SKU Target)                  |  |
       |  |  - orderId?: ObjectId (Verified Purchase Link)        |  |
       |  |  - rating: Number (1..5)                              |  |
       |  |  - title: String                                      |  |
       |  |  - comment: String                                    |  |
       |  |  - images: String[]                                   |  |
       |  |  - isVerifiedPurchase: Boolean                        |  |
       |  |  - status: ReviewStatus ('PENDING'|'APPROVED'|...)    |  |
       |  |  - helpfulVotes: Number                               |  |
       |  |  - unhelpfulVotes: Number                             |  |
       |  |  - merchantReply?: MerchantReply                      |  |
       |  |  - createdAt / updatedAt: Date                        |  |
       |  +---------------------------+---------------------------+  |
       |                              | (Encapsulates)               |
       |                              v                              |
       |  +-------------------------------------------------------+  |
       |  |               MerchantReply (Subdocument)             |  |
       |  |  - comment: String                                    |  |
       |  |  - repliedAt: Date                                    |  |
       |  |  - repliedBy: ObjectId                                |  |
       |  +-------------------------------------------------------+  |
       +-------------------------------------------------------------+
```

**Architectural Rationale for Separate Aggregate Status:**

1. **Independent Bounded Context & Lifecycle:**
   - A Review has a lifecycle completely separate from Catalog items and Orders. A user creates, edits, or deletes a review; merchants reply to reviews; administrators moderate or flag reviews.
   - Neither the Product aggregate nor the Order aggregate should be mutated whenever a customer posts or votes on a review.

2. **Single Responsibility Principle (SRP):**
   - The Catalog module manages product definitions, variations, and media assets.
   - The Order module manages purchase transactions and fulfillments.
   - The Reviews & Ratings module manages customer social proof, rating sentiment analytics, and moderation workflows.

3. **High Write Throughput & Moderation Isolation:**
   - Reviews require independent moderation states (`PENDING`, `APPROVED`, `REJECTED`, `FLAGGED`). Isolating Review persistence avoids locking catalog or order documents during moderation actions.

---

### 1.2 Invariants & Business Rules

1. **One Review per User per Product:**
   - To prevent review bombing and rating manipulation, a registered user can submit at most **1 review per product aggregate**.
   - Enforced at database level via unique compound index: `{ userId: 1, productId: 1 }` (`unique: true`).

2. **Verified Purchase Architecture:**
   - A review is flagged as `isVerifiedPurchase: true` if and only if the `userId` has a completed order (`orderStatus: 'DELIVERED'` or `'COMPLETED'`) containing the target `productId`.
   - The system validates purchase history against the Order aggregate during submission without tightly coupling persistence models.

3. **Rating Scale Constraint:**
   - Ratings are strictly integer values between `1` and `5` inclusive.

4. **Moderation State Machine:**
   ```
     [ Submitted ] ───▶ [ PENDING ] ───┬───▶ (Auto/Manual Approval) ───▶ [ APPROVED ] (Visible on Catalog)
                                       ├───▶ (Policy Violation)     ───▶ [ REJECTED ] (Hidden)
                                       └───▶ (User/System Flagged)  ───▶ [ FLAGGED ]  (Under Audit)
   ```

---

### 1.3 Rating Aggregation Engine (Eventual Consistency & Pre-Calculated Summaries)

Computing average ratings dynamically across millions of review documents during product catalog page loads is an $O(N)$ anti-pattern.

#### Architectural Solution: Dual Storage & Event-Driven Rating Aggregates

1. **Operational Collection (`reviews`):** Stores granular review documents.
2. **Rating Summary Collection / Document (`product_rating_summaries`):** Pre-calculates rating statistics:
   * `averageRating`: Floating point score (e.g. `4.65`)
   * `totalReviews`: Count of all `APPROVED` reviews
   * `ratingDistribution`: Breakdowns for 1-star, 2-star, 3-star, 4-star, and 5-star ratings.

#### Asynchronous Event Update Workflow:
When a review transitions to `APPROVED` or is deleted:
```
  [ Review Approved Event ] ──▶ [ Rating Aggregation Worker / Event Handler ]
                                          │
                                          ▼
                         [ Recalculates Product Rating Summary ]
                                          │
                                          ▼
                       [ Invalidates Redis Product Catalog Cache ]
```

---

## 2. Aggregate Visual Diagram

```mermaid
domainDiagram
    direction TB

    package "Reviews & Ratings Bounded Context" {
        class Review {
            +ObjectId id
            +ObjectId userId
            +ObjectId productId
            +ObjectId variantId
            +ObjectId orderId
            +number rating
            +string title
            +string comment
            +string[] images
            +boolean isVerifiedPurchase
            +ReviewStatus status
            +number helpfulVotes
            +number unhelpfulVotes
            +MerchantReply merchantReply
            +Date createdAt
            +Date updatedAt
            +approve()
            +reject()
            +addHelpfulVote()
        }

        class MerchantReply {
            +string comment
            +Date repliedAt
            +ObjectId repliedBy
        }

        class ProductRatingSummary {
            +ObjectId productId
            +number averageRating
            +number totalReviews
            +RatingDistribution distribution
            +Date updatedAt
        }
    }

    package "User Context" {
        class User {
            +ObjectId id
        }
    }

    package "Catalog Context" {
        class Product {
            +ObjectId id
        }
        class ProductVariant {
            +ObjectId id
        }
    }

    package "Order Context" {
        class Order {
            +ObjectId id
        }
    }

    Review "1" *-- "0..1" MerchantReply : contains (Embedded Subdocument)
    User "1" <-- "0..*" Review : authored by (userId)
    Product "1" <-- "0..*" Review : target catalog item (productId)
    ProductVariant "0..1" <-- "0..*" Review : target variant (variantId)
    Order "0..1" <-- "0..*" Review : verified by (orderId)
    Product "1" <-- "1" ProductRatingSummary : summarized for (productId)
```

---

## 3. MongoDB Schema Design

### 3.1 Review Collection (`reviews`)

```typescript
import { Schema, Document, Types } from 'mongoose';

export type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'FLAGGED';

export interface IMerchantReplySubdocument {
  comment: string;
  repliedAt: Date;
  repliedBy: Types.ObjectId;
}

export interface IReviewDocument extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  productId: Types.ObjectId;
  variantId?: Types.ObjectId;
  orderId?: Types.ObjectId;
  rating: number;
  title?: string;
  comment: string;
  images: string[];
  isVerifiedPurchase: boolean;
  status: ReviewStatus;
  helpfulVotes: number;
  unhelpfulVotes: number;
  merchantReply?: IMerchantReplySubdocument;
  createdAt: Date;
  updatedAt: Date;
}

const MerchantReplySchema = new Schema<IMerchantReplySubdocument>(
  {
    comment: { type: String, required: true, trim: true, maxlength: 2000 },
    repliedAt: { type: Date, required: true, default: Date.now },
    repliedBy: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  },
  { _id: false }
);

export const ReviewSchema = new Schema<IReviewDocument>(
  {
    userId: { type: Schema.Types.ObjectId, required: true, ref: 'User', index: true },
    productId: { type: Schema.Types.ObjectId, required: true, ref: 'Product', index: true },
    variantId: { type: Schema.Types.ObjectId, ref: 'ProductVariant' },
    orderId: { type: Schema.Types.ObjectId, ref: 'Order' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, trim: true, maxlength: 150 },
    comment: { type: String, required: true, trim: true, maxlength: 5000 },
    images: { type: [String], default: [] },
    isVerifiedPurchase: { type: Boolean, required: true, default: false },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED', 'FLAGGED'],
      default: 'PENDING',
      index: true,
    },
    helpfulVotes: { type: Number, default: 0, min: 0 },
    unhelpfulVotes: { type: Number, default: 0, min: 0 },
    merchantReply: { type: MerchantReplySchema },
  },
  {
    timestamps: true,
    versionKey: false,
    collection: 'reviews',
  }
);
```

---

### 3.2 Product Rating Summary Collection (`product_rating_summaries`)

```typescript
export interface IRatingDistribution {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
}

export interface IProductRatingSummaryDocument extends Document {
  _id: Types.ObjectId;
  productId: Types.ObjectId;
  averageRating: number;
  totalReviews: number;
  distribution: IRatingDistribution;
  updatedAt: Date;
}

export const ProductRatingSummarySchema = new Schema<IProductRatingSummaryDocument>(
  {
    productId: { type: Schema.Types.ObjectId, required: true, unique: true, ref: 'Product' },
    averageRating: { type: Number, required: true, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, required: true, default: 0, min: 0 },
    distribution: {
      1: { type: Number, default: 0 },
      2: { type: Number, default: 0 },
      3: { type: Number, default: 0 },
      4: { type: Number, default: 0 },
      5: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
    versionKey: false,
    collection: 'product_rating_summaries',
  }
);
```

---

## 4. Indexing Strategy

```
Index 1: Unique User-Product Invariant Index
+---------------------------------------------------------------+
|  { userId: 1, productId: 1 }  -->  [ UNIQUE ]                 |
+---------------------------------------------------------------+
  Purpose: Prevents duplicate reviews by a single user on the same product.

Index 2: Product Approved Reviews Listing Index (Primary Query)
+---------------------------------------------------------------+
|  { productId: 1, status: 1, createdAt: -1 }                   |
+---------------------------------------------------------------+
  Purpose: Enables fast paginated reads of approved reviews on catalog pages.

Index 3: Admin Moderation Queue Index
+---------------------------------------------------------------+
|  { status: 1, createdAt: 1 }                                  |
+---------------------------------------------------------------+
  Purpose: Powers the admin moderation dashboard for pending reviews.

Index 4: Verified Purchase Order Link Lookup
+---------------------------------------------------------------+
|  { orderId: 1, productId: 1 }                                 |
+---------------------------------------------------------------+
  Purpose: Rapidly verifies if a review has already been attached to an order.
```

---

## 5. Verification & Deliverable Sign-Off

* **Architecture Approved:** Yes
* **Collections Defined:** `reviews`, `product_rating_summaries`
* **Invariants & Index Strategy Documented:** Yes (Unique user-product, status-sorted compound indexes)
* **Code Implementation:** None generated in Step 18.1 (Architecture & Design only)
