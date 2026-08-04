import { createApi } from '@reduxjs/toolkit/query/react';
import { API_REDUCER_PATH } from './api.constants';
import { baseQuery } from './baseQuery';
import { TagRegistry } from './tag.registry';

/**
 * Enterprise Base RTK Query API Slice (Module 6 - Step 6.3).
 *
 * Single root API slice consuming baseQuery and dynamic tagTypes from TagRegistry.
 */
export const baseApi = createApi({
  reducerPath: API_REDUCER_PATH,
  baseQuery,
  tagTypes: TagRegistry.getRegisteredTags(),
  endpoints: () => ({}),
});

export default baseApi;
