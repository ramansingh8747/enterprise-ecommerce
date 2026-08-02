# Module 22.1 — Search Engine Architecture & Folder Structure

## Executive Summary

This document details the enterprise-grade architecture, interfaces, type specifications, DTOs, utility skeletons, and layered folder boundaries for **Module 22.1 — Search Engine Architecture & Folder Structure**. Designed for high-scale catalog querying across millions of product records, this architecture establishes clean contracts for search filters (`ISearchFilters`), response envelopes (`ISearchResponse`), pagination metadata (`IPagination`), sorting criteria (`SortField`, `SortDirection`), repository abstraction (`ISearchRepository`), service orchestration (`SearchService`), controller routing (`SearchController`), and parameter validation (`searchProductsValidation`).

---

## 1. Folder Structure & Organization

Location: `src/modules/search/`

```
server/src/modules/search/
├── types/
│   └── search.types.ts             # SortField, SortDirection, StockStatus, AvailabilityStatus
├── constants/
│   └── search.constants.ts         # DEFAULT_PAGE, DEFAULT_LIMIT, MAX_LIMIT, DEFAULT_SORT, DEFAULT_ORDER
├── interfaces/
│   ├── pagination.interface.ts     # IPagination model
│   ├── search-filters.interface.ts # ISearchFilters parameter model
│   ├── search-response.interface.ts# ISearchResponse envelope model
│   └── search-repository.interface.ts# ISearchRepository contract
├── dto/
│   ├── search-request.dto.ts       # SearchRequestDto
│   └── search-response.dto.ts      # SearchResponseDto
├── utils/
│   ├── pagination.helper.ts        # PaginationHelper skeleton
│   ├── sorting.helper.ts           # SortingHelper skeleton
│   ├── filter.builder.ts           # FilterBuilder skeleton
│   └── search-response.builder.ts  # SearchResponseBuilder skeleton
├── repositories/
│   └── search.repository.ts        # SearchRepository skeleton
├── services/
│   └── search.service.ts           # SearchService skeleton
├── controllers/
│   └── search.controller.ts        # SearchController skeleton
├── validators/
│   └── search.validation.ts        # searchProductsValidation express-validator placeholder
└── index.ts                        # Barrel exports
```

---

## 2. Core Interfaces & Specifications

### 2.1 Search Filters (`ISearchFilters`)
Location: `src/modules/search/interfaces/search-filters.interface.ts`

```typescript
export interface ISearchFilters {
  keyword?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  stockStatus?: StockStatus;
  availability?: AvailabilityStatus;
  tags?: string[];
  attributes?: Record<string, string | string[]>;
  sortBy?: SortField;
  sortOrder?: SortDirection;
  page?: number;
  limit?: number;
}
```

### 2.2 Response Envelope (`ISearchResponse`)
Location: `src/modules/search/interfaces/search-response.interface.ts`

```typescript
export interface ISearchResponse<T = unknown> {
  products: T[];
  pagination: IPagination;
  filtersApplied: Partial<ISearchFilters>;
  sort: {
    field: SortField;
    order: SortDirection;
  };
  executionTime: number;
  totalResults: number;
}
```

### 2.3 Pagination (`IPagination`)
Location: `src/modules/search/interfaces/pagination.interface.ts`

```typescript
export interface IPagination {
  page: number;
  limit: number;
  skip: number;
  totalPages: number;
  totalRecords: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
```

---

## 3. Constants & Boundaries

Location: `src/modules/search/constants/search.constants.ts`

* `DEFAULT_PAGE`: `1`
* `DEFAULT_LIMIT`: `10`
* `MAX_LIMIT`: `100`
* `DEFAULT_SORT`: `'createdAt'`
* `DEFAULT_ORDER`: `'DESC'`

---

## 4. Verification

* **TypeScript Compilation (`npx tsc --noEmit`):** ✅ Clean (0 Errors)
* **Git Tag:** `module-21-complete` updated.
* **Files Delivered:**
  * `src/modules/search/types/search.types.ts`
  * `src/modules/search/constants/search.constants.ts`
  * `src/modules/search/interfaces/pagination.interface.ts`
  * `src/modules/search/interfaces/search-filters.interface.ts`
  * `src/modules/search/interfaces/search-response.interface.ts`
  * `src/modules/search/interfaces/search-repository.interface.ts`
  * `src/modules/search/dto/search-request.dto.ts`
  * `src/modules/search/dto/search-response.dto.ts`
  * `src/modules/search/utils/pagination.helper.ts`
  * `src/modules/search/utils/sorting.helper.ts`
  * `src/modules/search/utils/filter.builder.ts`
  * `src/modules/search/utils/search-response.builder.ts`
  * `src/modules/search/repositories/search.repository.ts`
  * `src/modules/search/services/search.service.ts`
  * `src/modules/search/controllers/search.controller.ts`
  * `src/modules/search/validators/search.validation.ts`
  * `src/modules/search/index.ts`
  * `docs/SEARCH_MODULE_STEP_22_1.md`
