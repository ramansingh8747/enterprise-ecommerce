import { useDispatch, useSelector, useStore } from 'react-redux';
import type { RootState, AppDispatch, AppStore } from './store.types';

/**
 * Strongly Typed Redux Hooks (Module 5 - Step 5.3).
 *
 * Official React Redux typed hooks pre-bound to application RootState, AppDispatch, and AppStore.
 * Direct use of untyped useDispatch, useSelector, or useStore across components is strictly forbidden.
 */

/** Typed useDispatch hook for dispatching store actions and thunks. */
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();

/** Typed useSelector hook for extracting state slices with automatic autocomplete and type safety. */
export const useAppSelector = useSelector.withTypes<RootState>();

/** Typed useStore hook for accessing the root Redux store instance. */
export const useAppStore = useStore.withTypes<AppStore>();
