import { combineReducers } from '@reduxjs/toolkit';
import { ReducerRegistry } from './reducer.registry';

/**
 * Enterprise Root Reducer Architecture (Module 5 - Step 5.5).
 *
 * Dynamically combines all registered slice reducers from ReducerRegistry.
 */
export const rootReducer = combineReducers(ReducerRegistry.getReducers());

export default rootReducer;
