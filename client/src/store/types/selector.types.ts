import type { RootState } from '../store.types';

/**
 * Selector Type Definitions (Module 5 - Step 5.4).
 */

/** Generic selector function extracting T from RootState. */
export type AppSelector<T> = (state: RootState) => T;

/** Parametric selector function extracting T from RootState with parameters P. */
export type ParametricAppSelector<P, T> = (state: RootState, params: P) => T;
