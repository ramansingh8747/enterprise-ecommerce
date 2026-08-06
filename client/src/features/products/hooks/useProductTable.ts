import { useMemo, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useGetProductsQuery } from '../api/productsApi';
import { debounce } from '@/utils/debounce.util';
import { mapBackendProductToFrontend } from '../utils/product.mappers';

/**
 * Hook to manage server-side DataTable state for Products.
 */
export const useProductTable = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const sortParam = searchParams.get('sort') || '';

  console.log('useProductTable - Requesting products with params:', { page, pageSize, search, category, sortParam });
  const { data, isFetching } = useGetProductsQuery({
    page,
    limit: pageSize,
    search,
    category,
    sort: sortParam,
  });

  const products = useMemo(() => {
    return data?.data?.products.map(mapBackendProductToFrontend) || [];
  }, [data]);

  const paginationState = useMemo(() => ({
    page,
    pageSize,
    totalPages: data?.data?.pagination.totalPages || 1,
    totalRecords: data?.data?.pagination.totalRecords || 0,
  }), [page, pageSize, data]);

  const handleSearchChange = useMemo(() => debounce((value: unknown) => {
    const searchString = typeof value === 'string' ? value : '';
    const next = new URLSearchParams(searchParams);
    if (searchString) next.set('search', searchString);
    else next.delete('search');
    next.set('page', '1');
    setSearchParams(next);
  }, 300), [searchParams, setSearchParams]);

  const handleFilterChange = (key: string, value: unknown) => {
    const next = new URLSearchParams(searchParams);
    if (typeof value === 'string' && value) next.set(key, value);
    else next.delete(key);
    next.set('page', '1');
    setSearchParams(next);
  };

  const handlePageChange = useCallback((page: number) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', page.toString());
    setSearchParams(next);
  }, [searchParams, setSearchParams]);

  const handlePageSizeChange = useCallback((pageSize: number) => {
    const next = new URLSearchParams(searchParams);
    next.set('pageSize', pageSize.toString());
    next.set('page', '1');
    setSearchParams(next);
  }, [searchParams, setSearchParams]);

  const [sort, setSortState] = useState<{ columnId: string | null; direction: 'asc' | 'desc' | null }>({
    columnId: null,
    direction: null,
  });
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({});

  const memoizedFilters = useMemo(() => ({ category }), [category]);

  return {
    data: products,
    loading: isFetching,
    paginationState,
    searchQuery: search,
    onSearchQueryChange: handleSearchChange,
    filters: memoizedFilters, // Example filter
    onFilterChange: handleFilterChange,
    onPageChange: handlePageChange,
    onPageSizeChange: handlePageSizeChange,
    sortState: sort,
    setSort: setSortState,
    visibleColumns,
    setVisibleColumns,
  };
};
