/**
 * Enterprise Redux Store Constants (Module 5 - Step 5.1).
 *
 * Slice name keys and middleware constants.
 */

export const SLICE_KEYS = Object.freeze({
  APP: 'app',
  AUTH: 'auth',
  USER: 'user',
  PRODUCT: 'product',
  CART: 'cart',
  ORDER: 'order',
  UI: 'ui',
  API: 'api',
});

export const STORE_CONSTANTS = Object.freeze({
  SERIALIZABLE_CHECK_IGNORED_ACTIONS: Object.freeze([]),
  THUNK_EXTRA_ARGUMENT: Object.freeze({}),
});
