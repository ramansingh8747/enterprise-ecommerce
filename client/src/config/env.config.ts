/**
 * Enterprise Environment Configuration Module (Module 2 - Step 2.1).
 *
 * Single source of truth for reading, parsing, validating, and exposing environment variables.
 * Direct access to import.meta.env outside this file is strictly forbidden.
 */

export interface IEnvConfig {
  readonly appTitle: string;
  readonly appEnv: 'development' | 'staging' | 'production' | 'test';
  readonly apiBaseUrl: string;
  readonly apiVersion: string;
  readonly apiTimeoutMs: number;
  readonly enableAnalytics: boolean;
  readonly enableMockApi: boolean;
  readonly isDevelopment: boolean;
  readonly isProduction: boolean;
}

/**
 * Validates and parses environment variables.
 */
function parseEnvConfig(): IEnvConfig {
  const env = import.meta.env;

  const appTitle = env.VITE_APP_TITLE || 'Enterprise E-Commerce';
  const appEnv = (env.VITE_APP_ENV as IEnvConfig['appEnv']) || 'development';
  const apiBaseUrl = env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
  const apiVersion = env.VITE_API_VERSION || 'v1';
  const apiTimeoutMs = env.VITE_API_TIMEOUT_MS ? parseInt(env.VITE_API_TIMEOUT_MS, 10) : 30000;
  const enableAnalytics = env.VITE_ENABLE_ANALYTICS === 'true';
  const enableMockApi = env.VITE_ENABLE_MOCK_API === 'true';

  if (isNaN(apiTimeoutMs) || apiTimeoutMs <= 0) {
    console.warn('[EnvConfig] Invalid VITE_API_TIMEOUT_MS provided. Defaulting to 30000ms.');
  }

  return Object.freeze({
    appTitle,
    appEnv,
    apiBaseUrl,
    apiVersion,
    apiTimeoutMs: isNaN(apiTimeoutMs) || apiTimeoutMs <= 0 ? 30000 : apiTimeoutMs,
    enableAnalytics,
    enableMockApi,
    isDevelopment: appEnv === 'development',
    isProduction: appEnv === 'production',
  });
}

/** Immutable, validated application environment configuration singleton. */
export const envConfig: IEnvConfig = parseEnvConfig();
