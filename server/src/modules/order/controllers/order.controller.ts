import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../../../interfaces/api-response.interface";
import {
    CreateOrderRequest,
    CreateOrderResponse,
} from "../dto/create-order.dto";
import {
    ListOrdersQuery,
    OrderPaginationMeta,
} from "../dto/list-orders.dto";
import { OrderReportQuery } from "../dto/order-report.dto";
import {
    UpdateOrderStatusRequest,
    UpdateOrderStatusResponse,
} from "../dto/update-order.dto";
import { IOrderAddress } from "../interfaces/order.interface";
import { IOrderDocument } from "../models/order.model";
import { OrderService } from "../services/order.service";
import { OrderStatus, PaymentStatus } from "../types/order.types";

/**
 * Enterprise Order Controller (Steps 15.4–15.8).
 *
 * Thin HTTP adapter for Order REST endpoints (SRP).
 */
export class OrderController {
    constructor(private readonly orderService: OrderService) {}

    /**
     * POST /orders — create order.
     */
    async createOrder(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const currentUser = this.requireUser(req, res);
            if (!currentUser) {
                return;
            }

            const payload = this.buildCreateOrderRequest(req);

            const order = await this.orderService.createOrder(
                payload,
                currentUser._id
            );

            const response: ApiResponse<CreateOrderResponse> = {
                success: true,
                message: "Order created successfully.",
                data: { order },
            };

            res.status(201).json(response);
        } catch (error: unknown) {
            next(error);
        }
    }

    /**
     * GET /orders — paginated list (RBAC-scoped in Service).
     */
    async listOrders(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const currentUser = this.requireUser(req, res);
            if (!currentUser) {
                return;
            }

            const query = this.buildListOrdersQuery(req);

            const result = await this.orderService.getOrders(query, {
                id: currentUser._id,
                role: currentUser.role,
            });

            const response: ApiResponse<IOrderDocument[]> & {
                pagination: OrderPaginationMeta;
            } = {
                success: true,
                message: "Orders fetched successfully.",
                data: result.data,
                pagination: result.pagination,
            };

            res.status(200).json(response);
        } catch (error: unknown) {
            next(error);
        }
    }

    /**
     * GET /orders/:id — order details (ownership in Service).
     */
    async getOrderById(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const currentUser = this.requireUser(req, res);
            if (!currentUser) {
                return;
            }

            const order = await this.orderService.getOrder(
                this.getParam(req.params.id),
                {
                    id: currentUser._id,
                    role: currentUser.role,
                }
            );

            const response: ApiResponse<IOrderDocument> = {
                success: true,
                message: "Order fetched successfully.",
                data: order,
            };

            res.status(200).json(response);
        } catch (error: unknown) {
            next(error);
        }
    }

    /**
     * PATCH /orders/:id/status — update order status.
     */
    async updateOrderStatus(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const currentUser = this.requireUser(req, res);
            if (!currentUser) {
                return;
            }

            const orderId = this.getParam(req.params.id);
            const payload: UpdateOrderStatusRequest = {
                status: String(req.body.status)
                    .trim()
                    .toUpperCase() as OrderStatus,
            };

            const result = await this.orderService.updateOrderStatus(
                orderId,
                payload,
                currentUser._id
            );

            const response: ApiResponse<UpdateOrderStatusResponse> = {
                success: true,
                message: "Order status updated successfully.",
                data: result,
            };

            res.status(200).json(response);
        } catch (error: unknown) {
            next(error);
        }
    }

    /**
     * Placeholder — PATCH update / cancel order.
     */
    async updateOrder(
        _req: Request,
        _res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            throw new Error(
                "OrderController.updateOrder is not implemented yet."
            );
        } catch (error: unknown) {
            next(error);
        }
    }

    /**
     * GET /orders/reports/summary
     */
    async getOrderSummaryReport(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const data = await this.orderService.getOrderSummary(
                this.buildReportQuery(req)
            );

            const response: ApiResponse = {
                success: true,
                message: "Order summary report fetched successfully.",
                data,
            };

            res.status(200).json(response);
        } catch (error: unknown) {
            next(error);
        }
    }

    /**
     * GET /orders/reports/revenue
     */
    async getRevenueReport(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const data = await this.orderService.getRevenueSummary(
                this.buildReportQuery(req)
            );

            const response: ApiResponse = {
                success: true,
                message: "Order revenue report fetched successfully.",
                data,
            };

            res.status(200).json(response);
        } catch (error: unknown) {
            next(error);
        }
    }

    /**
     * GET /orders/reports/status
     */
    async getOrdersByStatusReport(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const data = await this.orderService.getOrdersByStatusReport(
                this.buildReportQuery(req)
            );

            const response: ApiResponse = {
                success: true,
                message: "Orders by status report fetched successfully.",
                data,
            };

            res.status(200).json(response);
        } catch (error: unknown) {
            next(error);
        }
    }

    /**
     * GET /orders/reports/daily
     */
    async getDailyOrdersReport(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const data = await this.orderService.getDailyOrdersReport(
                this.buildReportQuery(req)
            );

            const response: ApiResponse = {
                success: true,
                message: "Daily orders report fetched successfully.",
                data,
            };

            res.status(200).json(response);
        } catch (error: unknown) {
            next(error);
        }
    }

    /**
     * GET /orders/reports/monthly
     */
    async getMonthlyOrdersReport(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const data = await this.orderService.getMonthlyOrdersReport(
                this.buildReportQuery(req)
            );

            const response: ApiResponse = {
                success: true,
                message: "Monthly orders report fetched successfully.",
                data,
            };

            res.status(200).json(response);
        } catch (error: unknown) {
            next(error);
        }
    }

    private buildReportQuery(req: Request): OrderReportQuery {
        const q = req.query as Record<string, unknown>;

        return {
            dateFrom:
                typeof q.dateFrom === "string" ? q.dateFrom : undefined,
            dateTo: typeof q.dateTo === "string" ? q.dateTo : undefined,
            status:
                typeof q.status === "string"
                    ? (q.status.trim().toUpperCase() as OrderStatus)
                    : undefined,
            paymentStatus:
                typeof q.paymentStatus === "string"
                    ? (q.paymentStatus.trim().toUpperCase() as PaymentStatus)
                    : undefined,
            page: this.getQueryNumber(q.page),
            limit: this.getQueryNumber(q.limit),
        };
    }

    private buildListOrdersQuery(req: Request): ListOrdersQuery {
        const q = req.query as Record<string, unknown>;

        return {
            page: this.getQueryNumber(q.page),
            limit: this.getQueryNumber(q.limit),
            status:
                typeof q.status === "string"
                    ? (q.status.trim().toUpperCase() as OrderStatus)
                    : undefined,
            paymentStatus:
                typeof q.paymentStatus === "string"
                    ? (q.paymentStatus.trim().toUpperCase() as PaymentStatus)
                    : undefined,
            customerId:
                typeof q.customerId === "string" ? q.customerId : undefined,
            fromDate: typeof q.fromDate === "string" ? q.fromDate : undefined,
            toDate: typeof q.toDate === "string" ? q.toDate : undefined,
        };
    }

    private buildCreateOrderRequest(req: Request): CreateOrderRequest {
        const body = req.body as Record<string, unknown>;

        return {
            items: Array.isArray(body.items)
                ? (body.items as CreateOrderRequest["items"])
                : [],
            shippingAddress: body.shippingAddress as IOrderAddress,
            billingAddress: body.billingAddress as IOrderAddress | undefined,
            currency:
                typeof body.currency === "string" ? body.currency : undefined,
            discount:
                typeof body.discount === "number" ? body.discount : undefined,
            tax: typeof body.tax === "number" ? body.tax : undefined,
            shippingCharge:
                typeof body.shippingCharge === "number"
                    ? body.shippingCharge
                    : undefined,
            notes: typeof body.notes === "string" ? body.notes : undefined,
        };
    }

    private requireUser(
        req: Request,
        res: Response
    ): { _id: string; role: string } | null {
        if (!req.user) {
            const response: ApiResponse = {
                success: false,
                message: "Unauthorized",
            };

            res.status(401).json(response);
            return null;
        }

        return {
            _id: req.user._id.toString(),
            role: String(req.user.role),
        };
    }

    private getParam(value: string | string[] | undefined): string {
        if (value === undefined) {
            return "";
        }

        return Array.isArray(value) ? value[0] : value;
    }

    private getQueryNumber(value: unknown): number | undefined {
        if (value === undefined || value === null || value === "") {
            return undefined;
        }

        const n = Number(value);
        return Number.isFinite(n) ? n : undefined;
    }
}
