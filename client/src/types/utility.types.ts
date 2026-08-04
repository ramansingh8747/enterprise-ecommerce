/**
 * Global Utility Types (Module 2 - Step 2.2).
 *
 * Advanced TypeScript helper types for type inference and mapping.
 */

/** Extracts value types of an object or map. */
export type ValueOf<T> = T[keyof T];

/** Requires at least one property of T to be defined. */
export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<
  T,
  Exclude<keyof T, Keys>
> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
  }[Keys];

/** Readonly Record dictionary type. */
export type ReadonlyRecord<K extends keyof any, V> = Readonly<Record<K, V>>;
