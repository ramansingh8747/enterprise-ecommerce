import { useState, useMemo, useEffect, useCallback } from 'react';

/**
 * Hook parameter structure.
 */
export interface IUseDataTablePaginationParams {
  readonly totalRecords: number;
  readonly initialPage?: number | undefined;
  readonly initialPageSize?: number | undefined;
}

/**
 * Enterprise useDataTablePagination Hook (Module 10 - Step 10.5).
 *
 * Generic hook that manages client-side pagination states and coordinates row indices.
 */
export function useDataTablePagination(params: IUseDataTablePaginationParams) {
  const { totalRecords, initialPage = 1, initialPageSize = 10 } = params;

  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(totalRecords / pageSize));
  }, [totalRecords, pageSize]);

  // Automatically clamp the current active page if totalPages changes
  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [totalPages, page]);

  const handlePageChange = useCallback(
    (newPage: number) => {
      const clamped = Math.max(1, Math.min(newPage, totalPages));
      setPage(clamped);
    },
    [totalPages]
  );

  const handlePageSizeChange = useCallback((newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1); // Reset to page 1 when page size changes
  }, []);

  const startRecord = (page - 1) * pageSize + 1;
  const endRecord = Math.min(page * pageSize, totalRecords);

  return {
    page,
    pageSize,
    totalPages,
    startRecord: totalRecords === 0 ? 0 : startRecord,
    endRecord,
    handlePageChange,
    handlePageSizeChange,
  };
}
export default useDataTablePagination;
