import { Types } from "mongoose";
import { ROLES } from "../../../constants/roles";
import { ProductStatus } from "../../../interfaces/product.interface";
import { ProductRepository } from "../../../repositories/product.repository";
import { InventoryRepository } from "../../inventory/repositories/inventory.repository";
import { VariantRepository } from "../../variant/variant.repository";
import { ORDER_DEFAULTS, ORDER_STATUS_TRANSITIONS } from "../constants/order.constants";
import {
    CreateOrderItemRequest,
    CreateOrderRequest,
} from "../dto/create-order.dto";
import {
    ListOrdersQuery,
    ListOrdersResult,
    OrderActorContext,
    OrderListFilters,
    OrderPaginationMeta,
} from "../dto/list-orders.dto";
import {
    OrderDailyRow,
    OrderDashboardMetrics,
    OrderMonthlyRow,
    OrderReportMatchFilters,
    OrderReportQuery,
    OrderRevenueReport,
    OrderStatusCountRow,
    OrderSummaryReport,
} from "../dto/order-report.dto";
import {
    UpdateOrderStatusRequest,
    UpdateOrderStatusResponse,
} from "../dto/update-order.dto";
import { ICreateOrder, IOrder, IUpdateOrder } from "../interfaces/order.interface";
import { IOrderItem } from "../interfaces/order-item.interface";
import { IOrderService } from "../interfaces/order-service.interface";
import { IOrderDocument } from "../models/order.model";
import { OrderRepository } from "../repositories/order.repository";
import {
    OrderStatus,
    PaymentStatus,
} from "../types/order.types";

/**
 * Enterprise Order Service (Steps 15.4–15.8).
 *
 * Orchestrates creation, status transitions, queries, and reports.
 * No payment gateway, notifications, shipment, or stock deduction.
 */
export class OrderService implements IOrderService {
    constructor(
        private readonly orderRepository: OrderRepository,
        private readonly productRepository: ProductRepository = new ProductRepository(),
        private readonly variantRepository: VariantRepository = new VariantRepository(),
        private readonly inventoryRepository: InventoryRepository = new InventoryRepository()
    ) {}

    /**
     * Creates an Order with immutable line snapshots.
     * Validates inventory availability only — does not deduct stock.
     */
    async createOrder(
        data: CreateOrderRequest,
        actorId: string
    ): Promise<IOrderDocument> {
        if (!actorId) {
            throw new Error("Unauthorized");
        }

        if (!Array.isArray(data.items) || data.items.length === 0) {
            throw new Error("items must be a non-empty array.");
        }

        if (!data.shippingAddress) {
            throw new Error("shippingAddress is required.");
        }

        const currency = (
            data.currency?.trim() || ORDER_DEFAULTS.CURRENCY
        ).toUpperCase();

        const snapshotItems: IOrderItem[] = [];

        for (const item of data.items) {
            snapshotItems.push(
                await this.buildOrderItemSnapshot(item, currency)
            );
        }

        const orderLevelDiscount = this.nonNegativeNumber(data.discount, 0);
        const orderLevelTax = this.nonNegativeNumber(data.tax, 0);
        const shippingCharge = this.nonNegativeNumber(data.shippingCharge, 0);

        const lineDiscountTotal = snapshotItems.reduce(
            (sum, row) => sum + row.discount,
            0
        );
        const lineTaxTotal = snapshotItems.reduce(
            (sum, row) => sum + row.tax,
            0
        );
        const subtotal = snapshotItems.reduce(
            (sum, row) => sum + row.unitPrice * row.quantity,
            0
        );
        const discount = lineDiscountTotal + orderLevelDiscount;
        const tax = lineTaxTotal + orderLevelTax;
        const grandTotal = this.roundMoney(
            subtotal - discount + tax + shippingCharge
        );

        if (grandTotal < 0) {
            throw new Error("Invalid order totals. grandTotal cannot be negative.");
        }

        const orderNumber = await this.orderRepository.generateOrderNumber();

        const payload: ICreateOrder = {
            orderNumber,
            customer: actorId,
            items: snapshotItems,
            orderStatus: OrderStatus.PENDING,
            paymentStatus: PaymentStatus.PENDING,
            subtotal: this.roundMoney(subtotal),
            discount: this.roundMoney(discount),
            tax: this.roundMoney(tax),
            shippingCharge: this.roundMoney(shippingCharge),
            grandTotal,
            shippingAddress: data.shippingAddress,
            billingAddress: data.billingAddress,
            currency,
            notes: data.notes?.trim(),
            placedAt: new Date(),
            createdBy: actorId,
        };

        return this.orderRepository.create(payload);
    }

    /**
     * Returns a single order with ownership enforcement.
     * Customer: own order only. Admin / Super Admin: any order.
     */
    async getOrder(
        orderId: string,
        actor: OrderActorContext
    ): Promise<IOrderDocument> {
        if (!actor?.id) {
            throw new Error("Unauthorized");
        }

        if (!orderId) {
            throw new Error("Order id is required.");
        }

        const order = await this.orderRepository.findById(orderId);

        if (!order) {
            throw new Error("Order not found.");
        }

        if (!this.isAdminRole(actor.role)) {
            if (String(order.customer) !== String(actor.id)) {
                throw new Error("Access denied");
            }
        }

        return order;
    }

    /**
     * Paginated order list with RBAC-scoped filters.
     * Customer: own orders only. Admin: optional customerId + filters.
     */
    async getOrders(
        query: ListOrdersQuery,
        actor: OrderActorContext
    ): Promise<ListOrdersResult> {
        if (!actor?.id) {
            throw new Error("Unauthorized");
        }

        const page =
            typeof query.page === "number" && query.page > 0
                ? query.page
                : ORDER_DEFAULTS.PAGE;
        const limit =
            typeof query.limit === "number" && query.limit > 0
                ? Math.min(query.limit, 100)
                : ORDER_DEFAULTS.LIMIT;

        const filters: OrderListFilters = {
            page,
            limit,
            orderStatus: query.status,
            paymentStatus: query.paymentStatus,
            fromDate: this.parseOptionalDate(query.fromDate, "fromDate"),
            toDate: this.parseOptionalDate(query.toDate, "toDate"),
        };

        if (this.isAdminRole(actor.role)) {
            if (query.customerId) {
                filters.customerId = query.customerId;
            }
        } else {
            if (query.customerId && query.customerId !== actor.id) {
                throw new Error("Access denied");
            }
            filters.customerId = actor.id;
        }

        const { items, total } =
            await this.orderRepository.findOrders(filters);

        return {
            data: items,
            pagination: this.buildPagination(total, page, limit),
        };
    }

    /**
     * Internal get-by-id without ownership (used by status updates).
     */
    async getOrderById(id: string): Promise<IOrderDocument> {
        const order = await this.orderRepository.findById(id);

        if (!order) {
            throw new Error("Order not found.");
        }

        return order;
    }

    /**
     * Get order by human-readable order number.
     */
    async getOrderByNumber(orderNumber: string): Promise<IOrderDocument> {
        const order =
            await this.orderRepository.findByOrderNumber(orderNumber);

        if (!order) {
            throw new Error("Order not found.");
        }

        return order;
    }

    /**
     * Placeholder — update order fields.
     */
    async updateOrder(
        id: string,
        data: IUpdateOrder,
        actorId: string
    ): Promise<IOrderDocument> {
        if (!actorId) {
            throw new Error("Unauthorized");
        }

        const updated = await this.orderRepository.updateById(id, {
            ...data,
            updatedBy: actorId,
        });

        if (!updated) {
            throw new Error("Order not found.");
        }

        return updated;
    }

    /**
     * Updates orderStatus after validating allowed lifecycle transitions.
     * Does not touch paymentStatus, inventory, shipment, or notifications.
     */
    async updateOrderStatus(
        orderId: string,
        data: UpdateOrderStatusRequest,
        actorId: string
    ): Promise<UpdateOrderStatusResponse> {
        if (!actorId) {
            throw new Error("Unauthorized");
        }

        if (!orderId) {
            throw new Error("Order id is required.");
        }

        const nextStatus = String(data.status ?? "")
            .trim()
            .toUpperCase() as OrderStatus;

        if (!Object.values(OrderStatus).includes(nextStatus)) {
            throw new Error("Invalid status.");
        }

        const order = await this.orderRepository.findById(orderId);

        if (!order) {
            throw new Error("Order not found.");
        }

        const previousStatus = order.orderStatus;

        if (previousStatus === nextStatus) {
            throw new Error(
                `Invalid status transition. Order is already ${previousStatus}.`
            );
        }

        const allowed =
            ORDER_STATUS_TRANSITIONS[previousStatus] ??
            ([] as readonly OrderStatus[]);

        if (!allowed.includes(nextStatus)) {
            throw new Error(
                `Invalid status transition. Cannot change from ${previousStatus} to ${nextStatus}.`
            );
        }

        const updated = await this.orderRepository.updateOrderStatus(
            orderId,
            nextStatus,
            actorId
        );

        if (!updated) {
            throw new Error("Order not found.");
        }

        return {
            order: updated,
            previousStatus,
            newStatus: nextStatus,
        };
    }

    /**
     * @deprecated Prefer getOrders() — kept for interface continuity.
     */
    async listOrders(_filters?: unknown): Promise<IOrder[]> {
        throw new Error("OrderService.listOrders is not implemented yet.");
    }

    /**
     * Orders summary report (counts + top customers foundation).
     */
    async getOrderSummary(
        query: OrderReportQuery
    ): Promise<OrderSummaryReport> {
        return this.orderRepository.getOrderSummary(
            this.toReportMatchFilters(query)
        );
    }

    /**
     * Revenue summary + average order value.
     */
    async getRevenueSummary(
        query: OrderReportQuery
    ): Promise<OrderRevenueReport> {
        return this.orderRepository.getRevenueSummary(
            this.toReportMatchFilters(query)
        );
    }

    /**
     * Orders grouped by orderStatus.
     */
    async getOrdersByStatusReport(
        query: OrderReportQuery
    ): Promise<OrderStatusCountRow[]> {
        return this.orderRepository.getOrdersByStatus(
            this.toReportMatchFilters(query)
        );
    }

    /**
     * Daily order / revenue series.
     */
    async getDailyOrdersReport(
        query: OrderReportQuery
    ): Promise<OrderDailyRow[]> {
        return this.orderRepository.getDailyOrders(
            this.toReportMatchFilters(query)
        );
    }

    /**
     * Monthly order / revenue series.
     */
    async getMonthlyOrdersReport(
        query: OrderReportQuery
    ): Promise<OrderMonthlyRow[]> {
        return this.orderRepository.getMonthlyOrders(
            this.toReportMatchFilters(query)
        );
    }

    /**
     * Dashboard metrics — orchestrates summary, revenue, daily, monthly.
     */
    async getDashboardMetrics(
        query: OrderReportQuery
    ): Promise<OrderDashboardMetrics> {
        const filters = this.toReportMatchFilters(query);

        const [summary, revenue, daily, monthly] = await Promise.all([
            this.orderRepository.getOrderSummary(filters),
            this.orderRepository.getRevenueSummary(filters),
            this.orderRepository.getDailyOrders(filters),
            this.orderRepository.getMonthlyOrders(filters),
        ]);

        return { summary, revenue, daily, monthly };
    }

    private toReportMatchFilters(
        query: OrderReportQuery
    ): OrderReportMatchFilters {
        const dateFrom = this.parseOptionalDate(query.dateFrom, "dateFrom");
        const dateTo = this.parseOptionalDate(query.dateTo, "dateTo");

        if (dateFrom && dateTo && dateFrom.getTime() > dateTo.getTime()) {
            throw new Error("Invalid date range.");
        }

        return {
            dateFrom,
            dateTo,
            orderStatus: query.status,
            paymentStatus: query.paymentStatus,
        };
    }

    private async buildOrderItemSnapshot(
        item: CreateOrderItemRequest,
        currency: string
    ): Promise<IOrderItem> {
        const productId = String(item.productId);
        const variantId = String(item.variantId);
        const quantity = Math.floor(Number(item.quantity));

        if (!Types.ObjectId.isValid(productId)) {
            throw new Error("Invalid productId.");
        }

        if (!Types.ObjectId.isValid(variantId)) {
            throw new Error("Invalid variantId.");
        }

        if (!Number.isFinite(quantity) || quantity < 1) {
            throw new Error("Invalid quantity.");
        }

        const product = await this.productRepository.findById(productId);

        if (!product) {
            throw new Error("Product not found.");
        }

        if (product.status !== ProductStatus.ACTIVE) {
            throw new Error("Product is not available.");
        }

        const variant = await this.variantRepository.findById(variantId, {
            populateProduct: false,
        });

        if (!variant) {
            throw new Error("Variant not found.");
        }

        if (String(variant.product) !== productId) {
            throw new Error("Invalid variant. Variant does not belong to product.");
        }

        if (!variant.isActive) {
            throw new Error("Variant is not available.");
        }

        await this.assertInventoryAvailable(productId, variantId, quantity);

        const unitPrice = this.roundMoney(
            typeof variant.salePrice === "number" &&
                Number.isFinite(variant.salePrice)
                ? variant.salePrice
                : variant.price
        );
        const discount = this.nonNegativeNumber(item.discount, 0);
        const tax = this.nonNegativeNumber(item.tax, 0);
        const lineTotal = this.roundMoney(unitPrice * quantity - discount + tax);

        if (lineTotal < 0) {
            throw new Error("Invalid quantity. lineTotal cannot be negative.");
        }

        const variantName = [variant.color, variant.size]
            .filter((part) => typeof part === "string" && part.trim().length > 0)
            .join(" / ");

        return {
            productId,
            variantId,
            sku: variant.sku,
            productName: product.name,
            variantName: variantName || undefined,
            unitPrice,
            quantity,
            discount: this.roundMoney(discount),
            tax: this.roundMoney(tax),
            lineTotal,
            currency,
        };
    }

    private async assertInventoryAvailable(
        productId: string,
        variantId: string,
        quantity: number
    ): Promise<void> {
        const { items } = await this.inventoryRepository.findInventoryList({
            product: productId,
            variant: variantId,
            isActive: true,
            page: 1,
            limit: 100,
        });

        const available = items.reduce(
            (sum, row) => sum + (row.availableStock ?? 0),
            0
        );

        if (available < quantity) {
            throw new Error("Insufficient stock.");
        }
    }

    private isAdminRole(role: string): boolean {
        return role === ROLES.ADMIN || role === ROLES.SUPER_ADMIN;
    }

    private parseOptionalDate(
        value: string | undefined,
        fieldName: string
    ): Date | undefined {
        if (value === undefined || value === null || value === "") {
            return undefined;
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            throw new Error(`Invalid ${fieldName}.`);
        }

        return date;
    }

    private buildPagination(
        total: number,
        page: number,
        limit: number
    ): OrderPaginationMeta {
        const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

        return {
            total,
            page,
            limit,
            totalPages,
            hasNext: page < totalPages,
            hasPrevious: page > 1 && totalPages > 0,
        };
    }

    private nonNegativeNumber(
        value: number | undefined,
        fallback: number
    ): number {
        if (typeof value !== "number" || !Number.isFinite(value)) {
            return fallback;
        }

        if (value < 0) {
            throw new Error("Invalid quantity.");
        }

        return value;
    }

    private roundMoney(value: number): number {
        return Math.round((value + Number.EPSILON) * 100) / 100;
    }
}
