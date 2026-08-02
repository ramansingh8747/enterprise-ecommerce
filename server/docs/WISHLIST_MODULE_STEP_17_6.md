# Module 17.6 — Remove from Wishlist REST API Design

## Executive Summary

This document details the REST API specification and implementation for **Module 17.6 — Remove from Wishlist API**. The endpoint `DELETE /api/v1/wishlist/:variantId` allows authenticated users to remove a product variant from their wishlist, returning the updated populated wishlist aggregate.

---

## 1. REST Endpoint Specifications

### 1.1 Endpoint Contracts

| HTTP Method | Route Path | Authentication | Validation Chain | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/wishlist` | JWT Bearer Token | None | Retrieves user wishlist enriched with prices, catalog titles, and live stock status. |
| `POST` | `/api/v1/wishlist` | JWT Bearer Token | `addToWishlistValidation` | Adds a variant to user wishlist. |
| `DELETE` | `/api/v1/wishlist/:variantId` | JWT Bearer Token | `removeFromWishlistValidation` | Removes a variant from user wishlist. |
| `POST` | `/api/v1/wishlist/:variantId/move-to-cart` | JWT Bearer Token | `moveToCartValidation` | Transfers a variant from wishlist into user cart. |

---

## 2. Request & Response Examples

### 2.1 Remove Item Request (`DELETE /api/v1/wishlist/:variantId`)

* **URL Path Parameter:** `variantId` (Must be a valid 24-character Mongo ObjectId).
* **Headers:** `Authorization: Bearer <JWT_TOKEN>`

### 2.2 Success Response (200 OK)

```json
{
  "success": true,
  "message": "Item removed from wishlist successfully.",
  "data": {
    "_id": "65b2a1f4c8d9e00112233999",
    "userId": "65b2a1f4c8d9e00112233111",
    "items": [],
    "totalItems": 0,
    "createdAt": "2026-08-02T12:00:00.000Z",
    "updatedAt": "2026-08-02T13:13:20.000Z"
  }
}
```

---

## 3. Architecture & Security Controls

1. **Parameter Validation:** Express-validator `param('variantId').isMongoId()` verifies URL path parameters before reaching controller methods, returning 400 Bad Request if malformed.
2. **Atomic Deletion:** The repository layer uses MongoDB `$pull` operator (`{ $pull: { items: { variantId: variantObjId } } }`), guaranteeing atomic single-document updates.
3. **Idempotency:** If the requested `variantId` is not present in the user's wishlist, the API returns 200 OK with the current wishlist state gracefully without throwing errors.
4. **Tenant Isolation:** Users can only mutate their own wishlist aggregate. The authenticated `userId` is extracted strictly from the JWT context (`req.user._id`).

---

## 4. Verification & Sign-Off

* **TypeScript Compilation (`npx tsc --noEmit`):** ✅ Clean (0 Errors)
* **Files Delivered:**
  * `src/modules/wishlist/controllers/wishlist.controller.ts`
  * `src/modules/wishlist/validations/wishlist.validation.ts`
  * `src/modules/wishlist/routes/wishlist.routes.ts`
  * `docs/WISHLIST_MODULE_STEP_17_6.md`
