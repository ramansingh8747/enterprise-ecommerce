/**
 * Order service contract (Steps 15.1–15.8).
 *
 * Application-layer boundary.
 */

import { CreateOrderRequest } from "../dto/create-order.dto";
import {
    ListOrdersQuery,
    ListOrdersResult,
    OrderActorContext,
} from "../dto/list-orders.dto";
import {
    OrderDailyRow,
    OrderDashboardMetrics,
    OrderMonthlyRow,
    OrderReportQuery,
    OrderRevenueReport,
    OrderStatusCountRow,
    OrderSummaryReport,
} from "../dto/order-report.dto";
import {
    UpdateOrderStatusRequest,
    UpdateOrderStatusResponse,
} from "../dto/update-order.dto";
import { IOrder, IUpdateOrder } from "./order.interface";
import { IOrderDocument } from "../models/order.model";

/**
 * Enterprise Order service interface (DIP).
 */
export interface IOrderService {
    createOrder(
        data: CreateOrderRequest,
        actorId: string
    ): Promise<IOrderDocument>;
    getOrder(
        orderId: string,
        actor: OrderActorContext
    ): Promise<IOrderDocument>;
    getOrders(
        query: ListOrdersQuery,
        actor: OrderActorContext
    ): Promise<ListOrdersResult>;
    getOrderById(id: string): Promise<IOrderDocument>;
    getOrderByNumber(orderNumber: string): Promise<IOrderDocument>;
    updateOrder(
        id: string,
        data: IUpdateOrder,
        actorId: string
    ): Promise<IOrderDocument>;
    updateOrderStatus(
        orderId: string,
        data: UpdateOrderStatusRequest,
        actorId: string
    ): Promise<UpdateOrderStatusResponse>;
    listOrders(filters?: unknown): Promise<IOrder[]>;

    getOrderSummary(query: OrderReportQuery): Promise<OrderSummaryReport>;
    getRevenueSummary(query: OrderReportQuery): Promise<OrderRevenueReport>;
    getOrdersByStatusReport(
        query: OrderReportQuery
    ): Promise<OrderStatusCountRow[]>;
    getDailyOrdersReport(query: OrderReportQuery): Promise<OrderDailyRow[]>;
    getMonthlyOrdersReport(
        query: OrderReportQuery
    ): Promise<OrderMonthlyRow[]>;
    getDashboardMetrics(
        query: OrderReportQuery
    ): Promise<OrderDashboardMetrics>;
}
