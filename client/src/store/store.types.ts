import type { store } from './store';
import type { rootReducer } from './rootReducer';

/**
 * Enterprise Redux Store Type Definitions (Module 5 - Step 5.1).
 *
 * Inferred RootState, AppStore, AppDispatch, and store configuration options.
 */

/** Root State type inferred from rootReducer. */
export type RootState = ReturnType<typeof rootReducer>;

/** App Store type inferred from store instance. */
export type AppStore = typeof store;

/** App Dispatch type inferred from store instance. */
export type AppDispatch = typeof store.dispatch;

/** Configuration parameters interface for custom store creation. */
export interface IStoreConfig {
  readonly devTools?: boolean;
  readonly preloadedState?: Partial<RootState>;
}
