# Storage Infrastructure Library (`src/lib/storage/`)

## Purpose & Responsibility
Encapsulates browser persistence mechanisms (LocalStorage, SessionStorage, Cookies) behind a unified, typed `IStorageDriver` interface.

## Planned Implementation (Upcoming Modules)
- `LocalStorageDriver`: Persistent key-value storage for user settings, theme preferences, and cart drafts.
- `SessionStorageDriver`: Tab-scoped storage for checkout steps and temporary form state.
- `CookieStorageDriver`: Secure, SameSite-compliant cookie reader/writer for auth tokens and locale settings.

## Strict Boundaries
- **DO NOT** use raw `window.localStorage` calls in UI components (always consume through this library).
- **DO NOT** store sensitive unencrypted passwords or secrets in browser storage.
