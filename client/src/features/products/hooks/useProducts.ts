import { useMemo, useState, useEffect } from 'react';
import { useGetProductsQuery } from '../api/productsApi';
import { mapBackendProductsToFrontend } from '../utils/product.mappers';
import type { IProduct } from '../types/products.types';

/**
 * Enterprise useProducts Hook (Module 10 - Step 10.10).
 *
 * Encapsulates products data fetching, data transforming, loading/error flags,
 * refetch callbacks, and timestamp updates.
 */
export function useProducts() {
  const { data, isLoading, isFetching, error, refetch } = useGetProductsQuery({});
  const [lastRefetchedTimestamp, setLastRefetchedTimestamp] = useState<string | null>(null);

  const mappedProducts = useMemo<IProduct[]>(() => {
    if (!data?.data?.data) {
      return [];
    }
    return mapBackendProductsToFrontend(data.data.data);
  }, [data]);

  // Update success timestamp on query loaded changes
  useEffect(() => {
    if (data && !isLoading && !isFetching) {
      setLastRefetchedTimestamp(new Date().toLocaleTimeString());
    }
  }, [data, isLoading, isFetching]);

  return {
    products: mappedProducts,
    isLoading,
    isFetching,
    error,
    refetch,
    lastRefetchedTimestamp,
  };
}

export default useProducts;
