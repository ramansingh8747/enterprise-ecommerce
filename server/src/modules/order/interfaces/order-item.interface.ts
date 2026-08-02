/**
 * Enterprise Order Item domain contract (Step 15.3).
 *
 * Immutable purchase snapshot for a single sold unit.
 * lineTotal is persisted as provided — calculation belongs to Order Service (15.4).
 */

import { Types } from "mongoose";
import { OrderItemMetadata } from "../types/order-item.types";

/**
 * Order line item — catalog references + frozen commercial snapshot.
 *
 * Both productId and variantId are required so the line always points at
 * the exact sellable SKU variant under its parent product.
 */
export interface IOrderItem {
    productId: Types.ObjectId | string;
    variantId: Types.ObjectId | string;
    sku: string;
    productName: string;
    variantName?: string;
    unitPrice: number;
    quantity: number;
    discount: number;
    tax: number;
    lineTotal: number;
    currency: string;
    metadata?: OrderItemMetadata;
}

/**
 * Payload shape used when assembling line items before persistence.
 * Same fields as IOrderItem; kept for service-layer clarity in later steps.
 */
export type ICreateOrderItem = IOrderItem;
