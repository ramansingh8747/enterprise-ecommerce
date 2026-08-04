import { createListenerMiddleware } from '@reduxjs/toolkit';
import type { AppStartListening } from '../types/listener.types';

/**
 * Enterprise Listener Middleware Instance (Module 5 - Step 5.4).
 *
 * Side-effect orchestration listener middleware.
 */
export const listenerMiddleware = createListenerMiddleware();

export const startAppListening = listenerMiddleware.startListening as AppStartListening;
