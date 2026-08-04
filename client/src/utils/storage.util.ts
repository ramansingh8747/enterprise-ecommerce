/**
 * Browser Storage Utility Wrapper (Module 2 - Step 2.3).
 *
 * Safe LocalStorage/SessionStorage wrapper handling SSR checks, serialization, and quota errors.
 */

/**
 * Checks whether window.localStorage is accessible.
 */
function isLocalStorageAvailable(): boolean {
  try {
    const testKey = '__storage_test__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Retrieves and deserializes a JSON item from LocalStorage.
 */
export function getStorageItem<T>(key: string, fallback?: T): T | undefined {
  if (!isLocalStorageAvailable()) return fallback;
  try {
    const item = window.localStorage.getItem(key);
    if (item === null) return fallback;
    return JSON.parse(item) as T;
  } catch {
    return fallback;
  }
}

/**
 * Serializes and stores a JSON item in LocalStorage.
 */
export function setStorageItem<T>(key: string, value: T): boolean {
  if (!isLocalStorageAvailable()) return false;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`[StorageUtil] Failed to set item '${key}':`, error);
    return false;
  }
}

/**
 * Removes an item from LocalStorage.
 */
export function removeStorageItem(key: string): boolean {
  if (!isLocalStorageAvailable()) return false;
  try {
    window.localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

/**
 * Clears all items from LocalStorage.
 */
export function clearStorage(): boolean {
  if (!isLocalStorageAvailable()) return false;
  try {
    window.localStorage.clear();
    return true;
  } catch {
    return false;
  }
}
