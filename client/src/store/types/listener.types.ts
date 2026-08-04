import type { ListenerEffect, TypedStartListening, UnknownAction } from '@reduxjs/toolkit';
import type { RootState, AppDispatch } from '../store.types';

/**
 * Listener Middleware Type Definitions (Module 5 - Step 5.4).
 */

export type AppListenerEffect<Action extends UnknownAction = UnknownAction> = ListenerEffect<
  Action,
  RootState,
  AppDispatch
>;

export type AppStartListening = TypedStartListening<RootState, AppDispatch>;
