import { baseApi } from '@/services/api/baseApi';
import type { ISearchResponse } from '../types/products.types';
import type { ApiSuccessResponse } from '@/services/api/response.types';

/**
 * Products Feature API Slice (Module 10 - Step 10.10).
 *
 * Injects product-related endpoints into the centralized baseApi.
 */
export const productsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query<ApiSuccessResponse<ISearchResponse>, void>({
      query: () => '/search?limit=100', // Retrieve up to 100 products for complete client-side pagination demo
      providesTags: ['Product'],
    }),
  }),
});

export const { useGetProductsQuery } = productsApi;
export default productsApi;
