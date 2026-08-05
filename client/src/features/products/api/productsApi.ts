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
    getProducts: builder.query<
      ApiSuccessResponse<ISearchResponse>,
      {
        page?: number;
        limit?: number;
        search?: string;
        category?: string;
        brand?: string;
        sort?: string;
      } | void
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params && typeof params === 'object') {
            if (params.page) queryParams.append('page', params.page.toString());
            if (params.limit) queryParams.append('limit', params.limit.toString());
            if (params.search) queryParams.append('search', params.search);
            if (params.category) queryParams.append('category', params.category);
            if (params.brand) queryParams.append('brand', params.brand);
            if (params.sort) queryParams.append('sort', params.sort);
        }
        return `/search?${queryParams.toString()}`;
      },
      providesTags: ['Product'],
    }),
  }),
});

export const { useGetProductsQuery } = productsApi;
export default productsApi;
