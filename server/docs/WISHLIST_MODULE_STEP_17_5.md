# Module 17.5 — Add to Wishlist API & Controller Design

## Executive Summary

This document establishes the REST API implementation, controller architecture, and centralized Dependency Injection (DI) wiring for **Module 17.5 — Add to Wishlist API**. The endpoint `POST /api/v1/wishlist` allows authenticated users to add a product variant to their wishlist, adhering strictly to Clean Architecture, SOLID principles, input validation standards, and centralized error handling.

---

## 1. API Architecture & Request Flow

```
[ Client Request ]
       │
       ▼
[ Express Router ] ───▶ app.use('/api/v1/wishlist', wishlistRoutes)
       │
       ▼
[ JWT Auth Middleware ] ───▶ Verifies Bearer token; injects req.user (401 on failure)
       │
       ▼
[ Validation Middleware ] ───▶ Validates variantId is Mongo ObjectId via express-validator (400 on failure)
       │
       ▼
[ Central DI Container ] ───▶ Resolves singleton wishlistController from src/container/index.ts
       │
       ▼
[ WishlistController ] ───▶ Extracts req.user._id & req.body.variantId; delegates to service
       │
       ▼
[ WishlistService ] ───▶ Validates variant active state, checks 100-item capacity, calls repo
       │
       ▼
[ WishlistRepository ] ───▶ Performs atomic $push with { 'items.variantId': { $ne: variantId } }
       │
       ▼
[ Standardized ApiResponse ] ───▶ 200 OK { success: true, message: '...', data: WishlistResponse }
```

---

## 2. Centralized Dependency Injection Wiring

To align strictly with the project's centralized IoC Container (`src/container/index.ts`), all Wishlist singletons are instantiated and exported from the central container:

Location: `src/container/index.ts`
```typescript
import { WishlistRepository } from "../modules/wishlist/repositories/wishlist.repository";
import { WishlistService } from "../modules/wishlist/services/wishlist.service";
import { WishlistController } from "../modules/wishlist/controllers/wishlist.controller";

// Wishlist Module Central DI Singletons
export const wishlistRepository = new WishlistRepository();
export const wishlistService = new WishlistService(wishlistRepository);
export const wishlistController = new WishlistController(wishlistService);
```

Location: `src/modules/wishlist/routes/wishlist.routes.ts`
```typescript
import { wishlistController } from '../../../container';

wishlistRouter.post('/', authenticate, addToWishlistValidation, (req: Request, res: Response, next: NextFunction) =>
  wishlistController.addToWishlist(req, res, next)
);
```

---

## 3. Answers to Review Observations

### Q1: Why were dependencies previously instantiated inside the route file?
In standard modular Express design, route files often act as localized Composition Roots. However, refactoring to the centralized DI container eliminates inline instantiation and standardizes lifetime management across modules.

### Q2: Should these be resolved from the project's existing DI Container / Composition Root instead?
**Yes.** Resolving from `src/container/index.ts` brings the Wishlist module into full alignment with core platform services like `authService`, `jwtService`, and `smsService`.

### Q3: Does inline instantiation create multiple instances?
Yes. If multiple modules import route definitions or test runners initialize modules, inline instantiation creates duplicate instances in Node.js process memory. The central DI container guarantees **true process-wide Singleton scope**.

### Q4: How does this align with DI in previous modules?
Centralized container resolution harmonizes Wishlist singletons with the global container pattern in `src/container/index.ts`, ensuring cross-module injection (e.g. Cart service injecting `wishlistService`) without circular dependencies.

---

## 4. Verification

* **TypeScript Compilation (`npx tsc --noEmit`):** ✅ Clean (0 Errors)
* **Files Updated:**
  * `src/container/index.ts`
  * `src/modules/wishlist/routes/wishlist.routes.ts`
  * `docs/WISHLIST_MODULE_STEP_17_5.md`
