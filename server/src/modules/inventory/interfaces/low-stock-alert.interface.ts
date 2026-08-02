/**
 * Low stock alert contracts (Step 14.7).
 *
 * Records threshold breaches only — no notifications or jobs in this step.
 */

import { Types } from "mongoose";
import { LowStockAlertStatus } from "../types/inventory.types";

/**
 * Persisted low-stock condition for an Inventory row.
 */
export interface ILowStockAlert {
    inventory: Types.ObjectId | string;
    product: Types.ObjectId | string;
    variant?: Types.ObjectId | string;
    warehouseId?: Types.ObjectId | string;
    currentStock: number;
    reorderLevel: number;
    status: LowStockAlertStatus;
    message: string;
    triggeredAt: Date;
    resolvedAt?: Date;
    createdBy: Types.ObjectId | string;
    updatedBy?: Types.ObjectId | string;
    createdAt?: Date;
    updatedAt?: Date;
}

/**
 * Create alert payload (repository).
 */
export interface ICreateLowStockAlert {
    inventory: Types.ObjectId | string;
    product: Types.ObjectId | string;
    variant?: Types.ObjectId | string;
    warehouseId?: Types.ObjectId | string;
    currentStock: number;
    reorderLevel: number;
    status?: LowStockAlertStatus;
    message: string;
    triggeredAt?: Date;
    createdBy: Types.ObjectId | string;
}

/**
 * Service input for checkLowStock / createAlert.
 */
export interface ICheckLowStockInput {
    inventory: Types.ObjectId | string;
    product: Types.ObjectId | string;
    variant?: Types.ObjectId | string;
    warehouseId?: Types.ObjectId | string;
    currentStock: number;
    reorderLevel: number;
    message?: string;
    createdBy: Types.ObjectId | string;
}

/**
 * Service input for resolveLowStockAlert.
 */
export interface IResolveLowStockAlertInput {
    alertId: Types.ObjectId | string;
    updatedBy: Types.ObjectId | string;
}
