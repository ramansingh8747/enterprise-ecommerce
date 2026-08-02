/**
 * Stock movement (ledger) contracts — Step 14.4.
 *
 * Movements are immutable audit records. Inventory holds current stock;
 * StockMovement holds history for reconciliation and reporting.
 */

import { Types } from "mongoose";
import {
    StockMovementReferenceType,
    StockMovementType,
} from "../types/inventory.types";

/**
 * Immutable stock movement record.
 */
export interface IStockMovement {
    inventory: Types.ObjectId | string;
    product: Types.ObjectId | string;
    variant?: Types.ObjectId | string;
    warehouseId?: Types.ObjectId | string;
    movementType: StockMovementType;
    quantity: number;
    previousAvailableStock: number;
    newAvailableStock: number;
    referenceType?: StockMovementReferenceType | string;
    referenceId?: Types.ObjectId | string;
    notes?: string;
    performedBy: Types.ObjectId | string;
    createdAt?: Date;
    updatedAt?: Date;
}

/**
 * Payload for recording a new stock movement (append-only).
 */
export interface ICreateStockMovement {
    inventory: Types.ObjectId | string;
    product: Types.ObjectId | string;
    variant?: Types.ObjectId | string;
    warehouseId?: Types.ObjectId | string;
    movementType: StockMovementType;
    quantity: number;
    previousAvailableStock: number;
    newAvailableStock: number;
    referenceType?: StockMovementReferenceType | string;
    referenceId?: Types.ObjectId | string;
    notes?: string;
    performedBy: Types.ObjectId | string;
}
