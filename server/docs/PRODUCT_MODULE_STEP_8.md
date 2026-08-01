# Enterprise E-commerce — Product Module Developer Documentation

**Module:** Product Catalog (Step 8)  
**Stack:** Node.js · Express · TypeScript · MongoDB · Mongoose · JWT · RBAC · Cloudinary  
**Audience:** Backend engineers, tech leads, API consumers  
**Document version:** 1.0  
**Base API path:** `/api/v1/products`

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Folder Structure](#2-folder-structure)
3. [Product Interface](#3-product-interface)
4. [Product Schema](#4-product-schema)
5. [Category & Brand Relationships](#5-category--brand-relationships)
6. [Repository Layer](#6-repository-layer)
7. [Service Layer](#7-service-layer)
8. [Controller Layer](#8-controller-layer)
9. [Validation Layer](#9-validation-layer)
10. [Routes](#10-routes)
11. [Image Upload](#11-image-upload)
12. [Product Listing](#12-product-listing)
13. [Authentication](#13-authentication)
14. [RBAC](#14-rbac)
15. [Error Handling](#15-error-handling)
16. [API Response Format](#16-api-response-format)
17. [Complete Request Flow](#17-complete-request-flow)
18. [Best Practices](#18-best-practices)
19. [Testing](#19-testing)
20. [Future Enhancements](#20-future-enhancements)
21. [Appendix](#appendix)

---

# 1. Introduction

## 1.1 Product Module Overview

The Product Module is the catalog backbone of the Enterprise E-commerce platform. It owns the lifecycle of sellable items: identity (SKU/slug), merchandising (status, featured flags), pricing, inventory signals, media, SEO metadata, and relationships to Category and Brand.

Step 8 delivered a production-oriented vertical slice:

| Step | Capability |
|------|------------|
| 8.1 | Module foundation (interfaces, layers, DI-ready stubs) |
| 8.2 | Product schema & domain enums |
| 8.3 | Category & Brand relationship models |
| 8.4 | Product Repository |
| 8.5 | Product Service (business rules) |
| 8.6 | Product Controller |
| 8.7 | express-validator chains |
| 8.8 | Authenticated + RBAC-protected CRUD routes |
| 8.9 | Cloudinary image upload (thumbnail + gallery) |
| 8.10 | Enterprise listing (search, filter, sort, pagination) |

The module does **not** yet own checkout, cart, order fulfillment, or public storefront APIs. Those will consume Product as a dependency later.

## 1.2 Objectives

**Why this module exists**

1. **Single source of truth for catalog data** — prevent pricing/inventory drift across micro-features.
2. **Enforce enterprise boundaries** — HTTP ≠ business ≠ persistence.
3. **Safe multi-role access** — only privileged roles mutate catalog; deletes are Super Admin only.
4. **Operational readiness** — indexes, lean reads, listing query API, Cloudinary CDN URLs.
5. **Extensibility** — Repository + Service seams allow Elastic, Redis, variants, and audit without rewriting controllers.

**Non-objectives (intentionally deferred)**

- Public anonymous catalog browsing
- Soft delete / recycle bin
- Image deletion from Cloudinary
- Product variants / options matrix
- Full-text ranking engines (Elasticsearch)
- Redis caching / CDN invalidation jobs

## 1.3 Enterprise Architecture

The Product Module follows a **layered Clean Architecture** style adapted to Express + Mongoose.

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT (Postman / Admin UI)          │
└────────────────────────────┬────────────────────────────────┘
                             │ HTTPS JSON / multipart
┌────────────────────────────▼────────────────────────────────┐
│  ROUTES  product.routes.ts                                  │
│  Auth → RBAC → Upload → Validators → Controller             │
└────────────────────────────┬────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────┐
│  CONTROLLER  product.controller.ts                          │
│  Map HTTP ↔ DTOs; ApiResponse; forward errors via next()    │
└────────────────────────────┬────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────┐
│  SERVICE  product.service.ts                                │
│  Domain rules: uniqueness, existence, listing normalization │
└────────────────────────────┬────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────┐
│  REPOSITORY  product.repository.ts                          │
│  Mongoose queries only; lean(); dynamic listing filters     │
└────────────────────────────┬────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────┐
│  MODEL / DB  products · categories · brands (MongoDB)       │
└─────────────────────────────────────────────────────────────┘
         ▲
         │ Cloudinary URLs only (no binary storage in Mongo)
┌────────┴────────┐
│    Cloudinary   │
└─────────────────┘
```

**Composition (Dependency Injection at route composition root):**

```typescript
const productRepository = new ProductRepository();
const productService = new ProductService(productRepository);
const productController = new ProductController(productService);
```

Controllers never `new` repositories. Services never import Express. Repositories never throw domain “SKU exists” rules—they only execute persistence.

## 1.4 Design Principles

### SOLID

| Principle | How it applies |
|-----------|----------------|
| **S**ingle Responsibility | Route wires middleware; Controller speaks HTTP; Service owns rules; Repository owns Mongo. |
| **O**pen/Closed | New listing filters extend `buildListingFilter` without changing CRUD methods. |
| **L**iskov | `IProduct` contract is stable across lean documents and hydrated models at the type boundary. |
| **I**nterface Segregation | Listing types live in `product-listing.interface.ts`, not bloating `IProduct`. |
| **D**ependency Inversion | `ProductService` depends on `ProductRepository` abstraction injected via constructor. |

### Repository Pattern

Isolates MongoDB/Mongoose from application logic so the service can be tested with a fake repository and so query complexity (listing) does not leak into controllers.

### Service Layer

Centralizes **why** an operation is allowed (duplicate SKU, product must exist before update) independent of **how** HTTP or Mongo work.

### Dependency Injection

Constructor injection keeps the graph explicit and replaceable. The current composition root is `product.routes.ts` (same pattern as the auth container for SMS/JWT services).

---

# 2. Folder Structure

Relevant Product Module files under `server/src`:

```
src/
├── config/
│   └── cloudinary.ts                 # Cloudinary SDK config (env-based)
├── constants/
│   └── roles.ts                      # Enterprise RBAC role constants
├── controllers/
│   └── product.controller.ts         # HTTP adapters for Product APIs
├── interfaces/
│   ├── product.interface.ts          # IProduct, ProductStatus, StockStatus
│   ├── product-listing.interface.ts  # Listing query + pagination types
│   ├── category.interface.ts         # ICategory
│   ├── brand.interface.ts            # IBrand
│   └── api-response.interface.ts     # Standard ApiResponse<T>
├── middleware/
│   ├── auth.middleware.ts            # JWT Bearer authentication
│   ├── role.middleware.ts            # authorize(...roles)
│   └── upload.middleware.ts          # Multer + Cloudinary product upload
├── models/
│   ├── product.model.ts              # ProductSchema → collection "products"
│   ├── category.model.ts             # CategorySchema → "categories"
│   └── brand.model.ts                # BrandSchema → "brands"
├── repositories/
│   └── product.repository.ts         # Persistence API
├── routes/
│   └── product.routes.ts             # /api/v1/products wiring
├── services/
│   └── product.service.ts            # Domain / use-case logic
└── validators/
    └── product.validator.ts          # express-validator chains
```

### File responsibilities

| File | Responsibility | Why it exists |
|------|----------------|---------------|
| `product.interface.ts` | Compile-time domain contract + enums | Shared typing across layers; avoids `any` |
| `product-listing.interface.ts` | Listing/pagination DTOs | Keeps list concerns out of core product entity |
| `product.model.ts` | Schema, indexes, defaults, collection name | Persistence mapping only |
| `category.model.ts` / `brand.model.ts` | Referenced catalogs | Normalize taxonomy & brands |
| `product.repository.ts` | CRUD + dynamic listing queries | Hide Mongoose from service |
| `product.service.ts` | Uniqueness, existence, list normalization | Business correctness |
| `product.controller.ts` | Params/body/files → service; ApiResponse | Thin HTTP edge |
| `product.validator.ts` | Request shape rules | Fail fast before service |
| `product.routes.ts` | Middleware pipeline + DI composition | Single mount point |
| `upload.middleware.ts` | Binary → Cloudinary | Keep upload infra reusable |
| `cloudinary.ts` | Provider config | Secrets stay in env |

**Mount point** (`app.ts`):

```typescript
app.use("/api/v1/products", productRoutes);
```

---

# 3. Product Interface

Defined in `src/interfaces/product.interface.ts`.

## 3.1 Enums

### `ProductStatus`

| Value | Meaning |
|-------|---------|
| `DRAFT` | Not visible for sale; work in progress (default on create) |
| `ACTIVE` | Sellable / listable in catalog operations |
| `INACTIVE` | Temporarily withheld without archiving |
| `ARCHIVED` | Retired; retained for history/reporting |

**Why:** Lifecycle must be explicit. A boolean `isActive` cannot express draft vs archived.

### `StockStatus`

| Value | Meaning |
|-------|---------|
| `IN_STOCK` | Available to sell |
| `OUT_OF_STOCK` | Zero sellable inventory (default) |
| `LOW_STOCK` | Below operational threshold |
| `PREORDER` | Sellable before physical stock arrives |

**Why:** Separates **inventory signal** from **publish status**. A product can be `ACTIVE` and `PREORDER`.

## 3.2 Field catalog

| Field | Type | Required | Why it exists |
|-------|------|----------|---------------|
| `name` | `string` | Yes | Human-readable merchandising title |
| `slug` | `string` | Yes | URL-safe unique identifier for SEO routes |
| `sku` | `string` | Yes | Warehouse / ERP unique stock keeping unit |
| `shortDescription` | `string` | No (default `""`) | Cards, listings, meta snippets |
| `description` | `string` | No (default `""`) | Full PDP content |
| `price` | `number` | Yes | Selling price (≥ 0) |
| `comparePrice` | `number?` | No | “Was” / MSRP for discount UI |
| `costPrice` | `number?` | No | Internal margin calculation (not for customers) |
| `currency` | `string` | Yes (default `INR`) | ISO currency for multi-currency readiness |
| `quantity` | `number` | Yes (default `0`) | On-hand units |
| `lowStockThreshold` | `number` | No (default `5`) | Drives LOW_STOCK operational alerts |
| `category` | `ObjectId` | Yes | Taxonomy / navigation / reporting |
| `brand` | `ObjectId?` | No | Brand filtering & storefront facets |
| `images` | `string[]` | No (default `[]`) | Gallery Cloudinary URLs |
| `thumbnail` | `string?` | No | Primary image URL for cards |
| `tags` | `string[]` | No (default `[]`) | Free-form search / campaigns |
| `status` | `ProductStatus` | Yes | Publish lifecycle |
| `stockStatus` | `StockStatus` | Yes | Availability signal |
| `isFeatured` | `boolean` | No (default `false`) | Homepage / promo rails |
| `isDigital` | `boolean` | No (default `false`) | Skip shipping weight rules later |
| `weight/length/width/height` | `number?` | No | Shipping dimensional weight |
| `seoTitle` | `string?` | No | SERP title (≤ 70) |
| `seoDescription` | `string?` | No | SERP description (≤ 160) |
| `seoKeywords` | `string[]` | No | Editorial keyword hints |
| `createdBy` | `ObjectId` | Yes | Audit: who created |
| `updatedBy` | `ObjectId?` | No | Audit: who last changed |
| `createdAt` / `updatedAt` | `Date` | Auto | Timestamps |

### Identity triad: `name` · `slug` · `sku`

- **name** changes for marketing copy.
- **slug** is stable for public URLs (`/products/slug/:slug`).
- **sku** is stable for warehouse integrations.

Never use Mongo `_id` alone as the only external key—partners speak SKU; SEO speaks slug.

### Pricing triad: `price` · `comparePrice` · `costPrice`

- **price** — customer-facing.
- **comparePrice** — strike-through UI only; not used for charging.
- **costPrice** — internal; protect via RBAC (never expose on public APIs later).

### Media: `thumbnail` · `images`

Binaries are **not** stored in MongoDB. Only HTTPS Cloudinary URLs are persisted. This keeps documents small and leverages CDN caching.

---

# 4. Product Schema

File: `src/models/product.model.ts`  
Collection: **`products`**

## 4.1 Schema design goals

1. Validate at the persistence boundary (defense in depth with express-validator).
2. Index fields used by listing filters and unique lookups.
3. Survive hot-reload without `OverwriteModelError`.

## 4.2 Validation highlights

| Path | Rules |
|------|-------|
| `name` | required, trim, max 200 |
| `slug` | required, trim, lowercase, **unique**, max 220 |
| `sku` | required, trim, uppercase, **unique**, max 64 |
| `price` | required, min 0 |
| `quantity` | required, min 0, default 0 |
| `category` | required ObjectId → `Category` |
| `brand` | optional ObjectId → `Brand` |
| `status` | enum `ProductStatus`, default `DRAFT` |
| `stockStatus` | enum `StockStatus`, default `OUT_OF_STOCK` |
| `seoTitle` | max 70 |
| `seoDescription` | max 160 |
| `createdBy` | required ObjectId → `User` |

## 4.3 Indexes

**Unique (via schema path):**

- `sku`
- `slug`

**Lookup / listing indexes:**

- `category`, `brand`, `status`, `stockStatus`
- `isFeatured`, `isDigital`, `price`, `tags`
- `createdAt` (newest/oldest sort)
- `name` (nameAsc/nameDesc)

**Text index** `product_text_search`:

- `name`, `shortDescription`, `description`, `seoTitle`, `seoDescription`

> Listing search in Step 8.10 uses safe regex `$or` (not text-score ranking) to avoid introducing Elastic-like behavior prematurely. The text index remains available for future `$text` queries.

## 4.4 Timestamps

```typescript
{ timestamps: true, collection: "products" }
```

Mongoose maintains `createdAt` and `updatedAt`.

## 4.5 Model overwrite protection

```typescript
const Product: Model<IProduct> =
  (mongoose.models.Product as Model<IProduct>) ||
  mongoose.model<IProduct>("Product", productSchema);
```

**Why:** `ts-node-dev` / nodemon re-evaluates modules; without this guard, Mongoose throws on recompile.

## 4.6 What the schema deliberately does NOT include

- No Mongoose middleware hooks (pre-save stock recalculation)
- No virtuals
- No plugins (paginate, soft-delete)
- No population defaults

These belong in service/application workflows when requirements stabilize.

---

# 5. Category & Brand Relationships

## 5.1 ObjectId references

```typescript
category: { type: ObjectId, ref: "Category", required: true }
brand:    { type: ObjectId, ref: "Brand" } // optional
```

Products store **references**, not embedded category trees or brand documents.

## 5.2 ER diagram (logical)

```
┌────────────┐         ┌──────────────────┐         ┌────────────┐
│   User     │         │     Product      │         │  Category  │
│  _id       │◄────────┤ createdBy        │────────►│  _id       │
│            │◄────────┤ updatedBy?       │  N:1    │  name      │
└────────────┘         │ category (req)   │         │  slug      │
                       │ brand?           │──┐      │  parent?   │
                       │ sku (unique)     │  │      │  level     │
                       │ slug (unique)    │  │      └─────▲──────┘
                       └──────────────────┘  │            │ self-ref
                                             │            │ parent
                       ┌────────────┐        │
                       │   Brand    │◄───────┘
                       │  _id       │   N:1 (optional)
                       │  name      │
                       │  slug      │
                       └────────────┘
```

## 5.3 Category model (summary)

Collection: `categories`  
Fields: `name`, `slug` (unique), `description`, `parent` (self-ref), `level`, `isActive`, `sortOrder`, `createdBy`, `updatedBy`, timestamps.

**Why `parent` + `level`:** Supports nested navigation (Electronics → Phones → Android) without embedding unbounded trees on Product.

## 5.4 Brand model (summary)

Collection: `brands`  
Fields: `name`, `slug` (unique), `description`, `logo`, `website`, `isActive`, `sortOrder`, audit fields, timestamps.

## 5.5 Why normalization

| Approach | Pros | Cons |
|----------|------|------|
| Embed category name on product | Fast reads | Rename category → mass product updates |
| Reference ObjectId | Single update; consistent filters | Needs join/populate when denormalized view required |

Enterprise catalogs rename categories often and attach thousands of products—**references win**.

Population is **opt-in** and not performed in default listing (`lean()` without populate) for performance.

---

# 6. Repository Layer

File: `src/repositories/product.repository.ts`

## 6.1 Pattern intent

The repository is the **only** type that imports the Product model for writes/reads used by Product use cases. It answers: *“Persist and retrieve Product documents.”* It does **not** answer: *“May this admin create a duplicate SKU?”*

## 6.2 Constructor injection

```typescript
constructor(productModel: Model<IProduct> = Product) {
  this.productModel = productModel;
}
```

Default argument supports production wiring; tests can inject a mock `Model`.

## 6.3 Methods

### `create(product)`

- **Input:** `Partial<IProduct>`
- **Output:** `Promise<IProduct>`
- **Behavior:** `productModel.create`
- **Why:** Encapsulate insert API; future can swap to `insertMany` transactions.

### `findById(id)`

- **Behavior:** `findById` + `lean()`
- **Why lean:** Listing/detail reads don’t need Mongoose document methods; lower memory.

### `findBySku(sku)` / `findBySlug(slug)`

- Unique field lookups for PDP and integrations.
- `lean()` applied.

### `findAll(filter, options)`

- Pass-through find for simple consumers.
- **Preserved** so listing enhancements do not break callers that already used raw filters.

### `findByListing(query)` *(Step 8.10)*

- Builds dynamic `QueryFilter`
- Applies sort, `skip`, `limit`
- Parallel `find` + `countDocuments`
- Returns `{ items, total }`

### `updateById(id, update)`

- `findByIdAndUpdate` with `{ new: true, runValidators: true }`
- Ensures schema validators run on partial updates.

### `deleteById(id)`

- Hard delete via `findByIdAndDelete`
- Soft delete intentionally omitted.

### `count(filter)` / `exists(filter)`

- Aggregation-free counting and existence checks used by Service uniqueness rules.

## 6.4 Why business logic is NOT here

| Concern | Belongs in |
|---------|------------|
| “SKU already exists” message | Service |
| Default page size / max limit | Service |
| HTTP 403 vs 401 | Middleware / Controller |
| Cloudinary upload | Upload middleware |
| Regex escaping for search | Repository (query safety) — acceptable infrastructure detail |

If uniqueness lived in the repository, every future entry point (CLI importer, job worker) would re-implement HTTP-oriented error strings—or worse, silently rely on Mongo duplicate key errors only.

---

# 7. Service Layer

File: `src/services/product.service.ts`

## 7.1 Responsibilities

1. Enforce **domain invariants** before persistence.
2. Normalize listing inputs (sort whitelist, page bounds).
3. Translate “not found” into domain errors.
4. Delegate all Mongo access to `ProductRepository`.

## 7.2 Business rules

### Create — `createProduct(data)`

```
IF data.sku provided AND exists(sku) → Error "Product with this SKU already exists."
IF data.slug provided AND exists(slug) → Error "Product with this slug already exists."
ELSE repository.create(data)
```

**Why check before insert:** Provides clear API errors instead of opaque E11000 duplicate key messages. Mongo unique indexes remain the final safety net.

### Read — `getProductById` / `BySku` / `BySlug`

```
product = repository.find...
IF null → Error "Product not found."
ELSE return product
```

### Update — `updateProduct(id, data)`

```
existing = findById(id) OR throw not found
IF changing sku to a value owned by another product → throw duplicate SKU
IF changing slug similarly → throw duplicate slug
updated = updateById OR throw not found
```

### Delete — `deleteProduct(id)`

```
assert exists
repository.deleteById
```

### Listing — `listProducts(rawQuery)`

Business rules:

| Rule | Default / limit |
|------|-----------------|
| `sort` missing | `newest` |
| `sort` invalid | throw with allowed list |
| `page` < 1 / NaN | `1` |
| `limit` < 1 / NaN | `10` |
| `limit` max | `100` |
| `minimumPrice` > `maximumPrice` | throw |
| invalid `status` / `stockStatus` | throw |

## 7.3 Flow diagram — Create Product

```
[Controller payload]
        │
        ▼
[Service.createProduct]
        │
        ├─► exists({ sku }) ──yes──► throw Duplicate SKU
        │
        ├─► exists({ slug }) ─yes──► throw Duplicate Slug
        │
        └─► repository.create ─────► MongoDB insert
```

## 7.4 Flow diagram — List Products

```
[Raw query strings/numbers]
        │
        ▼
[normalizeListQuery] ── defaults, whitelist, bounds
        │
        ▼
[repository.findByListing]
        │
        ├─► buildListingFilter ($or search, price range, tags $in, ...)
        ├─► buildListingSort
        └─► Promise.all(find, countDocuments)
        │
        ▼
[Build pagination meta] → ProductListResult
```

## 7.5 What Service must never do

- Read `req` / `res`
- Set HTTP status codes
- Call Cloudinary SDK
- Import `express-validator`

---

# 8. Controller Layer

File: `src/controllers/product.controller.ts`

## 8.1 Responsibilities

| Does | Does not |
|------|----------|
| Parse params / query / body | Decide if SKU is unique |
| Map Multer files → Cloudinary URL strings | Talk to Mongoose |
| Build `ApiResponse` | Implement pagination math (delegates) |
| `next(error)` on failure | Catch-and-swallow |

## 8.2 Image URL mapping

After `uploadProductImages`:

- `files.thumbnail[0].path` → `payload.thumbnail`
- `files.images[].path` → `payload.images`

Only URL strings reach the service—**never** Multer file buffers.

## 8.3 Sequence diagram — PUT update with images

```
Client                Route                 Multer/Cloudinary      Controller         Service
  │                     │                         │                   │                 │
  │── multipart PUT ───►│                         │                   │                 │
  │                     │── authenticate/RBAC ───►│                   │                 │
  │                     │── upload fields ───────►│                   │                 │
  │                     │◄──── files + URLs ──────│                   │                 │
  │                     │── validators ───────────┼──────────────────►│                 │
  │                     │── updateProduct() ──────┼──────────────────►│                 │
  │                     │                         │                   │── list rules ──►│
  │                     │                         │                   │◄── product ─────│
  │◄──── 200 ApiResponse ─────────────────────────┼───────────────────│                 │
```

## 8.4 Error forwarding

```typescript
try {
  // ...
} catch (error: unknown) {
  next(error);
}
```

**Why:** Keeps controllers free of status-mapping sprawl; a future global error middleware can translate domain messages → HTTP codes consistently.

---

# 9. Validation Layer

File: `src/validators/product.validator.ts`  
Library: **express-validator**

## 9.1 Principles

- Validate **request shape**, not database state.
- Do **not** validate binary uploads here (Multer/Cloudinary handle that).
- Update validators: all body fields `.optional()`.

## 9.2 Exported chains

| Export | Used by |
|--------|---------|
| `createProductValidator` | `POST /` |
| `updateProductValidator` | `PUT /:id` |
| `getProductByIdValidator` | `GET /:id` |
| `getProductBySkuValidator` | `GET /sku/:sku` |
| `getProductBySlugValidator` | `GET /slug/:slug` |
| `deleteProductValidator` | `DELETE /:id` |

## 9.3 Create Product validation table

| Field | Rules |
|-------|-------|
| `name` | required, string, trim, length 3–200 |
| `slug` | required, string, trim, toLowerCase, length 3–250 |
| `sku` | required, string, trim, length 3–100 |
| `price` | required, float ≥ 0 |
| `comparePrice` | optional, float ≥ 0 |
| `costPrice` | optional, float ≥ 0 |
| `quantity` | required, int ≥ 0 |
| `category` | required, MongoId |
| `brand` | optional, MongoId |
| `thumbnail` | optional, string |
| `images` | optional, array |
| `tags` | optional, array |
| `status` | optional, enum ProductStatus |
| `stockStatus` | optional, enum StockStatus |
| `seoTitle` | optional, max 70 |
| `seoDescription` | optional, max 160 |

## 9.4 Update Product

- `param("id")` must be MongoId.
- Same body rules as create, but all optional (apply only when present).

## 9.5 Param validators

| Route | Rule |
|-------|------|
| `:id` | Mongo ObjectId |
| `:sku` | non-empty string |
| `:slug` | non-empty **lowercase** string |

## 9.4 Note on validation result middleware

Chains attach errors to the request. Ensure a `validationResult` middleware (global or per-route) converts failures to HTTP 400 using the enterprise `ApiResponse` shape before hitting the controller in production hardening. Domain uniqueness remains a service concern.

---

# 10. Routes

File: `src/routes/product.routes.ts`  
Mount: **`/api/v1/products`**

## 10.1 Route registration order

Static paths **`/sku/:sku`** and **`/slug/:slug`** are registered **before** `/:id` so that `sku` is not captured as an id.

## 10.2 API summary

| Method | Path | Auth | Roles | Upload | Validator | Handler |
|--------|------|------|-------|--------|-----------|---------|
| POST | `/` | Yes | ADMIN, SUPER_ADMIN | Yes | create | createProduct |
| GET | `/` | Yes | ADMIN, SUPER_ADMIN | No | — | getProducts (listing) |
| GET | `/sku/:sku` | Yes | ADMIN, SUPER_ADMIN | No | sku | getProductBySku |
| GET | `/slug/:slug` | Yes | ADMIN, SUPER_ADMIN | No | slug | getProductBySlug |
| GET | `/:id` | Yes | ADMIN, SUPER_ADMIN | No | id | getProductById |
| PUT | `/:id` | Yes | ADMIN, SUPER_ADMIN | Yes | update | updateProduct |
| DELETE | `/:id` | Yes | SUPER_ADMIN | No | id | deleteProduct |

## 10.3 POST `/api/v1/products`

**Purpose:** Create catalog item (optional images).

**Headers**

```
Authorization: Bearer <accessToken>
Content-Type: multipart/form-data
```

**Body (form fields)** — see validation table; plus files `thumbnail`, `images`.

**Success:** `201`

```json
{
  "success": true,
  "message": "Product created successfully.",
  "data": { "_id": "...", "sku": "SKU-001", "slug": "wireless-mouse", "...": "..." }
}
```

**Common failures**

| Case | Typical outcome |
|------|-----------------|
| Missing/invalid token | 401 |
| Role not ADMIN/SUPER_ADMIN | 403 |
| Validation failure | 400 (with validation middleware) |
| Duplicate SKU/slug | Domain error via `next` |

## 10.4 GET `/api/v1/products`

**Purpose:** Enterprise listing (search/filter/sort/page).

**Query parameters** — see [Section 12](#12-product-listing).

**Success:** `200` with `data` + `pagination`.

## 10.5 GET `/api/v1/products/:id`

**Success:** `200` single product.  
**Not found:** domain `"Product not found."`

## 10.6 GET `/api/v1/products/sku/:sku`

Lookup by business key SKU.

## 10.7 GET `/api/v1/products/slug/:slug`

Lookup by SEO slug (must be lowercase).

## 10.8 PUT `/api/v1/products/:id`

Partial update + optional replacement uploads for thumbnail/images when files provided.

## 10.9 DELETE `/api/v1/products/:id`

**Authorization:** `SUPER_ADMIN` only.  
Hard deletes the Mongo document (Cloudinary assets are not deleted in Step 8.9).

---

# 11. Image Upload

## 11.1 Stack

| Package | Role |
|---------|------|
| `multer` | multipart parsing + limits + fileFilter |
| `cloudinary` | cloud media platform SDK |
| `multer-storage-cloudinary` | streams file to Cloudinary; sets `file.path` to URL |

Config: `src/config/cloudinary.ts` (env only):

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

## 11.2 Middleware

`uploadProductImages` fields:

| Field | Max count |
|-------|-----------|
| `thumbnail` | 1 |
| `images` | 10 |

**Allowed MIME:** `image/jpeg`, `image/jpg`, `image/png`, `image/webp`  
**Max size:** 5 MB per file  
**Folder:** `enterprise-ecommerce/products`

## 11.3 Upload flow

```
multipart request
    → authenticate / authorize
    → multer fileFilter (reject bad MIME)
    → size limit check
    → CloudinaryStorage upload
    → req.files populated with path=secure URL
    → express-validator (scalar fields)
    → controller maps path → thumbnail/images strings
    → service/repository store URLs only
```

## 11.4 Security considerations

1. **No credentials in source** — env vars only.
2. **MIME allow-list** — blocks executables disguised as images at filter layer (still verify content in future hardening).
3. **Size cap** — reduces DoS via large uploads.
4. **Auth before upload** — unauthenticated users cannot burn Cloudinary quota.
5. **Mongo stores URLs only** — reduces BSON bloat and XSS surface from binary.

## 11.5 Explicitly not implemented

- Deleting old Cloudinary public_ids on replace
- Image transforms / cropping / watermark
- Async background processing queues

---

# 12. Product Listing

## 12.1 Endpoint

`GET /api/v1/products`

## 12.2 Query parameters

### Search

| Param | Description |
|-------|-------------|
| `search` | Case-insensitive match across name, sku, slug, shortDescription, description, tags |

### Filters

| Param | Type | Notes |
|-------|------|-------|
| `category` | ObjectId string | Exact |
| `brand` | ObjectId string | Exact |
| `status` | enum | ProductStatus |
| `stockStatus` | enum | StockStatus |
| `isFeatured` | `true`/`false` | Boolean |
| `isDigital` | `true`/`false` | Boolean |
| `minimumPrice` | number | `price >=` |
| `maximumPrice` | number | `price <=` |
| `tags` | csv or repeated | `$in` match |

### Sorting

| `sort` value | Mongo sort |
|--------------|------------|
| `newest` (default) | `{ createdAt: -1 }` |
| `oldest` | `{ createdAt: 1 }` |
| `priceAsc` | `{ price: 1 }` |
| `priceDesc` | `{ price: -1 }` |
| `nameAsc` | `{ name: 1 }` |
| `nameDesc` | `{ name: -1 }` |

### Pagination

| Param | Default | Max |
|-------|---------|-----|
| `page` | 1 | — |
| `limit` | 10 | 100 |

## 12.3 Example request

```http
GET /api/v1/products?search=mouse&status=ACTIVE&minimumPrice=199&maximumPrice=999&sort=priceAsc&page=1&limit=20&tags=wireless,office
Authorization: Bearer <token>
```

## 12.4 Example response

```json
{
  "success": true,
  "message": "Products fetched successfully.",
  "data": [
    {
      "_id": "66f0...",
      "name": "Wireless Mouse",
      "sku": "MOUSE-001",
      "price": 499,
      "status": "ACTIVE"
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "limit": 20,
    "totalPages": 1,
    "hasNext": false,
    "hasPrevious": false
  }
}
```

## 12.5 MongoDB query building (repository)

Pseudo-structure:

```javascript
filter = {}
if category → ObjectId
if brand → ObjectId
if status / stockStatus / flags → equality
if min/max price → price: { $gte, $lte }
if tags → tags: { $in: [...] }
if search → $or: [
  { name: /escaped/i },
  { sku: /escaped/i },
  { slug: /escaped/i },
  { shortDescription: /escaped/i },
  { description: /escaped/i },
  { tags: /escaped/i }
]

find(filter).sort(...).skip((page-1)*limit).limit(limit).lean()
countDocuments(filter)
```

Search input is **regex-escaped** to prevent ReDoS / injection-like patterns.

**Not used:** aggregation pipelines, `$text` score ranking, faceted `$facet` queries (deferred).

---

# 13. Authentication

## 13.1 Mechanism

All Product routes use `authenticate` from `auth.middleware.ts`.

1. Require `Authorization: Bearer <accessToken>`
2. Verify JWT with `JWT_ACCESS_SECRET` via `JwtService`
3. Load user by `decoded.id`
4. Attach `req.user`

## 13.2 Why JWT on catalog admin APIs

Catalog mutation is high-impact (pricing, visibility). Session cookies alone are insufficient for mobile admin / multi-service calls; Bearer access tokens fit the existing auth module (OTP login → access + refresh).

## 13.3 Failure modes

| Condition | Response |
|-----------|----------|
| Missing header | 401 Authentication token missing |
| Bad/expired token | 401 Invalid or expired token |
| User deleted | 401 User not found |

Unauthenticated callers never reach RBAC, validators, or Cloudinary.

---

# 14. RBAC

## 14.1 Enterprise roles (platform)

Defined in `src/constants/roles.ts`:

| Role | Typical platform meaning |
|------|--------------------------|
| `SUPER_ADMIN` | Full platform control |
| `ADMIN` | Operational administration |
| `VENDOR` | Seller (future catalog ownership) |
| `CUSTOMER` | Buyer |
| `DELIVERY_BOY` | Logistics |

Middleware: `authorize(...allowedRoles)` in `role.middleware.ts`  
Uses `isRole(req.user.role)` then membership check → **403 Access denied**.

## 14.2 Product module permission matrix (implemented)

| Action | SUPER_ADMIN | ADMIN | VENDOR | CUSTOMER | DELIVERY_BOY |
|--------|:-----------:|:-----:|:------:|:--------:|:------------:|
| List / Get products | ✅ | ✅ | ❌ | ❌ | ❌ |
| Create product | ✅ | ✅ | ❌ | ❌ | ❌ |
| Update product | ✅ | ✅ | ❌ | ❌ | ❌ |
| Delete product | ✅ | ❌ | ❌ | ❌ | ❌ |
| Upload images (on create/update) | ✅ | ✅ | ❌ | ❌ | ❌ |

## 14.3 Planned roles (documentation roadmap)

Some product roadmaps mention **Manager** and **Inventory Manager**. These are **not** present in `ROLES` today. When introduced:

1. Add constants to `roles.ts`
2. Extend User model enum
3. Grant GET (and optionally stock PATCH) to inventory roles
4. Keep DELETE restricted to `SUPER_ADMIN`

Until then, GET listing is limited to **ADMIN** and **SUPER_ADMIN** to match the type-safe role middleware.

## 14.4 Why DELETE is Super Admin only

Hard delete is irreversible and breaks historical order line references if orders store product ids. Restricting delete reduces accidental data loss; prefer `ARCHIVED` status for day-to-day retirement.

---

# 15. Error Handling

## 15.1 Layers of failure

```
Validation (shape)     → express-validator
Upload (binary)        → Multer / Cloudinary errors
AuthN / AuthZ          → middleware 401/403 JSON
Business rules         → Error messages thrown in Service
Persistence            → Mongoose validation / E11000
```

## 15.2 Validation errors

Invalid types, missing required create fields, bad ObjectIds in params/body.

## 15.3 Business errors (service)

| Message | Typical cause |
|---------|---------------|
| `Product with this SKU already exists.` | Duplicate create/update SKU |
| `Product with this slug already exists.` | Duplicate create/update slug |
| `Product not found.` | Bad id/sku/slug or race delete |
| `Invalid sort option...` | Listing sort typo |
| `minimumPrice cannot be greater than maximumPrice.` | Bad range |
| `Invalid status...` / `Invalid stockStatus...` | Enum misuse |

## 15.4 MongoDB errors

| Code / type | Meaning |
|-------------|---------|
| `ValidationError` | Schema path failed (e.g., negative price) |
| `E11000` duplicate key | Unique index hit if service check raced |
| `CastError` | Invalid ObjectId passed into query |

## 15.5 Cloudinary / Multer errors

| Case | Example message |
|------|-----------------|
| Unsupported MIME | `Unsupported file format. Allowed formats: jpg, jpeg, png, webp.` |
| File too large | Multer `LIMIT_FILE_SIZE` |
| Missing Cloudinary env | SDK/upload failure at runtime |
| Too many files | Multer field count limits |

Controllers forward unexpected errors with `next(error)`. Introduce a centralized error middleware for consistent status mapping as a hardening step.

---

# 16. API Response Format

## 16.1 Standard success

```typescript
interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}
```

Example:

```json
{
  "success": true,
  "message": "Product fetched successfully.",
  "data": { "_id": "...", "name": "..." }
}
```

## 16.2 Listing success (extended)

```json
{
  "success": true,
  "message": "Products fetched successfully.",
  "data": [ /* IProduct[] */ ],
  "pagination": {
    "total": 42,
    "page": 2,
    "limit": 10,
    "totalPages": 5,
    "hasNext": true,
    "hasPrevious": true
  }
}
```

## 16.3 Error response (enterprise target shape)

```json
{
  "success": false,
  "message": "Product not found."
}
```

Auth middleware already returns this shape for 401/403.

---

# 17. Complete Request Flow

Example: **Authenticated ADMIN creates a product with thumbnail**

```
1. Client
   POST /api/v1/products
   Authorization: Bearer <access>
   multipart: fields + thumbnail file

2. Route (product.routes.ts)
   Matches POST /
   Pipeline begins

3. Authentication (auth.middleware.ts)
   Verify JWT → load User → req.user
   Fail → 401 stop

4. RBAC (role.middleware.ts)
   authorize(ADMIN, SUPER_ADMIN)
   Fail → 403 stop

5. Upload (upload.middleware.ts)
   Validate MIME/size → upload Cloudinary → req.files
   Fail → error to next()

6. Validation (createProductValidator)
   Validate name/slug/sku/price/category/...
   Fail → 400 (with result middleware)

7. Controller (createProduct)
   Merge body + Cloudinary URLs
   Call productService.createProduct(payload)

8. Service
   Duplicate SKU/slug checks
   repository.create

9. Repository
   Product.create → MongoDB products collection

10. Response
    201 + ApiResponse<data: product>
```

ASCII end-to-end:

```
Client → Route → AuthN → AuthZ → Upload → Validate → Controller → Service → Repository → MongoDB
                                                                      ↘ Cloudinary (URLs only)
```

---

# 18. Best Practices

## 18.1 SOLID & Clean Architecture

Keep each layer replaceable. Prefer new methods (`findByListing`) over overloading `findAll` with hidden magic when behavior diverges.

## 18.2 Dependency Injection

Wire at composition roots (`product.routes.ts` / `container`). Avoid service locators inside deep functions.

## 18.3 Repository Pattern

All Product Mongo queries for this module go through `ProductRepository`—including existence checks used by business rules.

## 18.4 Scalability

- Indexes aligned to filters/sorts
- `lean()` on reads
- Pagination cap (`limit ≤ 100`)
- Store CDN URLs, not binaries
- Avoid populate-by-default on list endpoints

## 18.5 Performance

- Parallel `find` + `countDocuments` in listing
- Prefer equality/range filters that hit indexes
- Regex search is acceptable early-stage; plan Elastic for large catalogs

## 18.6 Security

- JWT on every Product route
- Least privilege (DELETE = SUPER_ADMIN)
- Env-based secrets
- Upload allow-list + size limits
- Escape regex user input
- Never return `costPrice` on future public APIs

## 18.7 API design

- Stable SKU/slug identifiers
- Consistent `ApiResponse`
- Explicit enums over magic booleans where lifecycle needs states

---

# 19. Testing

## 19.1 Prerequisites

1. Server running with MongoDB connected
2. `.env` includes JWT + Cloudinary variables
3. User with role `ADMIN` or `SUPER_ADMIN` and a valid access token (via OTP auth flow)
4. Existing Category `_id` (and optional Brand `_id`)

## 19.2 Postman — Create product (multipart)

```
POST {{baseUrl}}/api/v1/products
Authorization: Bearer {{accessToken}}
Body: form-data
  name: Wireless Mouse
  slug: wireless-mouse
  sku: MOUSE-001
  price: 499
  quantity: 50
  category: {{categoryId}}
  status: ACTIVE
  stockStatus: IN_STOCK
  thumbnail: <file>
  images: <file>
  images: <file>
```

**Expected:** `201` with `data.thumbnail` HTTPS URL.

## 19.3 Postman — List with filters

```
GET {{baseUrl}}/api/v1/products?search=mouse&status=ACTIVE&sort=priceAsc&page=1&limit=10
Authorization: Bearer {{accessToken}}
```

**Expected:** `200` with `pagination` object.

## 19.4 Postman — Get by SKU

```
GET {{baseUrl}}/api/v1/products/sku/MOUSE-001
Authorization: Bearer {{accessToken}}
```

## 19.5 Postman — Update

```
PUT {{baseUrl}}/api/v1/products/{{productId}}
Authorization: Bearer {{accessToken}}
Body: form-data
  price: 449
  quantity: 40
```

## 19.6 Postman — Delete (Super Admin)

```
DELETE {{baseUrl}}/api/v1/products/{{productId}}
Authorization: Bearer {{superAdminToken}}
```

## 19.7 Common test errors

| Symptom | Likely cause |
|---------|--------------|
| 401 | Missing/expired access token |
| 403 on DELETE | Token user is ADMIN not SUPER_ADMIN |
| 403 on GET | User role not ADMIN/SUPER_ADMIN |
| Duplicate SKU error | Reused sku |
| CastError / invalid id | Non-ObjectId `:id` |
| Unsupported file format | gif/bmp/pdf uploaded |
| File too large | > 5 MB |
| Category required | Missing category ObjectId |

## 19.8 Suggested automated tests (future)

- Service unit tests with mock repository (duplicate SKU)
- Repository integration tests against MongoMemoryServer
- Route tests for RBAC matrix
- Upload middleware MIME rejection tests

---

# 20. Future Enhancements

| Enhancement | Value | Suggested approach |
|-------------|-------|--------------------|
| **Elasticsearch** | Sub-second search at catalog scale | Index products async; keep Mongo as source of truth |
| **Redis** | Cache hot listing pages / product PDP | Cache-aside with TTL; invalidate on update/delete |
| **Caching headers** | CDN-friendly public catalog later | ETag / Cache-Control on public GETs |
| **Bulk upload** | Vendor onboarding | CSV job + queue; reuse Service rules |
| **Product variants** | Size/color SKUs | `Variant` collection refs parent product |
| **Inventory sync** | ERP / WMS | Event-driven stockStatus updates |
| **Audit logs** | Compliance | Append-only audit collection on mutations |
| **API versioning** | Safe breaking changes | `/api/v2/products` while v1 remains |
| **Soft delete** | Recoverability | `deletedAt` + default query exclusion |
| **Cloudinary cleanup** | Cost control | Delete previous public_id on replace |
| **Manager / Inventory roles** | Fine-grained ops access | Extend `ROLES` + permission matrix |
| **Global error middleware** | Consistent HTTP mapping | Central mapper for domain errors |
| **validationResult middleware** | Enforce 400 on invalid chains | Shared validateRequest helper |

---

# Appendix

## A. Folder structure (Product-focused)

```
server/src/
  config/cloudinary.ts
  constants/roles.ts
  controllers/product.controller.ts
  interfaces/product.interface.ts
  interfaces/product-listing.interface.ts
  interfaces/category.interface.ts
  interfaces/brand.interface.ts
  middleware/auth.middleware.ts
  middleware/role.middleware.ts
  middleware/upload.middleware.ts
  models/product.model.ts
  models/category.model.ts
  models/brand.model.ts
  repositories/product.repository.ts
  routes/product.routes.ts
  services/product.service.ts
  validators/product.validator.ts
```

## B. API summary table

| Method | Full path | Roles |
|--------|-----------|-------|
| POST | `/api/v1/products` | ADMIN, SUPER_ADMIN |
| GET | `/api/v1/products` | ADMIN, SUPER_ADMIN |
| GET | `/api/v1/products/:id` | ADMIN, SUPER_ADMIN |
| GET | `/api/v1/products/sku/:sku` | ADMIN, SUPER_ADMIN |
| GET | `/api/v1/products/slug/:slug` | ADMIN, SUPER_ADMIN |
| PUT | `/api/v1/products/:id` | ADMIN, SUPER_ADMIN |
| DELETE | `/api/v1/products/:id` | SUPER_ADMIN |

## C. Database schema (collections)

| Collection | Key fields |
|------------|------------|
| `products` | sku↑, slug↑, category, brand?, price, status, stockStatus, images[], thumbnail?, tags[], createdBy, timestamps |
| `categories` | slug↑, parent?, level, isActive, sortOrder, createdBy |
| `brands` | slug↑, logo?, website?, isActive, sortOrder, createdBy |

↑ = unique index

## D. Environment variables

```
MONGODB_URI=
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

## E. Glossary

| Term | Definition |
|------|------------|
| **SKU** | Stock Keeping Unit — unique operational product code |
| **Slug** | URL-safe unique string for SEO routes |
| **lean()** | Mongoose mode returning plain objects (faster reads) |
| **RBAC** | Role-Based Access Control |
| **Repository** | Persistence abstraction over the data store |
| **Service** | Application/business use-case layer |
| **ApiResponse** | Standard `{ success, message, data? }` envelope |
| **Cloudinary** | Hosted media CDN/storage used for product images |
| **Listing** | Search + filter + sort + paginated product query API |

## F. Related modules

| Module | Relationship |
|--------|--------------|
| Auth / Session / JWT | Issues tokens consumed by Product routes |
| RBAC middleware | Gates Product mutations and reads |
| Category / Brand | Referenced by Product documents |
| Future Cart / Order | Will reference Product `_id` / SKU snapshots |

---

# 21. Deep Dive — Layer Contracts & Code Walkthroughs

This section expands Step 8 for onboarding engineers who need implementation-level clarity.

## 21.1 Interface contract (annotated)

```typescript
export enum ProductStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  DRAFT = "DRAFT",
  ARCHIVED = "ARCHIVED",
}

export enum StockStatus {
  IN_STOCK = "IN_STOCK",
  OUT_OF_STOCK = "OUT_OF_STOCK",
  LOW_STOCK = "LOW_STOCK",
  PREORDER = "PREORDER",
}

export interface IProduct extends Document {
  name: string;                 // merchandising title
  slug: string;                 // SEO / public key
  sku: string;                  // warehouse key
  shortDescription: string;
  description: string;
  price: number;                // customer price
  comparePrice?: number;        // display-only "was" price
  costPrice?: number;           // internal COGS
  currency: string;             // default INR
  quantity: number;
  lowStockThreshold: number;
  category: Types.ObjectId;     // required FK
  brand?: Types.ObjectId;       // optional FK
  images: string[];             // Cloudinary URLs
  thumbnail?: string;           // Cloudinary URL
  tags: string[];
  status: ProductStatus;
  stockStatus: StockStatus;
  isFeatured: boolean;
  isDigital: boolean;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords: string[];
  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
```

### Design decision: two status dimensions

Publishability (`ProductStatus`) and fulfillability (`StockStatus`) are orthogonal:

| Scenario | status | stockStatus |
|----------|--------|-------------|
| Draft with stock in warehouse | DRAFT | IN_STOCK |
| Live but waiting shipment | ACTIVE | PREORDER |
| Seasonal pause | INACTIVE | IN_STOCK |
| Permanently retired | ARCHIVED | OUT_OF_STOCK |

Encoding both as one enum would force awkward compound values and break reporting.

## 21.2 Schema excerpt — unique identity fields

```typescript
sku: {
  type: String,
  required: [true, "Product SKU is required."],
  trim: true,
  uppercase: true,
  unique: true,
  maxlength: [64, "Product SKU cannot exceed 64 characters."],
},

slug: {
  type: String,
  required: [true, "Product slug is required."],
  trim: true,
  lowercase: true,
  unique: true,
  maxlength: [220, "Product slug cannot exceed 220 characters."],
},
```

**Why uppercase SKU + lowercase slug?**  
Operational systems often case-fold SKUs; SEO slugs are conventionally lowercase. Normalization at the schema reduces duplicate near-misses (`Abc` vs `abc`).

## 21.3 Repository listing filter builder (conceptual)

```typescript
private buildListingFilter(query: ProductListQuery): QueryFilter<IProduct> {
  const filter: QueryFilter<IProduct> = {};

  if (query.category) filter.category = new Types.ObjectId(query.category);
  if (query.brand) filter.brand = new Types.ObjectId(query.brand);
  if (query.status) filter.status = query.status;
  if (query.stockStatus) filter.stockStatus = query.stockStatus;
  if (typeof query.isFeatured === "boolean") filter.isFeatured = query.isFeatured;
  if (typeof query.isDigital === "boolean") filter.isDigital = query.isDigital;

  if (query.minimumPrice != null || query.maximumPrice != null) {
    filter.price = {
      ...(query.minimumPrice != null ? { $gte: query.minimumPrice } : {}),
      ...(query.maximumPrice != null ? { $lte: query.maximumPrice } : {}),
    };
  }

  if (query.tags?.length) filter.tags = { $in: query.tags };

  if (query.search?.trim()) {
    const re = new RegExp(this.escapeRegex(query.search.trim()), "i");
    filter.$or = [
      { name: re }, { sku: re }, { slug: re },
      { shortDescription: re }, { description: re }, { tags: re },
    ];
  }

  return filter;
}
```

### Why not `$text` search yet?

`$text` requires different query shape, language options, and ranking semantics. Regex `$or` is explicit, easy to reason about, and sufficient for admin tooling. The text index remains for a later migration without schema redesign.

## 21.4 Service uniqueness algorithm

```
createProduct(data):
  if data.sku and repository.exists({ sku: data.sku }):
      throw "Product with this SKU already exists."
  if data.slug and repository.exists({ slug: data.slug }):
      throw "Product with this slug already exists."
  return repository.create(data)

updateProduct(id, data):
  existing = repository.findById(id) or throw not found
  if data.sku and data.sku != existing.sku:
      if repository.exists({ sku: data.sku }): throw duplicate SKU
  if data.slug and data.slug != existing.slug:
      if repository.exists({ slug: data.slug }): throw duplicate slug
  return repository.updateById(id, data) or throw not found
```

### Race conditions

Two concurrent creates with the same SKU can both pass `exists` checks. MongoDB unique indexes still reject the second write (`E11000`). Treat service checks as **UX**, unique indexes as **correctness**.

## 21.5 Controller payload assembly

```typescript
private buildProductPayload(req: Request): Partial<IProduct> {
  const payload: Partial<IProduct> = { ...(req.body as Partial<IProduct>) };
  const files = this.getUploadedFiles(req);

  if (files.thumbnail?.[0]) {
    payload.thumbnail = files.thumbnail[0].path; // Cloudinary URL
  }
  if (files.images?.length) {
    payload.images = files.images.map((f) => f.path);
  }
  return payload;
}
```

**Important:** On `PUT`, if no new files are sent, existing `thumbnail`/`images` remain unchanged (unless the client also sends URL fields in the body).

---

# 22. Operational Runbook

## 22.1 Local startup checklist

1. Install dependencies (`npm install` in `server/`).
2. Configure `.env`:
   - `MONGODB_URI`
   - `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET`
   - `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET`
   - `SMS_PROVIDER=mock` (for OTP login during admin testing)
3. Ensure indexes are built (Mongoose syncs on boot; for existing DBs, verify with Compass).
4. `npm run dev`
5. Obtain token via auth OTP flow; set user `role` to `ADMIN` or `SUPER_ADMIN` in Mongo if needed.

## 22.2 Creating the first Category (required for products)

Products require `category`. Until Category CRUD APIs exist, insert via Mongo shell/Compass:

```javascript
db.categories.insertOne({
  name: "Electronics",
  slug: "electronics",
  description: "Root electronics",
  parent: null,
  level: 0,
  isActive: true,
  sortOrder: 1,
  createdBy: ObjectId("<adminUserId>"),
  createdAt: new Date(),
  updatedAt: new Date()
})
```

## 22.3 Promoting a user to SUPER_ADMIN

```javascript
db.users.updateOne(
  { mobile: "9999999999" },
  { $set: { role: "SUPER_ADMIN" } }
)
```

> Note: JWT payloads embed `role` at login time. Re-login after role changes.

## 22.4 Index verification

```javascript
db.products.getIndexes()
```

Expect unique indexes on `sku` and `slug`, plus listing indexes (`category`, `status`, `price`, etc.).

## 22.5 Cloudinary troubleshooting

| Symptom | Check |
|---------|-------|
| Upload hangs / fails | Env vars loaded? (`dotenv` before app start) |
| 401 from Cloudinary | API key/secret mismatch |
| Files rejected | MIME not in allow-list |
| `LIMIT_FILE_SIZE` | File > 5 MB |

---

# 23. Security Model (Product Module)

## 23.1 Trust boundaries

```
[Untrusted Client]
        │
        ▼
[TLS termination / API gateway]   ← network trust
        │
        ▼
[Express AuthN]                   ← identity trust
        │
        ▼
[RBAC AuthZ]                      ← permission trust
        │
        ▼
[Validators + Upload filters]     ← input trust
        │
        ▼
[Service invariants]              ← domain trust
        │
        ▼
[MongoDB / Cloudinary]            ← data stores
```

## 23.2 Threat → mitigation map

| Threat | Mitigation in Step 8 |
|--------|----------------------|
| Anonymous catalog mutation | JWT required on all routes |
| Privilege escalation | `authorize` role checks; DELETE Super Admin only |
| Oversized upload DoS | 5 MB limit + max 10 gallery images |
| Malicious file types | MIME allow-list |
| NoSQL operator injection via search | Regex escape; typed filters |
| Secret leakage | Cloudinary/JWT secrets in env |
| Mass assignment of role via product body | Role not part of product payload |
| Enum smuggling | Schema enum + service whitelist for listing |

## 23.3 Data classification

| Field | Classification | Notes |
|-------|----------------|-------|
| `costPrice` | Confidential | Internal margin; do not expose publicly later |
| `createdBy` | Internal | Audit |
| `sku` | Internal / partner | Share with warehouse systems |
| `price` | Business | Customer-visible when published |
| `images` URLs | Public CDN | Still require auth to *change* |

---

# 24. Data Dictionary (Expanded)

## 24.1 `products` collection

| Field | BSON type | Indexed | Unique | Default | Notes |
|-------|-----------|---------|--------|---------|-------|
| `_id` | ObjectId | PK | Yes | auto | |
| `name` | String | Yes (sort) | No | — | trim |
| `slug` | String | Yes | Yes | — | lowercase |
| `sku` | String | Yes | Yes | — | uppercase |
| `shortDescription` | String | Text | No | `""` | |
| `description` | String | Text | No | `""` | |
| `price` | Number | Yes | No | — | ≥ 0 |
| `comparePrice` | Number | No | No | — | optional |
| `costPrice` | Number | No | No | — | optional |
| `currency` | String | No | No | `INR` | |
| `quantity` | Number | No | No | `0` | ≥ 0 |
| `lowStockThreshold` | Number | No | No | `5` | |
| `category` | ObjectId | Yes | No | — | ref Category |
| `brand` | ObjectId | Yes | No | — | ref Brand |
| `images` | String[] | No | No | `[]` | URLs |
| `thumbnail` | String | No | No | — | URL |
| `tags` | String[] | Yes | No | `[]` | |
| `status` | String | Yes | No | `DRAFT` | enum |
| `stockStatus` | String | Yes | No | `OUT_OF_STOCK` | enum |
| `isFeatured` | Bool | Yes | No | `false` | |
| `isDigital` | Bool | Yes | No | `false` | |
| `weight` | Number | No | No | — | |
| `length` | Number | No | No | — | |
| `width` | Number | No | No | — | |
| `height` | Number | No | No | — | |
| `seoTitle` | String | Text | No | — | ≤ 70 |
| `seoDescription` | String | Text | No | — | ≤ 160 |
| `seoKeywords` | String[] | No | No | `[]` | |
| `createdBy` | ObjectId | No | No | — | ref User |
| `updatedBy` | ObjectId | No | No | — | ref User |
| `createdAt` | Date | Yes | No | auto | |
| `updatedAt` | Date | No | No | auto | |

## 24.2 `categories` collection

| Field | Notes |
|-------|-------|
| `name` | Display name |
| `slug` | Unique |
| `parent` | Self-reference; null/absent for root |
| `level` | Depth hint (0 = root) |
| `isActive` | Soft hide without delete |
| `sortOrder` | Manual navigation order |

## 24.3 `brands` collection

| Field | Notes |
|-------|-------|
| `name` / `slug` | Identity |
| `logo` / `website` | Merchandising |
| `isActive` / `sortOrder` | Ops controls |

---

# 25. End-to-End Scenarios

## 25.1 Scenario A — New SKU onboarding

1. Admin authenticates (OTP → JWT).
2. Ensures Category exists.
3. `POST /products` with pricing + stock + thumbnail.
4. Verifies `GET /products/sku/{sku}`.
5. Sets `status=ACTIVE` via `PUT` when ready to sell.
6. Confirms listing: `GET /products?status=ACTIVE&search={name}`.

## 25.2 Scenario B — Price correction

1. `GET /products/sku/MOUSE-001`
2. `PUT /products/{id}` with `price=449`
3. Listing `sort=priceAsc` reflects new order

**Business note:** Service does not version prices. Future Orders should snapshot price at checkout.

## 25.3 Scenario C — Accidental delete prevention

1. ADMIN attempts `DELETE` → **403**
2. SUPER_ADMIN deletes or prefers `status=ARCHIVED`

## 25.4 Scenario D — Duplicate slug attack

1. Create `slug=wireless-mouse`
2. Second create same slug → service error before insert
3. Concurrent race → Mongo E11000 as backup

## 25.5 Scenario E — Gallery refresh

1. `PUT` with new `images` files
2. Controller replaces `images` array with new Cloudinary URLs
3. Old Cloudinary assets remain until cleanup job exists (known gap)

---

# 26. HTTP Status Code Recommendations

Current controllers return `201`/`200` on success and forward errors via `next`. Recommended mapping for a future global handler:

| Condition | Status |
|-----------|--------|
| Created | 201 |
| OK | 200 |
| Validation failure | 400 |
| Unauthorized (auth) | 401 |
| Forbidden (RBAC) | 403 |
| Not found | 404 |
| Duplicate SKU/slug | 409 Conflict |
| Payload too large | 413 |
| Unsupported media | 415 |
| Unhandled | 500 |

---

# 27. Dependency Graph

```
product.routes.ts
 ├── authenticate ──────────────────── auth.middleware.ts
 │                                      └── jwtService (container)
 ├── authorize ──────────────────────── role.middleware.ts
 │                                      └── ROLES / isRole
 ├── uploadProductImages ────────────── upload.middleware.ts
 │                                      └── cloudinary.ts
 ├── *ProductValidator ──────────────── product.validator.ts
 │                                      └── ProductStatus / StockStatus
 └── ProductController
      └── ProductService
           └── ProductRepository
                └── product.model.ts
                     ├── refs Category (category.model.ts)
                     └── refs Brand (brand.model.ts)
```

---

# 28. Coding Conventions Observed in Step 8

1. **Enterprise file headers** — each layer documents SRP/DIP intent.
2. **No `any`** — prefer `unknown` in catches; typed query helpers.
3. **Mongoose 9 types** — `QueryFilter` (not legacy `FilterQuery` name in older docs).
4. **Default DI parameters** — `constructor(model = Product)` for ergonomics.
5. **Route-level composition root** — explicit `new Repository → Service → Controller`.
6. **Lean reads** — performance default for queries.
7. **Hard delete only** — explicit; soft delete deferred.
8. **Comments explain why** — especially upload URL mapping and listing limits.

---

# 29. Migration & Compatibility Notes

## 29.1 Breaking change on GET `/products`

Before Step 8.10, GET returned `{ data: IProduct[] }` only.  
After Step 8.10, GET returns `{ data, pagination }`.

Clients that assumed a bare array still work if they read `data`. Clients that ignored envelope shape should be updated to use `pagination`.

## 29.2 `getProducts(filter, options)` service method

Still available for internal/non-HTTP callers. HTTP listing should use `listProducts`.

## 29.3 Role model drift

User schema historically used `"user" | "admin"` in older code. Enterprise RBAC expects `SUPER_ADMIN | ADMIN | VENDOR | CUSTOMER | DELIVERY_BOY`. Align User model enum with `ROLES` before production cutover so `isRole()` authorizes correctly.

---

# 30. QA Checklist (Release Gate)

- [ ] POST create without images succeeds
- [ ] POST create with thumbnail + 2 images stores Cloudinary URLs
- [ ] POST duplicate SKU returns business error
- [ ] POST duplicate slug returns business error
- [ ] GET by id / sku / slug succeed
- [ ] GET slug rejects mixed-case when validator enforced
- [ ] GET listing search returns expected subset
- [ ] Filters combine (status + price range + tags)
- [ ] Sort options all six verified
- [ ] Pagination `hasNext` / `hasPrevious` correct at boundaries
- [ ] `limit=1000` clamped to 100
- [ ] PUT updates price without touching images
- [ ] PUT with new thumbnail updates URL
- [ ] DELETE forbidden for ADMIN
- [ ] DELETE allowed for SUPER_ADMIN
- [ ] Unauthenticated requests 401
- [ ] Customer role 403 on all product admin routes

---

# 31. Sample cURL Cookbook

### Login prerequisite

Use existing auth endpoints to obtain `accessToken`.

### Create

```bash
curl -X POST "$BASE/api/v1/products" \
  -H "Authorization: Bearer $TOKEN" \
  -F "name=Wireless Mouse" \
  -F "slug=wireless-mouse" \
  -F "sku=MOUSE-001" \
  -F "price=499" \
  -F "quantity=50" \
  -F "category=$CATEGORY_ID" \
  -F "status=ACTIVE" \
  -F "stockStatus=IN_STOCK" \
  -F "thumbnail=@./mouse.jpg"
```

### List

```bash
curl "$BASE/api/v1/products?search=mouse&sort=priceAsc&page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN"
```

### Get by slug

```bash
curl "$BASE/api/v1/products/slug/wireless-mouse" \
  -H "Authorization: Bearer $TOKEN"
```

### Update

```bash
curl -X PUT "$BASE/api/v1/products/$PRODUCT_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -F "price=449"
```

### Delete

```bash
curl -X DELETE "$BASE/api/v1/products/$PRODUCT_ID" \
  -H "Authorization: Bearer $SUPER_TOKEN"
```

---

# 32. FAQ for Developers

**Q: Why are images strings, not GridFS?**  
A: CDN offload, smaller Mongo docs, simpler horizontal scaling.

**Q: Why is listing admin-only?**  
A: Public storefront APIs will be a separate, cached, read-optimized surface later.

**Q: Can VENDOR create products today?**  
A: Not with current route RBAC. Add `ROLES.VENDOR` to POST/PUT when vendor onboarding ships, plus ownership checks (`createdBy` / vendorId).

**Q: Why both express-validator and Mongoose validators?**  
A: Fail fast at the edge (clear field errors) and defend at persistence (jobs/scripts bypass HTTP).

**Q: Does update merge gallery images?**  
A: No. If `images` files are uploaded, the array is replaced with new URLs.

**Q: Where should Category CRUD live?**  
A: Separate Category module mirroring Product layers; Product only references IDs.

---

# 33. Architecture Decision Records (ADRs)

## ADR-001: Layered module over MVC fat controllers

**Decision:** Controller/Service/Repository split.  
**Why:** Testability and clear ownership as catalog complexity grows (variants, inventory sync).  
**Status:** Accepted.

## ADR-002: Hard delete with Super Admin gate

**Decision:** `findByIdAndDelete`; no `deletedAt` yet.  
**Why:** Simpler MVP; irreversible ops restricted.  
**Status:** Accepted (soft delete planned).

## ADR-003: Cloudinary via multer-storage-cloudinary

**Decision:** Upload in middleware; persist URLs only.  
**Why:** Keeps controllers free of provider SDKs; swap storage later behind middleware.  
**Status:** Accepted.

## ADR-004: Regex listing search (not Elastic)

**Decision:** `$or` + escaped regex.  
**Why:** Faster delivery; adequate for admin catalogs.  
**Status:** Temporary; revisit at scale.

## ADR-005: Route-local DI composition

**Decision:** Instantiate repo/service/controller in `product.routes.ts`.  
**Why:** Matches current auth container style without forcing a full IoC framework.  
**Status:** Accepted; may move to central container later.

---

# 34. Performance Budget (Guidance)

| Operation | Target (p95, local) | Notes |
|-----------|---------------------|-------|
| GET by id/sku/slug | < 50 ms | Indexed unique lookups |
| GET listing (no search) | < 100 ms | Use filters + limit ≤ 20 in UI |
| GET listing (regex search) | < 300 ms | Degrades with corpus size |
| POST create (no images) | < 100 ms | |
| POST create (with images) | Network-bound | Dominated by Cloudinary upload |

Measure with real data volumes before promising SLAs.

---

# 35. Glossary (Extended)

| Term | Definition |
|------|------------|
| **Composition root** | Place where concrete dependencies are constructed |
| **Domain error** | Business rule violation expressed as thrown `Error` |
| **DTO** | Data transfer shape crossing a boundary (HTTP ↔ service) |
| **Idempotency** | Repeating a request yields same effect (not guaranteed on create) |
| **Lean document** | Plain JS object from Mongoose without change tracking |
| **Normalization** | Storing references instead of duplicated nested docs |
| **Overwrite protection** | `mongoose.models.X \|\| model()` pattern |
| **Pagination meta** | `total`, `page`, `limit`, `totalPages`, `hasNext`, `hasPrevious` |
| **RBAC** | Authorization by assigned role |
| **SKU** | Stock Keeping Unit |
| **Slug** | URL-safe unique identifier |

---

## Document control

| Item | Value |
|------|-------|
| Module | Product (Step 8) |
| Status | Implemented in codebase |
| Primary readers | Backend developers |
| Format | Markdown (Pandoc → DOCX/PDF) |
| Approx. depth | Expanded technical manual (sections 1–35 + appendix) |

```bash
# Example conversion
pandoc server/docs/PRODUCT_MODULE_STEP_8.md -o PRODUCT_MODULE_STEP_8.pdf --toc
pandoc server/docs/PRODUCT_MODULE_STEP_8.md -o PRODUCT_MODULE_STEP_8.docx --toc
```

**Tip for page count:** Use `GEOMETRY`/`fontsize` options in Pandoc or Word styles. With TOC, diagrams, and code blocks, this manual is intended to land in the **50–70 page** range when exported with standard documentation formatting (11pt body, 1" margins, TOC enabled).

---

*End of Product Module Developer Documentation (Step 8).*
