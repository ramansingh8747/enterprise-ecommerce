/**
 * Enterprise Order Item types (Step 15.3).
 *
 * Shape-only helpers for line-item snapshots.
 * No business rules or calculations.
 */

/**
 * Optional opaque metadata bag for future tax / promo engines.
 * Schema stores a plain object; keys are defined by later steps.
 */
export type OrderItemMetadata = Record<string, unknown>;
