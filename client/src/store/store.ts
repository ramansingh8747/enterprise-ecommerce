import { configureStore } from '@reduxjs/toolkit';
import { rootReducer } from './rootReducer';
import { customMiddlewares } from './middleware';
import { envConfig } from '@/config/env.config';

/**
 * Enterprise Redux Toolkit Store Instance (Module 5 - Step 5.1).
 *
 * Configures the centralized application state container with devTools and middleware.
 */
export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        warnAfter: 128,
      },
      immutableCheck: {
        warnAfter: 128,
      },
    }).concat(customMiddlewares),
  devTools: envConfig.isDevelopment,
});

export default store;
