import type { StoreEnhancer } from '@reduxjs/toolkit';

/**
 * Enterprise DevTools Store Enhancer Placeholder (Module 5 - Step 5.4).
 */
export const devToolsEnhancer: StoreEnhancer = (createStoreHandler) => (reducer, preloadedState) => {
  return createStoreHandler(reducer, preloadedState);
};
