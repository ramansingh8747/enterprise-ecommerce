# Module 17.3 — Wishlist Repository Implementation

## Executive Summary

This document details the persistence implementation for **Module 17.3 — Wishlist Repository**. Built on Mongoose and MongoDB, the repository satisfies the `IWishlistRepository` contract created in Step 17.2, maintaining strict Clean Architecture boundaries and SOLID principles.

---

## 1. Persistence Components Delivered

### 1.1 Wishlist Mongoose Model & Schema

Location: `src/modules/wishlist/models/wishlist.model.ts`

* **Collection Name:** `wishlists`
* **Schema Highlights:**
  * `userId`: `Types.ObjectId` (required, unique index `idx_wishlist_user_unique`, ref `User`).
  * `items`: Embedded subdocument array `WishlistItemSchema` (`_id: false` to eliminate subdocument overhead).
  * `items[].variantId`: `Types.ObjectId` (required, ref `ProductVariant`).
  * `items[].addedAt`: `Date` (default: `Date.now`).
  * **Indexes:**
    1. `{ userId: 1 }` (unique: true)
    2. `{ "items.variantId": 1 }`
    3. `{ userId: 1, "items.variantId": 1 }`

---

### 1.2 Wishlist Repository Implementation (`WishlistRepository`)

Location: `src/modules/wishlist/repositories/wishlist.repository.ts`

Implements `IWishlistRepository`:

```typescript
export class WishlistRepository implements IWishlistRepository {
  async findByUserId(userId: string): Promise<IWishlist | null>;
  async create(userId: string): Promise<IWishlist>;
  async addItem(userId: string, variantId: string): Promise<IWishlist | null>;
  async removeItem(userId: string, variantId: string): Promise<IWishlist | null>;
  async exists(userId: string, variantId: string): Promise<boolean>;
  async clear(userId: string): Promise<IWishlist | null>;
}
```

---

## 2. Technical Implementation Details & Atomic Operations

### 2.1 Atomic Item Addition & Array Duplicate Prevention

To add an item without creating duplicate `variantId` entries in the array (even when `addedAt` timestamps differ), the repository executes a conditional `$push`:

```typescript
const updatedDoc = await WishlistModel.findOneAndUpdate(
  {
    userId: userObjId,
    'items.variantId': { $ne: variantObjId }, // Ensures variantId is NOT in the array
  },
  {
    $push: {
      items: {
        variantId: variantObjId,
        addedAt: new Date(),
      },
    },
  },
  { new: true }
)
  .lean()
  .exec();
```

* **Guarantee:** If `variantId` is already present, the query condition fails atomically, returning `null` from `findOneAndUpdate`. The repository gracefully fetches and returns the existing wishlist without duplicating array elements.

---

### 2.2 Atomic Item Removal (`$pull`)

Removing an item from the embedded array uses MongoDB's native `$pull` operator:

```typescript
const updatedDoc = await WishlistModel.findOneAndUpdate(
  { userId: userObjId },
  {
    $pull: {
      items: { variantId: variantObjId },
    },
  },
  { new: true }
)
  .lean()
  .exec();
```

---

### 2.3 Domain Mapping & Anti-Leakage Layer (`mapToDomain`)

To comply with Dependency Inversion and keep services agnostic of Mongoose, the repository maps raw database query results to plain `IWishlist` domain interfaces:

```typescript
private mapToDomain(doc: any): IWishlist {
  return {
    _id: doc._id,
    userId: doc.userId,
    items: (doc.items || []).map((item: any) => ({
      variantId: item.variantId,
      addedAt: item.addedAt,
    })),
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}
```

* **Benefit:** Services receive clean TypeScript domain objects without Mongoose ORM leakage (`.save()`, `.populate()`, internal BSON properties).

---

## 3. Verification

* **TypeScript Compilation (`npx tsc --noEmit`):** ✅ Clean (0 Errors)
* **Files Created/Updated:**
  * `src/modules/wishlist/models/wishlist.model.ts`
  * `src/modules/wishlist/repositories/wishlist.repository.ts`
  * `src/modules/wishlist/index.ts`
  * `docs/WISHLIST_MODULE_STEP_17_3.md`
