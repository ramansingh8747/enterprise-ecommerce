/**
 * Stock adjustment contracts (Step 14.5).
 *
 * Adjustment is a business operation over Inventory + Stock Movement.
 * It is not a separate MongoDB collection.
 */

import { Types } from "mongoose";
import { IInventoryDocument } from "../models/inventory.model";
import { IStockMovementDocument } from "../models/stock-movement.model";

/**
 * Absolute available-stock correction input.
 */
export interface IAdjustStockInput {
    inventoryId: Types.ObjectId | string;
    /**
     * New absolute availableStock value (not a delta).
     */
    availableStock: number;
    performedBy: Types.ObjectId | string;
    notes?: string;
    referenceType?: string;
    referenceId?: Types.ObjectId | string;
    updatedBy?: Types.ObjectId | string;
}

/**
 * Result of a successful stock adjustment.
 */
export interface IAdjustStockResult {
    inventory: IInventoryDocument;
    movement: IStockMovementDocument;
    previousAvailableStock: number;
    newAvailableStock: number;
}
