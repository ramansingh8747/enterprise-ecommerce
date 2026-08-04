import type { RootState } from '../store.types';
import type { AppSelector } from '../types/selector.types';

/**
 * Common Root Selectors (Module 5 - Step 5.4).
 *
 * Base state selectors.
 */
export const selectRootState: AppSelector<RootState> = (state: RootState) => state;

export const selectAppInitialized: AppSelector<boolean> = (state: RootState) =>
  Boolean(state.app?.initialized);
