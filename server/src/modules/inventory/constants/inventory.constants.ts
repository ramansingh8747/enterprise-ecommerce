/**
 * Enterprise Inventory Module constants (architecture foundation).
 */

import {
    StockMovementType,
    StockReservationStatus,
    WarehouseStatus,
} from "../types/inventory.types";

/**
 * Defaults for Inventory operations (finalized in later steps).
 */
export const INVENTORY_DEFAULTS = {
    WAREHOUSE_STATUS: WarehouseStatus.ACTIVE,
    RESERVATION_STATUS: StockReservationStatus.ACTIVE,
    PAGE: 1,
    LIMIT: 20,
    LOW_STOCK_THRESHOLD: 5,
} as const;

/**
 * Stock movement type labels for future reporting.
 */
export const STOCK_MOVEMENT_TYPES = Object.values(StockMovementType);

/**
 * Placeholder collection names (schemas land in later steps).
 */
export const INVENTORY_COLLECTIONS = {
    WAREHOUSES: "warehouses",
    INVENTORIES: "inventories",
    /** @deprecated Prefer INVENTORIES */
    INVENTORY_ITEMS: "inventories",
    STOCK_MOVEMENTS: "stock_movements",
    STOCK_RESERVATIONS: "stock_reservations",
} as const;
