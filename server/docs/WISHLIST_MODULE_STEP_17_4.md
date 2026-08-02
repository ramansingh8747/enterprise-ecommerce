# Module 17.4 — Wishlist Service & Business Logic

## Executive Summary

This document details the application service implementation for **Module 17.4 — Wishlist Service**. Built following Clean Architecture principles, the `WishlistService` implements `IWishlistService` and encapsulates all domain rules, catalog populates, inventory stock calculations, capacity enforcement, and DTO transformations.

---

## 1. Application Service Architecture

Location: `src/modules/wishlist/services/wishlist.service.ts`

```typescript
export class WishlistService implements IWishlistService {
  constructor(private readonly wishlistRepository: IWishlistRepository) {}

  async getWishlist(userId: string): Promise<WishlistResponse>;
  async addToWishlist(userId: string, variantId: string): Promise<WishlistResponse>;
  async removeFromWishlist(userId: string, variantId: string): Promise<WishlistResponse>;
  async moveToCart(userId: string, variantId: string): Promise<MoveToCartResult>;
}
```

---

## 2. Business Rules & Features Implemented

### 2.1 Variant Validation & Active State Check
* Prior to adding an item, `addToWishlist` validates that the target `variantId` exists in the `ProductVariant` catalog and that `isActive !== false`.
* Throws an explicit domain exception if the variant is missing or deactivated.

### 2.2 Dynamic Populates & Batch Resolution (`enrichWishlist`)
* Wishlist documents store raw references (`variantId`) to preserve Single Source of Truth.
* The service performs **batch lookups** against `ProductVariant` using `$in` arrays for optimal $O(1)$ memory mapping:
  * Dynamic price resolution (`salePrice` vs `price`).
  * Live stock quantity & `inStock` boolean calculation.
  * Image thumbnail extraction.
  * Attribute key-value mapping (e.g. `{ Color: "Red", Size: "XL" }`).

### 2.3 Capacity Enforcement (`MAX_WISHLIST_CAPACITY`)
* A hard threshold of **100 items** (`MAX_WISHLIST_CAPACITY = 100`) is enforced per user wishlist to prevent abuse and document size bloat.
* If a user reaches 100 items and attempts to add a new variant, the service rejects the request with a capacity limit error.

### 2.4 Atomically Moving Items to Cart (`moveToCart`)
1. Verifies item presence in user's wishlist via `wishlistRepository.exists(userId, variantId)`.
2. Validates live inventory stock availability (`stock > 0`).
3. Removes the item from Wishlist via `wishlistRepository.removeItem(userId, variantId)`.
4. Returns a composite payload containing the updated wishlist and cart transfer details.

---

## 3. Verification

* **TypeScript Compilation (`npx tsc --noEmit`):** ✅ Clean (0 Errors)
* **Files Created/Updated:**
  * `src/modules/wishlist/services/wishlist.service.ts`
  * `src/modules/wishlist/index.ts`
  * `docs/WISHLIST_MODULE_STEP_17_4.md`
