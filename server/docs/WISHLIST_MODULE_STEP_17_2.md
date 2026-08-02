# Module 17.2 — Wishlist Interfaces & TypeScript Contracts

## Executive Summary

This document defines the formal TypeScript contract specifications for **Module 17.2 — Wishlist System**. Following Clean Architecture, SOLID principles, and Design-by-Contract (DbC), all domain models, persistence contracts, service interfaces, API request DTOs, and API response models are strictly separated prior to writing repository implementations or business logic services.

---

## 1. Interface Specifications

### 1.1 Wishlist Item Interface (`IWishlistItem`)

Location: `src/modules/wishlist/interfaces/wishlist-item.interface.ts`

```typescript
import { Types } from 'mongoose';

export interface IWishlistItem {
  variantId: Types.ObjectId | string;
  addedAt: Date;
}
```

#### Field Explanations

| Field | Type | Purpose & Architectural Justification |
| :--- | :--- | :--- |
| `variantId` | `Types.ObjectId \| string` | References the exact purchasable Product Variant (SKU level). Crucial for 1-click cart transfer and variant-specific inventory/price notifications. |
| `addedAt` | `Date` | UTC timestamp capturing when the user added the item. Used for sorting wishlist items by recency ("Recently Added First"). |

---

### 1.2 Wishlist Document Interface (`IWishlist`)

Location: `src/modules/wishlist/interfaces/wishlist.interface.ts`

```typescript
import { Types } from 'mongoose';
import { IWishlistItem } from './wishlist-item.interface';

export interface IWishlist {
  _id: Types.ObjectId | string;
  userId: Types.ObjectId | string;
  items: IWishlistItem[];
  createdAt: Date;
  updatedAt: Date;
}
```

#### Field Explanations

| Field | Type | Purpose & Architectural Justification |
| :--- | :--- | :--- |
| `_id` | `Types.ObjectId \| string` | Unique BSON primary key identifying the Wishlist Aggregate root. |
| `userId` | `Types.ObjectId \| string` | Reference to the owning User document. Enforces 1:1 user-to-wishlist ownership and serves as tenant boundary. |
| `items` | `IWishlistItem[]` | Embedded array of wishlisted variant subdocuments. Enables O(1) single-document reads for user wishlists. |
| `createdAt` | `Date` | System timestamp tracking when the wishlist aggregate was first initialized. |
| `updatedAt` | `Date` | System timestamp updated automatically on item insertion, removal, or clear. |

---

### 1.3 Wishlist Repository Interface (`IWishlistRepository`)

Location: `src/modules/wishlist/interfaces/wishlist-repository.interface.ts`

```typescript
import { IWishlist } from './wishlist.interface';

export interface IWishlistRepository {
  findByUserId(userId: string): Promise<IWishlist | null>;
  create(userId: string): Promise<IWishlist>;
  addItem(userId: string, variantId: string): Promise<IWishlist | null>;
  removeItem(userId: string, variantId: string): Promise<IWishlist | null>;
  exists(userId: string, variantId: string): Promise<boolean>;
  clear(userId: string): Promise<IWishlist | null>;
}
```

#### Method Explanations

| Method | Parameters | Return Type | Responsibility |
| :--- | :--- | :--- | :--- |
| `findByUserId` | `userId: string` | `Promise<IWishlist \| null>` | Executes query to retrieve the user's wishlist aggregate by owner ID. |
| `create` | `userId: string` | `Promise<IWishlist>` | Initializes a new empty wishlist document in MongoDB for a user. |
| `addItem` | `userId: string, variantId: string` | `Promise<IWishlist \| null>` | Performs an atomic `$addToSet` update to add a variant without duplicate array elements. |
| `removeItem` | `userId: string, variantId: string` | `Promise<IWishlist \| null>` | Performs an atomic `$pull` update to remove a specific variant subdocument. |
| `exists` | `userId: string, variantId: string` | `Promise<boolean>` | Performs an optimized boolean index check to determine if a variant is wishlisted. |
| `clear` | `userId: string` | `Promise<IWishlist \| null>` | Resets the `items` array to empty (`[]`) for the user's wishlist document. |

---

### 1.4 Wishlist Service Interface (`IWishlistService`)

Location: `src/modules/wishlist/interfaces/wishlist-service.interface.ts`

```typescript
import { WishlistResponse } from '../dto/wishlist-response.dto';

export interface MoveToCartResult {
  success: boolean;
  message: string;
  cart?: unknown;
  wishlist: WishlistResponse;
}

export interface IWishlistService {
  getWishlist(userId: string): Promise<WishlistResponse>;
  addToWishlist(userId: string, variantId: string): Promise<WishlistResponse>;
  removeFromWishlist(userId: string, variantId: string): Promise<WishlistResponse>;
  moveToCart(userId: string, variantId: string): Promise<MoveToCartResult>;
}
```

#### Method Explanations

| Method | Parameters | Return Type | Responsibility |
| :--- | :--- | :--- | :--- |
| `getWishlist` | `userId: string` | `Promise<WishlistResponse>` | Orchestrates repository fetching, catalog/variant dynamic joins, stock calculation, price resolution, and DTO conversion. |
| `addToWishlist` | `userId: string, variantId: string` | `Promise<WishlistResponse>` | Validates variant existence in Catalog service, verifies non-duplicate inclusion, delegates persistence to repository, and returns enriched DTO. |
| `removeFromWishlist` | `userId: string, variantId: string` | `Promise<WishlistResponse>` | Removes item via repository, handles non-existent item gracefully, and returns updated DTO. |
| `moveToCart` | `userId: string, variantId: string` | `Promise<MoveToCartResult>` | Executes cross-module orchestration: adds variant to user's Cart module, removes item from Wishlist, and returns combined result payload. |

---

### 1.5 API Request DTOs

Location: `src/modules/wishlist/dto/`

```typescript
// add-to-wishlist.dto.ts
export interface AddToWishlistRequest {
  variantId: string;
}

// remove-wishlist-item.dto.ts
export interface RemoveWishlistItemRequest {
  variantId: string;
}
```

---

### 1.6 API Response DTOs

Location: `src/modules/wishlist/dto/wishlist-response.dto.ts`

```typescript
export interface WishlistItemResponse {
  productId: string;
  variantId: string;
  sku: string;
  productName: string;
  slug: string;
  thumbnail: string | null;
  price: number;
  compareAtPrice: number | null;
  inStock: boolean;
  stockQuantity: number;
  attributes: Record<string, string>;
  addedAt: Date;
}

export interface WishlistResponse {
  _id: string;
  userId: string;
  items: WishlistItemResponse[];
  totalItems: number;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Field Explanations (`WishlistItemResponse`)

| Field | Type | Purpose & Architectural Justification |
| :--- | :--- | :--- |
| `productId` | `string` | Unique identifier of parent product (enables frontend navigation to product page). |
| `variantId` | `string` | Target variant identifier. |
| `sku` | `string` | Stock Keeping Unit identifier. |
| `productName` | `string` | Human-readable title dynamically resolved from Catalog aggregate. |
| `slug` | `string` | URL slug for web client routing. |
| `thumbnail` | `string \| null` | Resolved main image asset URL. |
| `price` | `number` | Real-time active price calculated by Pricing Engine. |
| `compareAtPrice` | `number \| null` | Original strike-through price (if on discount). |
| `inStock` | `boolean` | Computed real-time boolean stock flag (`stockQuantity > 0`). |
| `stockQuantity` | `number` | Live available inventory count from Inventory module. |
| `attributes` | `Record<string, string>` | Key-value pairs of variant selections (e.g., `{ "Color": "Red", "Size": "XL" }`). |
| `addedAt` | `Date` | Timestamp of item addition. |

---

## 2. Enterprise Design Explanations

### 2.1 Why Interfaces Come Before Implementation

1. **Design-by-Contract (DbC):** Contracts establish explicit, unambiguous boundaries between system layers before concrete code is written.
2. **Parallel Team Development:** Frontend, integration teams, and backend developers can build against stable TypeScript interface definitions without waiting for database implementations.
3. **Decoupling Architecture:** Ensures code is designed around abstractions (`IWishlistService`), enforcing the Dependency Inversion Principle (DIP).

---

### 2.2 Interface Segregation Principle (ISP)

* ISP dictates that **no client should be forced to depend on methods it does not use**.
* In our Wishlist architecture, `IWishlistRepository` strictly defines database persistence operations (`findByUserId`, `addItem`, `removeItem`), while `IWishlistService` handles high-level application orchestration (`addToWishlist`, `moveToCart`). Controllers interact only with `IWishlistService`, preventing presentation handlers from directly invoking internal persistence mechanisms.

---

### 2.3 Why Controllers Should Depend on Service Interfaces

* Controllers act purely as **HTTP/API adapters**. They parse requests, pass parameters to services, and format responses.
* Injecting `IWishlistService` via interface injection ensures controllers remain completely agnostic of business logic implementations, database drivers, or caching layers.
* Enables unit testing of controllers by injecting mock service implementations (`MockWishlistService`).

---

### 2.4 Why Repositories Should Never Expose Mongoose Documents Directly

* Exposing Mongoose `Document` or `HydratedDocument` objects leaks database framework specifics (`.save()`, `.populate()`, `__v`, internal document state) into application services.
* **Architectural Risk:** Leaking ORM/ODM models allows services to mutate state via `.save()` outside explicit repository methods, breaking encapsulation and Clean Architecture.
* **Solution:** Repositories return plain TypeScript domain interfaces (`IWishlist`), keeping services driver-agnostic.

---

### 2.5 Why Response Models Must Remain Separate from Persistence Models

| Persistence Model (`IWishlistDocument`) | Response Model (`WishlistResponse`) |
| :--- | :--- |
| Contains raw database references (`variantId: ObjectId`). | Enriched with real-time catalog names, prices, thumbnails, and inventory. |
| Tailored for efficient BSON storage and index performance. | Tailored for frontend consumption, mobile clients, and UI rendering. |
| Schema changes reflect database migrations. | Schema changes preserve client API backward compatibility (Open/Closed Principle). |
| May contain internal state flags. | Filters out confidential or unneeded system metadata. |

---

## 3. Verification & Sign-Off

* **TypeScript Compilation (`npx tsc --noEmit`):** ✅ Clean (0 Errors)
* **Contracts Created:**
  * `src/modules/wishlist/interfaces/wishlist-item.interface.ts`
  * `src/modules/wishlist/interfaces/wishlist.interface.ts`
  * `src/modules/wishlist/interfaces/wishlist-repository.interface.ts`
  * `src/modules/wishlist/interfaces/wishlist-service.interface.ts`
  * `src/modules/wishlist/dto/add-to-wishlist.dto.ts`
  * `src/modules/wishlist/dto/remove-wishlist-item.dto.ts`
  * `src/modules/wishlist/dto/wishlist-response.dto.ts`
  * `src/modules/wishlist/index.ts`
* **Implementation Classes:** None created (Contracts only).
