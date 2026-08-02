/**
 * List / query Order DTOs (Step 15.7).
 */

import { OrderStatus, PaymentStatus } from "../types/order.types";
import { IOrderDocument } from "../models/order.model";

/**
 * Incoming GET /orders query (after validation).
 */
export interface ListOrdersQuery {
    page?: number;
    limit?: number;
    status?: OrderStatus;
    paymentStatus?: PaymentStatus;
    customerId?: string;
    fromDate?: string;
    toDate?: string;
}

/**
 * Persistence-level list filters (no RBAC).
 */
export interface OrderListFilters {
    page: number;
    limit: number;
    orderStatus?: OrderStatus;
    paymentStatus?: PaymentStatus;
    customerId?: string;
    fromDate?: Date;
    toDate?: Date;
}

/**
 * Pagination meta (aligned with Inventory list responses).
 */
export interface OrderPaginationMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
}

/**
 * Enterprise GET /orders response payload.
 */
export interface ListOrdersResult {
    data: IOrderDocument[];
    pagination: OrderPaginationMeta;
}

/**
 * Actor context for ownership / RBAC checks in Service.
 */
export interface OrderActorContext {
    id: string;
    role: string;
}
