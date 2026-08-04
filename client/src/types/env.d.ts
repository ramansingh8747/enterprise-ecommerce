/// <reference types="vite/client" />

/**
 * Enterprise Vite Environment Variable Type Declarations (Module 2 - Step 2.1).
 *
 * Strongly typed interface for import.meta.env variables.
 */
interface ImportMetaEnv {
  readonly VITE_APP_TITLE?: string;
  readonly VITE_APP_ENV?: 'development' | 'staging' | 'production' | 'test';
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_API_VERSION?: string;
  readonly VITE_API_TIMEOUT_MS?: string;
  readonly VITE_ENABLE_ANALYTICS?: string;
  readonly VITE_ENABLE_MOCK_API?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
