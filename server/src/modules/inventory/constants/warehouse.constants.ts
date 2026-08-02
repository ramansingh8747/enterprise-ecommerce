/**
 * Warehouse integration constants (Step 14.3).
 *
 * Used when a Warehouse module is not yet available.
 * Inventory may treat a single logical "default" location conceptually
 * without persisting warehouse name/code on Inventory documents.
 */

/**
 * Display name for the implicit default warehouse.
 */
export const DEFAULT_WAREHOUSE_NAME = "Default Warehouse";

/**
 * Stable code for the implicit default warehouse.
 */
export const DEFAULT_WAREHOUSE_CODE = "DEFAULT";
