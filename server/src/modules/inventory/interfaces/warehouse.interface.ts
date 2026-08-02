/**
 * Warehouse reference contracts for Inventory (Step 14.3).
 *
 * Placeholder types for future Warehouse module integration.
 * No Warehouse persistence or CRUD in this step.
 */

import { Types } from "mongoose";
import { WarehouseStatus } from "../types/inventory.types";

/**
 * Lightweight warehouse reference exposed on Inventory DTOs / responses.
 * `warehouseId` may point at a future Warehouse document.
 * `warehouseCode` / `warehouseName` are denormalized display fields only
 * (populated by service joins later — never stored on Inventory schema).
 */
export interface IWarehouseReference {
    warehouseId?: Types.ObjectId | string | null;
    warehouseCode?: string;
    warehouseName?: string;
}

/**
 * Future Warehouse aggregate shape (CRUD lands in a dedicated Warehouse module).
 */
export interface IWarehouse {
    code: string;
    name: string;
    status: WarehouseStatus;
    isDefault?: boolean;
    address?: {
        line1?: string;
        line2?: string;
        city?: string;
        state?: string;
        postalCode?: string;
        country?: string;
    };
    createdBy?: Types.ObjectId | string;
    updatedBy?: Types.ObjectId | string;
    createdAt?: Date;
    updatedAt?: Date;
}
