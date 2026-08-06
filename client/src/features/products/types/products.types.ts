/**
 * Backend Product Model Contract.
 */
export interface IBackendProduct {
  readonly _id: string;
  readonly name: string;
  readonly sku: string;
  readonly price: number;
  readonly quantity: number;
  readonly status: 'ACTIVE' | 'INACTIVE' | 'DRAFT' | 'ARCHIVED';
  readonly stockStatus: 'IN_STOCK' | 'OUT_OF_STOCK' | 'LOW_STOCK' | 'PREORDER';
  readonly createdAt: string;
  readonly updatedAt: string;
}

/**
 * Frontend Product UI Model.
 */
export interface IProduct {
  readonly id: string;
  readonly name: string;
  readonly sku: string;
  readonly price: number;
  readonly status: 'active' | 'draft' | 'out_of_stock';
  readonly stock: number;
  readonly createdAt: string;
}

/**
 * RTK Query API Search Response Wrapper.
 */
export interface ISearchResponse {
  readonly products: readonly IBackendProduct[];
  readonly pagination: {
    readonly currentPage: number;
    readonly totalPages: number;
    readonly totalRecords: number;
    readonly hasNextPage: boolean;
    readonly hasPrevPage: boolean;
  };
  readonly totalResults: number;
  readonly executionTime: number;
}
