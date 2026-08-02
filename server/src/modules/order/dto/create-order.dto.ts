/**
 * Create Order request / response DTOs (Step 15.4).
 *
 * Request-shape contracts for HTTP / service input.
 * No persistence or calculation logic here.
 */

import { Types } from "mongoose";
import { IOrderAddress } from "../interfaces/order.interface";
import { IOrderDocument } from "../models/order.model";

/**
 * Incoming create-order line item.
 */
export interface CreateOrderItemRequest {
    productId: Types.ObjectId | string;
    variantId: Types.ObjectId | string;
    quantity: number;
    discount?: number;
    tax?: number;
}

/**
 * Incoming create-order body (CreateOrderRequest).
 */
export interface CreateOrderRequest {
    items: CreateOrderItemRequest[];
    shippingAddress: IOrderAddress;
    billingAddress?: IOrderAddress;
    currency?: string;
    discount?: number;
    tax?: number;
    shippingCharge?: number;
    notes?: string;
}

/**
 * @deprecated Prefer CreateOrderRequest.
 */
export type CreateOrderDto = CreateOrderRequest;

/**
 * @deprecated Prefer CreateOrderItemRequest.
 */
export type CreateOrderItemDto = CreateOrderItemRequest;

/**
 * Enterprise create-order response payload (CreateOrderResponse).
 */
export interface CreateOrderResponse {
    order: IOrderDocument;
}
