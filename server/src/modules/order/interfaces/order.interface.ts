/**
 * Enterprise Order domain contracts (Steps 15.1–15.3).
 *
 * Persistence field names match the Order schema.
 * Order Item contract lives in order-item.interface.ts.
 */

import { Types } from "mongoose";
import {
    FulfillmentStatus,
    OrderStatus,
    PaymentStatus,
} from "../types/order.types";
import { IOrderItem } from "./order-item.interface";

/**
 * Address snapshot stored on Order.
 */
export interface IOrderAddress {
    fullName: string;
    phone?: string;
    line1: string;
    line2?: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
}

/**
 * Order aggregate — Product / Customer purchase record.
 */
export interface IOrder {
    orderNumber: string;
    customer: Types.ObjectId | string;
    items: IOrderItem[];
    orderStatus: OrderStatus;
    paymentStatus: PaymentStatus;
    /**
     * Optional fulfillment hint for later shipment steps.
     * Not required on the Order schema in Step 15.2.
     */
    fulfillmentStatus?: FulfillmentStatus;
    subtotal: number;
    discount: number;
    tax: number;
    shippingCharge: number;
    grandTotal: number;
    shippingAddress: IOrderAddress;
    billingAddress?: IOrderAddress;
    currency: string;
    notes?: string;
    placedAt: Date;
    createdBy: Types.ObjectId | string;
    updatedBy?: Types.ObjectId | string;
    createdAt?: Date;
    updatedAt?: Date;
}

/**
 * Create Order payload (future service steps).
 */
export interface ICreateOrder {
    orderNumber: string;
    customer: Types.ObjectId | string;
    items: IOrderItem[];
    orderStatus?: OrderStatus;
    paymentStatus?: PaymentStatus;
    subtotal: number;
    discount?: number;
    tax?: number;
    shippingCharge?: number;
    grandTotal: number;
    shippingAddress: IOrderAddress;
    billingAddress?: IOrderAddress;
    currency?: string;
    notes?: string;
    placedAt?: Date;
    createdBy: Types.ObjectId | string;
}

/**
 * Update Order payload (future service steps).
 */
export interface IUpdateOrder {
    orderStatus?: OrderStatus;
    paymentStatus?: PaymentStatus;
    fulfillmentStatus?: FulfillmentStatus;
    notes?: string;
    updatedBy?: Types.ObjectId | string;
}
