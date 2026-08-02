/**
 * Order repository contract (Steps 15.1–15.8).
 *
 * Persistence boundary only.
 */

import { ICreateOrder, IOrder, IUpdateOrder } from "./order.interface";
import { IOrderDocument } from "../models/order.model";
import { OrderStatus } from "../types/order.types";
import { OrderListFilters } from "../dto/list-orders.dto";
import {
    OrderDailyRow,
    OrderMonthlyRow,
    OrderPaymentStatusCountRow,
    OrderReportMatchFilters,
    OrderRevenueReport,
    OrderStatusCountRow,
    OrderSummaryReport,
    OrderTopCustomerRow,
} from "../dto/order-report.dto";

/**
 * Paginated findOrders persistence result.
 */
export interface OrderFindOrdersResult {
    items: IOrderDocument[];
    total: number;
}

/**
 * Enterprise Order repository interface (DIP).
 */
export interface IOrderRepository {
    create(data: ICreateOrder): Promise<IOrderDocument>;
    findById(id: string): Promise<IOrderDocument | null>;
    findByOrderNumber(orderNumber: string): Promise<IOrderDocument | null>;
    findOrders(filters: OrderListFilters): Promise<OrderFindOrdersResult>;
    generateOrderNumber(): Promise<string>;
    updateById(id: string, data: IUpdateOrder): Promise<IOrderDocument | null>;
    updateOrderStatus(
        id: string,
        orderStatus: OrderStatus,
        updatedBy?: string
    ): Promise<IOrderDocument | null>;
    list(filters?: unknown): Promise<IOrder[]>;

    getOrderSummary(
        filters: OrderReportMatchFilters
    ): Promise<OrderSummaryReport>;
    getRevenueSummary(
        filters: OrderReportMatchFilters
    ): Promise<OrderRevenueReport>;
    getOrdersByStatus(
        filters: OrderReportMatchFilters
    ): Promise<OrderStatusCountRow[]>;
    getOrdersByPaymentStatus(
        filters: OrderReportMatchFilters
    ): Promise<OrderPaymentStatusCountRow[]>;
    getDailyOrders(
        filters: OrderReportMatchFilters
    ): Promise<OrderDailyRow[]>;
    getMonthlyOrders(
        filters: OrderReportMatchFilters
    ): Promise<OrderMonthlyRow[]>;
    getTopCustomers(
        filters: OrderReportMatchFilters,
        limit?: number
    ): Promise<OrderTopCustomerRow[]>;
}
