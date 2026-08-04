import type { Reducer, ReducersMapObject } from '@reduxjs/toolkit';
import { SLICE_KEYS } from './store.constants';
import { baseApi } from '@/services/api/baseApi';

/**
 * Baseline App Reducer placeholder for initial store instantiation.
 */
function appBaselineReducer(state = { initialized: true }, action: { type: string }) {
  switch (action.type) {
    default:
      return state;
  }
}

/**
 * Open/Closed Reducer Registry (Module 5 - Step 5.5).
 *
 * Allows future feature modules to register slice reducers dynamically
 * without modifying core rootReducer configuration files.
 */
export class ReducerRegistry {
  private static reducers: ReducersMapObject = {
    [SLICE_KEYS.APP]: appBaselineReducer,
    [SLICE_KEYS.API]: baseApi.reducer,
  };

  /**
   * Registers a feature slice reducer.
   */
  public static register(key: string, reducer: Reducer): void {
    this.reducers[key] = reducer;
  }

  /**
   * Gets the combined reducer map object.
   */
  public static getReducers(): ReducersMapObject {
    return { ...this.reducers };
  }
}

