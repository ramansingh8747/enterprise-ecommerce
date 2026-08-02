/**
 * Enterprise Inventory domain contracts (Steps 14.2–14.3).
 *
 * Persistence fields match the Inventory schema.
 * Optional warehouseCode / warehouseName are DTO-only (not stored in MongoDB).
 */

import { Types } from "mongoose";
import { IWarehouseReference } from "./warehouse.interface";

/**
 * Inventory stock row — Product / optional Variant / optional Warehouse.
 *
 * Business rule (enforced in a later service step):
 * totalStock = availableStock + reservedStock
 */
export interface IInventory {
    product: Types.ObjectId | string;
    variant?: Types.ObjectId | string;
    warehouseId?: Types.ObjectId | string;
    sku: string;
    availableStock: number;
    reservedStock: number;
    totalStock: number;
    reorderLevel: number;
    isActive: boolean;
    createdBy: Types.ObjectId | string;
    updatedBy?: Types.ObjectId | string;
    createdAt?: Date;
    updatedAt?: Date;
}

/**
 * Inventory API / service response shape with optional warehouse display metadata.
 * warehouseCode / warehouseName are never persisted on the Inventory document.
 */
export type IInventoryWithWarehouse = IInventory &
    Pick<IWarehouseReference, "warehouseCode" | "warehouseName">;

/**
 * @deprecated Prefer IInventory — kept for Step 14.1 naming continuity.
 */
export type IInventoryItem = IInventory;

/**
 * Create Inventory payload (future service steps).
 */
export interface ICreateInventory {
    product: Types.ObjectId | string;
    variant?: Types.ObjectId | string;
    warehouseId?: Types.ObjectId | string;
    sku: string;
    availableStock: number;
    reservedStock?: number;
    totalStock: number;
    reorderLevel?: number;
    isActive?: boolean;
    createdBy: Types.ObjectId | string;
}

/**
 * @deprecated Prefer ICreateInventory.
 */
export type ICreateInventoryItem = ICreateInventory;

/**
 * Update Inventory payload (future service steps).
 */
export interface IUpdateInventory {
    variant?: Types.ObjectId | string | null;
    warehouseId?: Types.ObjectId | string | null;
    sku?: string;
    availableStock?: number;
    reservedStock?: number;
    totalStock?: number;
    reorderLevel?: number;
    isActive?: boolean;
    updatedBy?: Types.ObjectId | string;
}

/**
 * @deprecated Prefer IUpdateInventory.
 */
export type IUpdateInventoryItem = IUpdateInventory;

/**
 * Inventory summary report DTO (Step 14.9 — read-only).
 */
export interface IInventorySummaryReport {
    totalInventoryRecords: number;
    totalProducts: number;
    totalAvailableStock: number;
    totalReservedStock: number;
    totalStock: number;
    activeLowStockAlerts: number;
}

/**
 * Low-stock report row (Step 14.9 — read-only).
 */
export interface ILowStockReportItem {
    inventory: Types.ObjectId | string;
    product: Types.ObjectId | string;
    variant?: Types.ObjectId | string;
    warehouseId?: Types.ObjectId | string;
    currentStock: number;
    reorderLevel: number;
    sku?: string;
}

/**
 * Movement analytics report DTO (Step 14.9 — read-only).
 */
export interface IMovementAnalyticsReport {
    totalMovements: number;
    totalIn: number;
    totalOut: number;
    totalReserve: number;
    totalRelease: number;
    totalAdjustment: number;
}

/**
 * Reservation status counts (Step 14.9 — read-only).
 */
export interface IReservationStatusCounts {
    ACTIVE: number;
    RELEASED: number;
    CONSUMED: number;
}

/**
 * Movement analytics filter input.
 */
export interface IMovementAnalyticsFilter {
    movementType?: string;
    startDate?: Date | string;
    endDate?: Date | string;
    warehouseId?: string;
}

/**
 * Paginated report list filter.
 */
export interface IReportPaginationFilter {
    page?: number;
    limit?: number;
}
