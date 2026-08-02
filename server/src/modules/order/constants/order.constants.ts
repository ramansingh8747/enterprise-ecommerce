/**
 * Enterprise Order Module constants.
 *
 * Defaults, collections, and allowed status transition map (Step 15.5).
 * Transition enforcement lives in Order Service — this map is data only.
 */

import { OrderStatus, PaymentStatus } from "../types/order.types";

/**
 * Defaults for Order operations.
 */
export const ORDER_DEFAULTS = {
    STATUS: OrderStatus.PENDING,
    PAYMENT_STATUS: PaymentStatus.PENDING,
    PREFIX: "ORD",
    CURRENCY: "INR",
    PAGE: 1,
    LIMIT: 20,
} as const;

/**
 * Order status labels for future reporting / filters.
 */
export const ORDER_STATUSES = Object.values(OrderStatus);

/**
 * Payment status labels for future reporting / filters.
 */
export const PAYMENT_STATUSES = Object.values(PaymentStatus);

/**
 * Allowed orderStatus transitions (lookup data for Service).
 */
export const ORDER_STATUS_TRANSITIONS: Readonly<
    Record<OrderStatus, readonly OrderStatus[]>
> = {
    [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
    [OrderStatus.CONFIRMED]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
    [OrderStatus.PROCESSING]: [OrderStatus.PACKED],
    [OrderStatus.PACKED]: [OrderStatus.SHIPPED],
    [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
    [OrderStatus.DELIVERED]: [OrderStatus.RETURN_REQUESTED],
    [OrderStatus.RETURN_REQUESTED]: [OrderStatus.RETURNED],
    [OrderStatus.RETURNED]: [OrderStatus.REFUNDED],
    [OrderStatus.CANCELLED]: [],
    [OrderStatus.REFUNDED]: [],
};

/**
 * Placeholder collection names.
 */
export const ORDER_COLLECTIONS = {
    ORDERS: "orders",
    ORDER_ITEMS: "order_items",
} as const;
