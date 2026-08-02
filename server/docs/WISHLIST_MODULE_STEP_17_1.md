# Module 17.1 — Wishlist Architecture & Database Design

## Executive Summary

This document establishes the enterprise architectural blueprint and database design for **Module 17 — Wishlist System**. Before implementing any business logic, repositories, controllers, or services, this architectural specification defines the boundaries, aggregate relationships, persistence model, indexing strategies, scalability trade-offs, and future-proofing considerations for the Wishlist module within our NestJS/Node.js Enterprise E-Commerce Platform.

---

## 1. Domain Driven Architecture & Core Principles

### 1.1 Why Wishlist is a Separate Aggregate Root

In Domain-Driven Design (DDD), an **Aggregate** is a cluster of domain objects (entities and value objects) that can be treated as a single unit with respect to data changes. Each aggregate has an **Aggregate Root** (`Wishlist`) through which external objects must interact.

```
       +-------------------------------------------------------------+
       |                  WISHLIST BOUNDED CONTEXT                   |
       |                                                             |
       |  +-------------------------------------------------------+  |
       |  |               Wishlist Aggregate Root                 |  |
       |  |  - _id: ObjectId                                      |  |
       |  |  - userId: ObjectId (Unique Owner)                    |  |
       |  |  - items: WishlistItem[]                              |  |
       |  |  - createdAt: Date                                    |  |
       |  |  - updatedAt: Date                                    |  |
       |  +---------------------------+---------------------------+  |
       |                              | (Encapsulates)               |
       |                              v                              |
       |  +-------------------------------------------------------+  |
       |  |               WishlistItem (Value Object)             |  |
       |  |  - variantId: ObjectId                                |  |
       |  |  - addedAt: Date                                      |  |
       |  +-------------------------------------------------------+  |
       +-------------------------------------------------------------+
```

**Architectural Rationale for Separate Aggregate Status:**

1. **Independent Bounded Context & Lifecycle:**
   - The Wishlist exists independently of the Shopping Cart, Orders, or Inventory. A user's desire for an item has no direct transactional invariant with stock availability or active checkout sessions.
   - Deleting a cart or placing an order does not mutate the Wishlist aggregate.

2. **Single Responsibility Principle (SRP) at Domain Level:**
   - Wishlist models **long-term saved intent / interest**.
   - Cart models **short-term transactional commitment to purchase**.
   - Conflating these two contexts into a single domain aggregate violates SRP and causes high coupling across pricing, inventory reservation, and user preference modules.

3. **Consistency Invariants:**
   - The primary invariant of a Wishlist is uniqueness of items per user and array boundary enforcement.
   - It does not require complex cross-aggregate transaction locks with inventory or coupons, allowing for high-throughput, low-contention operations.

---

### 1.2 Why Wishlist Must NOT Reuse Cart

Attempting to reuse the Shopping Cart schema or entity model for Wishlist is an anti-pattern in enterprise systems.

| Architectural Dimension | Shopping Cart (`Cart`) | Wishlist (`Wishlist`) |
| :--- | :--- | :--- |
| **Domain Intent** | Active purchase transaction preparation. | Passive interest and product curation. |
| **Lifespan / TTL** | Transient (session-bound, short expiration, converted to Order). | Long-lived (persists across years, sessions, devices). |
| **Quantity Management** | Mutable quantity per line item (`quantity >= 1`). | Binary inclusion (Item present or absent; `quantity` concept invalid). |
| **Inventory State** | May hold soft reservations / stock locks during checkout. | Strictly **NO** inventory reservation. |
| **Pricing & Discounts** | Calculates subtotal, tax, shipping, and coupon applicability. | Real-time catalog price references only; no calculated totals stored. |
| **Snapshot Requirement** | Snapshots prices/discounts at time of add/checkout. | Stores raw variant identifier only (`variantId`). |
| **Mutation Volatility** | High frequency read/write during checkout flows. | Read-heavy, low-frequency mutation. |

---

### 1.3 Wishlist Ownership & Cardinality

* **Ownership:** A Wishlist is strictly owned by an authenticated User (`userId`). The `userId` serves as the tenant boundary and access control key.
* **Cardinality (Phase 1):** `1 User : 1 Wishlist`. Exactly one wishlist aggregate per registered user account.
* **Access Control:** Mutation and read access are enforced by ownership policy: `user.id === wishlist.userId`. Admin actors may view wishlists for customer support/analytics under audited RBAC permissions.

---

### 1.4 Product Variant vs. Product Storage Architecture

#### Storing `variantId` vs. `productId`
In a modern enterprise catalog (as designed in Modules 8 & 12), a `Product` represents the generic concept (e.g., *"Nike Air Max"*), while a `ProductVariant` represents the purchasable Stock Keeping Unit (SKU) with specific attributes (e.g., *"Size: 10, Color: Red, SKU: NIKE-AM-RED-10"*).

* **Decision:** Wishlist items **MUST** store `variantId`.
* **Reasoning:**
  1. Customers save specific choices (size, color, material), not abstract catalog items.
  2. When moving an item from Wishlist to Cart, storing `variantId` allows seamless 1-click add-to-cart without forcing the customer to re-select variant options.
  3. Price drop and back-in-stock alerts are triggered at the **variant level**, not the parent product level.

---

### 1.5 Why Product Snapshots, Pricing, & Inventory Must NOT be Stored

#### 1. Why Product Snapshots are Excluded
* **Stale Data:** Storing product title, image, or description inside the wishlist causes data drift whenever the merchant updates catalog details in Module 8.
* **Storage Waste:** Duplicating strings and metadata for millions of wishlisted items bloats MongoDB document sizes unnecessarily.
* **Single Source of Truth (SSOT):** Catalog Service remains the sole authority for product details. Wishlist items perform dynamically populated joins (via MongoDB `$lookup` or application-level aggregation service).

#### 2. Why Pricing is Excluded
* Wishlists do **not** freeze prices. Storing a price like `$99.99` in a wishlist item creates legal compliance risks and false expectations if the price rises or drops.
* Prices are dynamically calculated by the Pricing/Coupon engine based on active promotions, user tier, and real-time catalog prices when the item is rendered or moved to cart.

#### 3. Why Inventory is NOT Reserved
* Reserving inventory for items placed on a wishlist would allow malicious or passive users to lock out stock without paying, destroying conversion rates and inventory availability for active buyers.
* Wishlist items reflect non-binding user desire. Stock allocation occurs exclusively during checkout reservation / order placement (Modules 14 & 15).

---

### 1.6 Duplicate Prevention & Mutation Semantics

To ensure an item cannot be added twice to a single wishlist:
1. **Database Level Enforcement:** Set semantics are maintained using MongoDB's `$addToSet` operator during item additions:
   ```json
   { "$addToSet": { "items": { "variantId": ObjectId("..."), "addedAt": new Date() } } }
   ```
2. **Application Level Validation:** The Domain Entity checks existing array members before dispatching commands.
3. **Index-Based Uniqueness:** Primary lookup utilizes `{ userId: 1, "items.variantId": 1 }` compound checks.

---

### 1.7 Soft Delete vs. Hard Delete Decision

* **Decision for Items (`items[]`):** **Hard Delete** via MongoDB `$pull`.
  * Removing an item from a wishlist is a user choice to discard intent. Storing soft-deleted items inside an embedded array causes unnecessary array bloat and complex filtering predicates in queries.
* **Decision for Wishlist Aggregate (`Wishlist` Document):** **Hard Delete** upon user account purge, or soft-delete at user lifecycle level.
* **Analytics/Audit Note:** Event-Driven Telemetry (e.g., `WishlistItemRemovedEvent`) captures removal events for business intelligence without cluttering operational MongoDB collections.

---

### 1.8 Scalability & Future Architecture Roadmap

The Wishlist design accommodates future enterprise features without requiring destructive migrations:

```
+------------------------+------------------------------------------------------------+
| Feature                | Extension Strategy / Architecture Path                     |
+------------------------+------------------------------------------------------------+
| Public Wishlist        | Add `isPublic: boolean`, `visibility: 'PRIVATE'|'PUBLIC'`. |
| Shareable Wishlist     | Add `shareToken: string` (indexed) with permission guards.  |
| Multiple Wishlists     | Evolve schema to `name: string`, `isDefault: boolean`.     |
| Gift Registry          | Extend aggregate with `registryDetails` (eventDate, goal). |
| Favorites (Likes)      | Specialized high-throughput Redis BitField / Key-Set layer.|
| Wishlist Analytics     | Publish Domain Events (`WISHLIST_ITEM_ADDED`) to Kafka/Rabbit|
+------------------------+------------------------------------------------------------+
```

---

## 2. Aggregate Diagram

Below is the Mermaid diagram illustrating the Wishlist Aggregate boundaries, entity structures, and relationships with external bounded contexts.

```mermaid
domainDiagram
    direction TB

    accTitle: Wishlist Aggregate Boundary
    accDescr: Domain model showing Wishlist Aggregate Root, WishlistItem Value Object, and External References.

    package "Wishlist Bounded Context" {
        class Wishlist {
            +ObjectId id
            +ObjectId userId
            +WishlistItem[] items
            +Date createdAt
            +Date updatedAt
            +addItem(variantId)
            +removeItem(variantId)
            +clear()
        }

        class WishlistItem {
            +ObjectId variantId
            +Date addedAt
        }
    }

    package "User Context" {
        class User {
            +ObjectId id
            +string email
        }
    }

    package "Catalog Context" {
        class ProductVariant {
            +ObjectId id
            +string sku
            +Decimal128 price
        }
    }

    Wishlist "1" *-- "0..*" WishlistItem : contains (Embedded Array)
    User "1" <-- "1" Wishlist : owned by (userId)
    WishlistItem "0..*" --> "1" ProductVariant : references (variantId)
```

---

## 3. MongoDB Schema Design

### 3.1 Mongoose / MongoDB Document Schema

The collection name is `wishlists`.

```typescript
import { Schema, Document, Types } from 'mongoose';

export interface IWishlistItem {
  variantId: Types.ObjectId;
  addedAt: Date;
}

export interface IWishlistDocument extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  items: IWishlistItem[];
  createdAt: Date;
  updatedAt: Date;
}

const WishlistItemSchema = new Schema<IWishlistItem>(
  {
    variantId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'ProductVariant',
    },
    addedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    _id: false, // Prevents automatic generation of subdocument _id to save 12 bytes per item
  }
);

export const WishlistSchema = new Schema<IWishlistDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      unique: true, // Guarantees 1:1 relationship between User and Wishlist
      ref: 'User',
      index: true,
    },
    items: {
      type: [WishlistItemSchema],
      default: [],
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
    versionKey: false, // Disables __v field to avoid unnecessary overhead
    collection: 'wishlists',
  }
);
```

---

### 3.2 Comprehensive Field Analysis

| Field Name | Type | Constraints | Detailed Explanation |
| :--- | :--- | :--- | :--- |
| `_id` | `ObjectId` | Primary Key, Auto Generated | Unique 12-byte BSON identifier for the Wishlist Aggregate root. |
| `userId` | `ObjectId` | Required, Unique, Indexed, Foreign Key (`User`) | Identifies the owner of the wishlist. The `unique: true` constraint at the database layer strictly enforces 1 Wishlist per User. |
| `items` | `Array<WishlistItem>` | Default: `[]` | Embedded array containing wishlisted variants. Storing as an embedded array allows O(1) single-document reads for a user's entire wishlist. |
| `items[].variantId` | `ObjectId` | Required, Foreign Key (`ProductVariant`) | Identifier of the specific product variant wishlisted by the customer. Enables direct cart conversion and variant-level alerts. |
| `items[].addedAt` | `Date` | Required, Default: `Date.now` | Precise UTC timestamp when the variant was added. Used for sorting items by recently added ("Newest First"). |
| `createdAt` | `Date` | Managed by Mongoose `timestamps` | Audit timestamp recording when the wishlist aggregate was first initialized for the user. |
| `updatedAt` | `Date` | Managed by Mongoose `timestamps` | Audit timestamp updated on every item insertion or deletion. |

---

## 4. Indexing Strategy & Performance Optimization

Efficient indexing is essential to maintain sub-millisecond lookups and prevent collection scans during write mutations.

```
Index 1: Unique Owner Index (Primary Lookup)
+---------------------------------------------------------------+
|  { userId: 1 }  -->  [ UNIQUE ]                               |
+---------------------------------------------------------------+
  Purpose: Instant O(1) retrieval of a user's wishlist document.
  Prevents duplicate wishlists for a single user at DB level.

Index 2: Variant Lookup Index (Reverse Aggregation / Analytics)
+---------------------------------------------------------------+
|  { "items.variantId": 1 }                                     |
+---------------------------------------------------------------+
  Purpose: Enables queries like "Find all wishlists containing Variant X".
  Essential for price drop notifications and stock restock alerts.

Index 3: Compound User-Variant Covered Lookup Index
+---------------------------------------------------------------+
|  { userId: 1, "items.variantId": 1 }                           |
+---------------------------------------------------------------+
  Purpose: Rapidly checks if a specific item is wishlisted by a specific user.
```

### 4.1 Index Definitions (Mongoose Implementation)

```typescript
// 1. Unique User Index: Enforces 1 wishlist per user and optimizes user wishlist fetching
WishlistSchema.index({ userId: 1 }, { unique: true, name: 'idx_wishlist_user_unique' });

// 2. Variant Lookup Index: Allows fast reverse lookup for notification / catalog background jobs
WishlistSchema.index({ 'items.variantId': 1 }, { name: 'idx_wishlist_items_variant' });

// 3. Compound Index: Optimizes single-item check ("Is variant X in user Y's wishlist?")
WishlistSchema.index({ userId: 1, 'items.variantId': 1 }, { name: 'idx_wishlist_user_variant' });
```

---

## 5. Document Growth & Splitting Architectural Discussion

### 5.1 Document Memory Math & BSON Size Analysis

MongoDB imposes a hard limit of **16 MB per BSON document**. We analyze whether embedding items in a single document causes growth risks.

* **Base Document Overhead (`Wishlist` Root):**
  * `_id` (12 bytes) + `userId` (12 bytes) + `createdAt` (8 bytes) + `updatedAt` (8 bytes) + BSON metadata ≈ **64 bytes**.
* **Per Item Overhead (`WishlistItem` Subdocument):**
  * `variantId` (12 bytes) + `addedAt` (8 bytes) + Key strings ("variantId", "addedAt") & BSON field descriptors ≈ **40 to 50 bytes**. (Note: `_id: false` removes 12 bytes per subdocument).
* **Document Size Estimation:**
  * 100 items ≈ 5 KB
  * 1,000 items ≈ 50 KB
  * 10,000 items ≈ 500 KB
  * 300,000 items ≈ 15.5 MB (Approaching MongoDB 16MB boundary)

---

### 5.2 Should Wishlist Remain One Document?

* **Conclusion for Phase 1:** **YES**.
* **Justification:**
  1. The vast majority of e-commerce users keep between **5 and 100 items** in their wishlist.
  2. At 100 items, the BSON document size is less than 5 KB, which is extremely lightweight and optimal for MongoDB single-document memory pages.
  3. Single-document embedded array allows atomic `$addToSet` and `$pull` updates without multi-document ACID transaction overhead.

---

### 5.3 When Should the Document Structure be Split?

The aggregate should be refactored from an embedded array to a **bucketed or normalized collection pattern** under the following conditions:

1. **Soft Constraint Limit:** Array size reaches **500 to 1,000 items** per user.
   * Hard limits (e.g., max 200 items per user) can be enforced at application service level.
2. **Feature Evolution Triggers:**
   * **Multiple Wishlists per User:** When users can create custom collections (e.g., "Tech Gadgets", "Summer Fashion", "Holiday Ideas").
   * **Gift Registries:** When items require rich metadata such as `requestedQuantity`, `purchasedQuantity`, `priority`, and `purchasedBy`.
3. **Target Architecture for Splitting (Phase 2 / Enterprise Scaling):**
   ```
   Collection: wishlists (Aggregate Root Document)
   Collection: wishlist_items (Normalized child collection linked via wishlistId)
   ```

---

## 6. Enterprise Best Practices & Clean Architecture Guidelines

When business logic, services, and repositories are implemented in subsequent steps, the following principles **MUST** be adhered to:

### 6.1 Clean Architecture & Layering Rules

```
+-----------------------------------------------------------------------+
|  HTTP / Controller Layer (src/modules/wishlist/controllers)           |
|  - Validates DTOs via class-validator                                  |
|  - Calls WishlistService methods                                      |
|  - Returns standardized ApiResponse                                   |
+-----------------------------------++----------------------------------+
                                    ||
                                    v
+-----------------------------------------------------------------------+
|  Service Layer (src/modules/wishlist/services)                        |
|  - Owns business rules, duplicate checks, array size caps             |
|  - Orchestrates Repository, Catalog Verification, and Events          |
|  - Free of direct Mongoose / HTTP dependencies                        |
+-----------------------------------++----------------------------------+
                                    ||
                                    v
+-----------------------------------------------------------------------+
|  Repository Layer (src/modules/wishlist/repositories)                 |
|  - Executes atomic MongoDB queries ($addToSet, $pull, $lookup)         |
|  - Implements IWishlistRepository interface                           |
|  - Isolates database drivers from business domain                     |
+-----------------------------------------------------------------------+
```

### 6.2 SOLID Principles Compliance

* **Single Responsibility Principle (SRP):**
  * `WishlistController`: Handles HTTP requests/responses.
  * `WishlistService`: Executes business rules and domain logic.
  * `WishlistRepository`: Encapsulates MongoDB read/write operations.
* **Open/Closed Principle (OCP):**
  * Extending wishlist behaviors (e.g., publishing notification events on add) is accomplished via event emitters without editing the core repository operations.
* **Liskov Substitution Principle (LSP):**
  * The service relies on `IWishlistRepository` abstraction, allowing seamless swapping of MongoDB implementations with Redis-cached or memory repositories during unit testing.
* **Interface Segregation Principle (ISP):**
  * Repositories expose focused contracts (`findUserWishlist`, `addItem`, `removeItem`) rather than generic leak-all query interfaces.
* **Dependency Inversion Principle (DIP):**
  * High-level business services depend on interfaces (`IWishlistRepository`), not concrete Mongoose model implementations. Dependency injection is wired via NestJS DI containers.

---

## 7. Verification & Deliverable Sign-Off

* **Architecture Approved:** Yes
* **MongoDB Schema Standardized:** Yes (`wishlists` collection)
* **Index Strategy Documented:** Yes (`userId` unique, `variantId` reverse index, compound index)
* **Business Logic Excluded:** Yes (Zero service/repository code generated in Step 17.1)
