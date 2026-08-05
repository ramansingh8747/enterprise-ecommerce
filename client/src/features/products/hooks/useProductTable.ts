import { useMemo } from 'react';
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
  const sort = searchParams.get('sort') || '';

  const { data, isFetching } = useGetProductsQuery({
    page,
    limit: pageSize,
    search,
    category,
    sort,
  });

  const products = useMemo(() => {
    return data?.data?.data.map(mapBackendProductToFrontend) || [];
  }, [data]);

  const paginationState = useMemo(() => ({
    page,
    pageSize,
    totalPages: data?.data?.pagination.totalPages || 1,
    totalRecords: data?.data?.pagination.totalResults || 0,
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

  const handlePageChange = (page: number) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', page.toString());
    setSearchParams(next);
  };

  const handlePageSizeChange = (pageSize: number) => {
    const next = new URLSearchParams(searchParams);
    next.set('pageSize', pageSize.toString());
    next.set('page', '1');
    setSearchParams(next);
  };

  return {
    data: products,
    loading: isFetching,
    paginationState,
    searchQuery: search,
    onSearchQueryChange: handleSearchChange,
    filters: { category }, // Example filter
    onFilterChange: handleFilterChange,
    onPageChange: handlePageChange,
    onPageSizeChange: handlePageSizeChange,
  };
};
