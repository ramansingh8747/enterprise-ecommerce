import { Types } from "mongoose";
import {
    ICreateOrder,
    IOrder,
    IUpdateOrder,
} from "../interfaces/order.interface";
import {
    IOrderRepository,
    OrderFindOrdersResult,
} from "../interfaces/order-repository.interface";
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
import Order, { IOrderDocument } from "../models/order.model";
import { ORDER_DEFAULTS } from "../constants/order.constants";
import { OrderStatus } from "../types/order.types";

/**
 * Enterprise Order Repository (Steps 15.4–15.8).
 *
 * Data-access layer (SRP). Persistence + aggregations only — no business rules.
 */
export class OrderRepository implements IOrderRepository {
    /**
     * Persists a new Order document.
     */
    async create(data: ICreateOrder): Promise<IOrderDocument> {
        const created = await Order.create(data);
        return created;
    }

    /**
     * Finds an Order by id.
     */
    async findById(id: string): Promise<IOrderDocument | null> {
        if (!Types.ObjectId.isValid(id)) {
            return null;
        }

        return Order.findById(id).exec();
    }

    /**
     * Finds an Order by human-readable order number.
     */
    async findByOrderNumber(
        orderNumber: string
    ): Promise<IOrderDocument | null> {
        if (!orderNumber?.trim()) {
            return null;
        }

        return Order.findOne({
            orderNumber: orderNumber.trim().toUpperCase(),
        }).exec();
    }

    /**
     * Generates the next unique order number (persistence helper).
     */
    async generateOrderNumber(): Promise<string> {
        const prefix = ORDER_DEFAULTS.PREFIX;
        const stamp = Date.now().toString(36).toUpperCase();
        const random = Math.floor(Math.random() * 1_000_000)
            .toString()
            .padStart(6, "0");
        return `${prefix}-${stamp}-${random}`;
    }

    /**
     * Updates an Order by id.
     */
    async updateById(
        id: string,
        data: IUpdateOrder
    ): Promise<IOrderDocument | null> {
        if (!Types.ObjectId.isValid(id)) {
            return null;
        }

        return Order.findByIdAndUpdate(
            id,
            { $set: data },
            { new: true, runValidators: true }
        ).exec();
    }

    /**
     * Persists a new orderStatus value (no transition rules).
     */
    async updateOrderStatus(
        id: string,
        orderStatus: OrderStatus,
        updatedBy?: string
    ): Promise<IOrderDocument | null> {
        if (!Types.ObjectId.isValid(id)) {
            return null;
        }

        return Order.findByIdAndUpdate(
            id,
            {
                $set: {
                    orderStatus,
                    ...(updatedBy ? { updatedBy } : {}),
                },
            },
            { new: true, runValidators: true }
        ).exec();
    }

    /**
     * Paginated order list with optional filters (no RBAC).
     * Sort: createdAt descending.
     */
    async findOrders(filters: OrderListFilters): Promise<OrderFindOrdersResult> {
        const page =
            typeof filters.page === "number" && filters.page > 0
                ? filters.page
                : ORDER_DEFAULTS.PAGE;
        const limit =
            typeof filters.limit === "number" && filters.limit > 0
                ? Math.min(filters.limit, 100)
                : ORDER_DEFAULTS.LIMIT;
        const skip = (page - 1) * limit;

        const query: Record<string, unknown> = {};

        if (filters.orderStatus) {
            query.orderStatus = filters.orderStatus;
        }

        if (filters.paymentStatus) {
            query.paymentStatus = filters.paymentStatus;
        }

        if (filters.customerId && Types.ObjectId.isValid(filters.customerId)) {
            query.customer = new Types.ObjectId(filters.customerId);
        }

        if (filters.fromDate || filters.toDate) {
            const createdAt: Record<string, Date> = {};
            if (filters.fromDate) {
                createdAt.$gte = filters.fromDate;
            }
            if (filters.toDate) {
                createdAt.$lte = filters.toDate;
            }
            query.createdAt = createdAt;
        }

        const [items, total] = await Promise.all([
            Order.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .exec(),
            Order.countDocuments(query).exec(),
        ]);

        return { items, total };
    }

    /**
     * Placeholder — unpaginated list (prefer findOrders).
     */
    async list(_filters?: unknown): Promise<IOrder[]> {
        throw new Error("OrderRepository.list is not implemented yet.");
    }

    /**
     * Order summary: totals + status/payment breakdown + top customers.
     * Uses indexes on placedAt, orderStatus, paymentStatus, customer.
     */
    async getOrderSummary(
        filters: OrderReportMatchFilters
    ): Promise<OrderSummaryReport> {
        const match = this.buildReportMatch(filters);

        const [totals, byStatus, byPaymentStatus, topCustomers] =
            await Promise.all([
                Order.aggregate<{ totalOrders: number }>([
                    { $match: match },
                    { $group: { _id: null, totalOrders: { $sum: 1 } } },
                    { $project: { _id: 0, totalOrders: 1 } },
                ]).exec(),
                this.getOrdersByStatus(filters),
                this.getOrdersByPaymentStatus(filters),
                this.getTopCustomers(filters, 5),
            ]);

        return {
            totalOrders: totals[0]?.totalOrders ?? 0,
            byStatus,
            byPaymentStatus,
            topCustomers,
        };
    }

    /**
     * Revenue + average order value (grandTotal sum / count).
     */
    async getRevenueSummary(
        filters: OrderReportMatchFilters
    ): Promise<OrderRevenueReport> {
        const match = this.buildReportMatch(filters);

        const rows = await Order.aggregate<{
            totalRevenue: number;
            orderCount: number;
        }>([
            { $match: match },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$grandTotal" },
                    orderCount: { $sum: 1 },
                },
            },
            {
                $project: {
                    _id: 0,
                    totalRevenue: 1,
                    orderCount: 1,
                },
            },
        ]).exec();

        const totalRevenue = this.roundMoney(rows[0]?.totalRevenue ?? 0);
        const orderCount = rows[0]?.orderCount ?? 0;
        const averageOrderValue =
            orderCount > 0
                ? this.roundMoney(totalRevenue / orderCount)
                : 0;

        return {
            totalRevenue,
            orderCount,
            averageOrderValue,
            currency: ORDER_DEFAULTS.CURRENCY,
        };
    }

    /**
     * Counts grouped by orderStatus.
     */
    async getOrdersByStatus(
        filters: OrderReportMatchFilters
    ): Promise<OrderStatusCountRow[]> {
        const match = this.buildReportMatch(filters);

        const rows = await Order.aggregate<{
            _id: string;
            count: number;
        }>([
            { $match: match },
            { $group: { _id: "$orderStatus", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]).exec();

        return rows.map((row) => ({
            status: row._id,
            count: row.count,
        }));
    }

    /**
     * Counts grouped by paymentStatus.
     */
    async getOrdersByPaymentStatus(
        filters: OrderReportMatchFilters
    ): Promise<OrderPaymentStatusCountRow[]> {
        const match = this.buildReportMatch(filters);

        const rows = await Order.aggregate<{
            _id: string;
            count: number;
        }>([
            { $match: match },
            { $group: { _id: "$paymentStatus", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]).exec();

        return rows.map((row) => ({
            paymentStatus: row._id,
            count: row.count,
        }));
    }

    /**
     * Daily order count + revenue (by placedAt calendar day UTC).
     */
    async getDailyOrders(
        filters: OrderReportMatchFilters
    ): Promise<OrderDailyRow[]> {
        const match = this.buildReportMatch(filters);

        const rows = await Order.aggregate<{
            _id: string;
            orderCount: number;
            revenue: number;
        }>([
            { $match: match },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: "%Y-%m-%d",
                            date: "$placedAt",
                        },
                    },
                    orderCount: { $sum: 1 },
                    revenue: { $sum: "$grandTotal" },
                },
            },
            { $sort: { _id: 1 } },
        ]).exec();

        return rows.map((row) => ({
            date: row._id,
            orderCount: row.orderCount,
            revenue: this.roundMoney(row.revenue),
        }));
    }

    /**
     * Monthly order count + revenue (by placedAt calendar month UTC).
     */
    async getMonthlyOrders(
        filters: OrderReportMatchFilters
    ): Promise<OrderMonthlyRow[]> {
        const match = this.buildReportMatch(filters);

        const rows = await Order.aggregate<{
            _id: string;
            orderCount: number;
            revenue: number;
        }>([
            { $match: match },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: "%Y-%m",
                            date: "$placedAt",
                        },
                    },
                    orderCount: { $sum: 1 },
                    revenue: { $sum: "$grandTotal" },
                },
            },
            { $sort: { _id: 1 } },
        ]).exec();

        return rows.map((row) => ({
            month: row._id,
            orderCount: row.orderCount,
            revenue: this.roundMoney(row.revenue),
        }));
    }

    /**
     * Top customers by spend (foundation — limited rows).
     */
    async getTopCustomers(
        filters: OrderReportMatchFilters,
        limit = 5
    ): Promise<OrderTopCustomerRow[]> {
        const match = this.buildReportMatch(filters);
        const safeLimit = limit > 0 ? Math.min(limit, 50) : 5;

        const rows = await Order.aggregate<{
            _id: Types.ObjectId;
            orderCount: number;
            totalSpend: number;
        }>([
            { $match: match },
            {
                $group: {
                    _id: "$customer",
                    orderCount: { $sum: 1 },
                    totalSpend: { $sum: "$grandTotal" },
                },
            },
            { $sort: { totalSpend: -1 } },
            { $limit: safeLimit },
        ]).exec();

        return rows.map((row) => ({
            customerId: String(row._id),
            orderCount: row.orderCount,
            totalSpend: this.roundMoney(row.totalSpend),
        }));
    }

    /**
     * Builds $match for report aggregations (placedAt + status filters).
     */
    private buildReportMatch(
        filters: OrderReportMatchFilters
    ): Record<string, unknown> {
        const match: Record<string, unknown> = {};

        if (filters.orderStatus) {
            match.orderStatus = filters.orderStatus;
        }

        if (filters.paymentStatus) {
            match.paymentStatus = filters.paymentStatus;
        }

        if (filters.dateFrom || filters.dateTo) {
            const placedAt: Record<string, Date> = {};
            if (filters.dateFrom) {
                placedAt.$gte = filters.dateFrom;
            }
            if (filters.dateTo) {
                placedAt.$lte = filters.dateTo;
            }
            match.placedAt = placedAt;
        }

        return match;
    }

    private roundMoney(value: number): number {
        return Math.round((value + Number.EPSILON) * 100) / 100;
    }
}
