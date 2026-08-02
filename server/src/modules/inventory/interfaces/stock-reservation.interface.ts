/**
 * Stock reservation contracts (Step 14.6).
 *
 * Reservations block sellable stock for a cart/order without shipping it.
 * Inventory availableStock / reservedStock mutation lands in a later step.
 */

import { Types } from "mongoose";
import {
    StockReservationReferenceType,
    StockReservationStatus,
} from "../types/inventory.types";

/**
 * Soft hold on inventory for a business reference (ORDER / CART / MANUAL).
 */
export interface IStockReservation {
    inventory: Types.ObjectId | string;
    product: Types.ObjectId | string;
    variant?: Types.ObjectId | string;
    warehouseId?: Types.ObjectId | string;
    reservedQuantity: number;
    status: StockReservationStatus;
    referenceType: StockReservationReferenceType | string;
    referenceId: Types.ObjectId | string;
    expiresAt?: Date;
    notes?: string;
    createdBy: Types.ObjectId | string;
    updatedBy?: Types.ObjectId | string;
    createdAt?: Date;
    updatedAt?: Date;
}

/**
 * Create reservation payload.
 */
export interface ICreateStockReservation {
    inventory: Types.ObjectId | string;
    product: Types.ObjectId | string;
    variant?: Types.ObjectId | string;
    warehouseId?: Types.ObjectId | string;
    reservedQuantity: number;
    status?: StockReservationStatus;
    referenceType: StockReservationReferenceType | string;
    referenceId: Types.ObjectId | string;
    expiresAt?: Date;
    notes?: string;
    createdBy: Types.ObjectId | string;
}

/**
 * Release / consume update payload (repository-level).
 */
export interface IUpdateStockReservation {
    status?: StockReservationStatus;
    notes?: string;
    updatedBy?: Types.ObjectId | string;
}

/**
 * Service input for reserveStock.
 */
export interface IReserveStockInput extends ICreateStockReservation {}

/**
 * Service input for release / consume by reservation id.
 */
export interface IReservationActionInput {
    reservationId: Types.ObjectId | string;
    updatedBy: Types.ObjectId | string;
    notes?: string;
}
