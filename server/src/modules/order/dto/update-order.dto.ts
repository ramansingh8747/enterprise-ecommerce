/**
 * Update Order Status DTOs (Step 15.5).
 */

import { IOrderDocument } from "../models/order.model";
import {
    FulfillmentStatus,
    OrderStatus,
    PaymentStatus,
} from "../types/order.types";

/**
 * Incoming PATCH /orders/:id/status body.
 */
export interface UpdateOrderStatusRequest {
    status: OrderStatus;
}

/**
 * Enterprise update-status response payload.
 */
export interface UpdateOrderStatusResponse {
    order: IOrderDocument;
    previousStatus: OrderStatus;
    newStatus: OrderStatus;
}

/**
 * General update-order body (future / shared).
 */
export interface UpdateOrderDto {
    status?: OrderStatus;
    paymentStatus?: PaymentStatus;
    fulfillmentStatus?: FulfillmentStatus;
    notes?: string;
}
