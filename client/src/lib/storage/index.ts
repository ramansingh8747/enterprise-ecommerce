/**
 * Persistent Storage Infrastructure Library Placeholder (Module 2 - Step 2.5).
 *
 * This module will expose typed local, session, and cookie storage drivers
 * with encryption and fallback handling in upcoming modules.
 */

export interface IStorageDriver {
  get<T>(key: string): T | undefined;
  set<T>(key: string, value: T): boolean;
  remove(key: string): boolean;
  clear(): boolean;
}

export const STORAGE_LIB_MARKER = 'STORAGE_LIB_INITIALIZED';
