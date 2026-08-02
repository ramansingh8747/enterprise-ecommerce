# Module 22.2 — Search Query Builder Foundation

## Executive Summary

This document details the design and implementation of **Module 22.2 — Search Query Builder Foundation**. Built to convert application filter parameters (`ISearchFilters`) into plain, immutable MongoDB query filter objects, `SearchQueryBuilder` and `RegexEscapeUtil` operate as pure, deterministic, and transport-independent utilities completely decoupled from database execution engines, repositories, or ORM models.

---

## 1. Builder Architecture & Utility Structure

Location: `src/modules/search/builders/search-query.builder.ts` & `src/modules/search/utils/regex-escape.util.ts`

```
server/src/modules/search/
├── utils/
│   ├── regex-escape.util.ts         # RegexEscapeUtil (safely escapes user input characters)
│   └── filter.builder.ts            # FilterBuilder wrapper calling SearchQueryBuilder
├── builders/
│   └── search-query.builder.ts      # SearchQueryBuilder pure builder methods
└── index.ts                         # Barrel exports
```

---

## 2. Search Query Builder Methods (`SearchQueryBuilder`)

Location: `src/modules/search/builders/search-query.builder.ts`

```typescript
export class SearchQueryBuilder {
  static build(filters: ISearchFilters): Record<string, any>;
  static buildKeyword(keyword?: string): Record<string, any>;
  static buildCategory(category?: string | string[]): Record<string, any>;
  static buildBrand(brand?: string | string[]): Record<string, any>;
  static buildPriceRange(minPrice?: number, maxPrice?: number): Record<string, any>;
  static buildRating(rating?: number): Record<string, any>;
  static buildStockStatus(stockStatus?: StockStatus | string): Record<string, any>;
  static buildAvailability(availability?: boolean | string | AvailabilityStatus): Record<string, any>;
  static buildTags(tags?: string | string[]): Record<string, any>;
  static buildAttributes(attributes?: Record<string, string | string[]>): Record<string, any>;
}
```

---

## 3. Query Building Rules

1. **Keyword Search:** Uses `RegexEscapeUtil.escape(keyword)` with `$or` across `name`, `slug`, `shortDescription`, and `description` fields with `$options: 'i'`.
2. **Categories & Brands:** Supports single strings or string arrays using `$in`.
3. **Price Boundaries:** Builds `$gte` and `$lte` range queries conditionally.
4. **Minimum Rating:** Generates `{ averageRating: { $gte: rating } }`.
5. **Stock & Availability:** Maps `StockStatus` enums (`IN_STOCK`, `OUT_OF_STOCK`, `LOW_STOCK`, `BACKORDER`) to inventory stock criteria.
6. **Tags:** Generates `{ tags: { $all: tagList } }`.
7. **Dynamic Attributes:** Constructs nested `$elemMatch` queries for dynamic key-value attributes (e.g. `color`, `size`, `ram`).

---

## 4. Verification

* **TypeScript Compilation (`npx tsc --noEmit`):** ✅ Clean (0 Errors)
* **Files Delivered:**
  * `src/modules/search/utils/regex-escape.util.ts`
  * `src/modules/search/builders/search-query.builder.ts`
  * `src/modules/search/utils/filter.builder.ts`
  * `src/modules/search/index.ts`
  * `docs/SEARCH_MODULE_STEP_22_2.md`
