/**
 * Order report DTOs / filter shapes (Step 15.8).
 */

import { OrderStatus, PaymentStatus } from "../types/order.types";

/**
 * Incoming report query (after validation).
 */
export interface OrderReportQuery {
    dateFrom?: string;
    dateTo?: string;
    status?: OrderStatus;
    paymentStatus?: PaymentStatus;
    page?: number;
    limit?: number;
}

/**
 * Persistence match filters for aggregations (no RBAC).
 */
export interface OrderReportMatchFilters {
    dateFrom?: Date;
    dateTo?: Date;
    orderStatus?: OrderStatus;
    paymentStatus?: PaymentStatus;
}

export interface OrderStatusCountRow {
    status: string;
    count: number;
}

export interface OrderPaymentStatusCountRow {
    paymentStatus: string;
    count: number;
}

export interface OrderDailyRow {
    date: string;
    orderCount: number;
    revenue: number;
}

export interface OrderMonthlyRow {
    month: string;
    orderCount: number;
    revenue: number;
}

export interface OrderTopCustomerRow {
    customerId: string;
    orderCount: number;
    totalSpend: number;
}

export interface OrderSummaryReport {
    totalOrders: number;
    byStatus: OrderStatusCountRow[];
    byPaymentStatus: OrderPaymentStatusCountRow[];
    topCustomers: OrderTopCustomerRow[];
}

export interface OrderRevenueReport {
    totalRevenue: number;
    orderCount: number;
    averageOrderValue: number;
    currency: string;
}

export interface OrderDashboardMetrics {
    summary: OrderSummaryReport;
    revenue: OrderRevenueReport;
    daily: OrderDailyRow[];
    monthly: OrderMonthlyRow[];
}
