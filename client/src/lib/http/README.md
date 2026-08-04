# HTTP Infrastructure Library (`src/lib/http/`)

## Purpose & Responsibility
Provides a centralized, enterprise-grade Axios HTTP client abstraction for communicating with backend REST APIs.

## Planned Implementation (Upcoming Modules)
- Single Axios client instance initialized with `envConfig.apiBaseUrl` and `envConfig.apiTimeoutMs`.
- Request Interceptors: Attaches Bearer JWT tokens and standard headers (`X-API-Version`, `Content-Type`).
- Response Interceptors: Normalizes API responses and errors into standardized `IApiResponse<T>` / `IApiError` envelopes.
- Auto Refresh Token Interceptor: Intercepts HTTP 401 Unauthorized responses to perform automatic token rotation.

## Strict Boundaries
- **DO NOT** import feature-specific state or UI components inside `src/lib/http/`.
- **DO NOT** hardcode endpoint strings inside this layer (use `API_ENDPOINTS` or feature service files).
