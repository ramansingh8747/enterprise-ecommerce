/**
 * Enterprise Inventory Module — shared enums / types (architecture foundation).
 *
 * Shape-only contracts for Module 14. No persistence or business rules in 14.1.
 */

/**
 * Inventory stock item owner (Product and/or Variant).
 */
export enum InventoryOwnerType {
    PRODUCT = "PRODUCT",
    VARIANT = "VARIANT",
}

/**
 * Stock movement kinds (immutable ledger / audit trail).
 */
export enum StockMovementType {
    IN = "IN",
    OUT = "OUT",
    RESERVE = "RESERVE",
    RELEASE = "RELEASE",
    ADJUSTMENT = "ADJUSTMENT",
}

/**
 * Optional business reference categories for movements.
 */
export enum StockMovementReferenceType {
    ORDER = "ORDER",
    RETURN = "RETURN",
    PURCHASE = "PURCHASE",
    MANUAL = "MANUAL",
    SYSTEM = "SYSTEM",
}

/**
 * Stock reservation lifecycle.
 */
export enum StockReservationStatus {
    ACTIVE = "ACTIVE",
    RELEASED = "RELEASED",
    CONSUMED = "CONSUMED",
}

/**
 * Optional business reference categories for reservations.
 */
export enum StockReservationReferenceType {
    ORDER = "ORDER",
    CART = "CART",
    MANUAL = "MANUAL",
}

/**
 * Warehouse / location operational status.
 */
export enum WarehouseStatus {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    MAINTENANCE = "MAINTENANCE",
}

/**
 * Low stock alert lifecycle.
 */
export enum LowStockAlertStatus {
    ACTIVE = "ACTIVE",
    RESOLVED = "RESOLVED",
    DISMISSED = "DISMISSED",
}
