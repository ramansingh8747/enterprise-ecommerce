/**
 * Global Common Types (Module 2 - Step 2.2).
 *
 * Fundamental primitive types used across the entire React application.
 */

/** Primitive ID type representation (UUID or string ID). */
export type ID = string;

/** Date timestamp string or number. */
export type Timestamp = string | number;

/** Makes a type nullable. */
export type Nullable<T> = T | null;

/** Makes a type optional. */
export type Optional<T> = T | undefined;

/** Generic synchronous callback function. */
export type Callback<T = void> = () => T;

/** Generic asynchronous callback function returning a Promise. */
export type AsyncCallback<T = void> = () => Promise<T>;

/** Generic key-value dictionary type. */
export type KeyValue<T = unknown> = Record<string, T>;

/** Deep partial type helper. */
export type DeepPartial<T> = T extends object
  ? { [P in keyof T]?: DeepPartial<T[P]> }
  : T;
