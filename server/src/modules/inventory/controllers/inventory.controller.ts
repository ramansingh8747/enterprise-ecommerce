import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../../../interfaces/api-response.interface";
import { IInventoryDocument } from "../models/inventory.model";
import { ILowStockAlertDocument } from "../models/low-stock-alert.model";
import { IStockMovementDocument } from "../models/stock-movement.model";
import {
    InventoryPaginationMeta,
    InventoryService,
} from "../services/inventory.service";

/**
 * Enterprise Inventory Controller (Steps 14.8–14.9).
 *
 * HTTP adapter for Inventory endpoints (SRP).
 * Extracts request data, delegates to InventoryService, returns ApiResponse.
 */
export class InventoryController {
    constructor(private readonly inventoryService: InventoryService) {}

    /**
     * GET /inventory — paginated inventory list.
     */
    async listInventory(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const result = await this.inventoryService.listInventory({
                page: this.getQueryNumber(req.query.page),
                limit: this.getQueryNumber(req.query.limit),
                search: this.getQueryString(req.query.search),
                warehouseId: this.getQueryString(req.query.warehouseId),
                product: this.getQueryString(req.query.product),
                variant: this.getQueryString(req.query.variant),
                isActive: this.getQueryBoolean(req.query.isActive),
            });

            const response: ApiResponse<IInventoryDocument[]> & {
                pagination: InventoryPaginationMeta;
            } = {
                success: true,
                message: "Inventory list fetched successfully.",
                data: result.data,
                pagination: result.pagination,
            };

            res.status(200).json(response);
        } catch (error: unknown) {
            next(error);
        }
    }

    /**
     * GET /inventory/:id — inventory details.
     */
    async getInventoryById(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const inventory = await this.inventoryService.getInventoryById(
                this.getParam(req.params.id)
            );

            const response: ApiResponse<IInventoryDocument> = {
                success: true,
                message: "Inventory fetched successfully.",
                data: inventory,
            };

            res.status(200).json(response);
        } catch (error: unknown) {
            next(error);
        }
    }

    /**
     * PATCH /inventory/:id/adjust — delta stock adjustment.
     */
    async adjustStock(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const currentUser = this.requireUser(req, res);
            if (!currentUser) {
                return;
            }

            const result = await this.inventoryService.adjustStockByQuantity({
                inventoryId: this.getParam(req.params.id),
                quantity: Number(req.body.quantity),
                reason:
                    typeof req.body.reason === "string"
                        ? req.body.reason
                        : undefined,
                performedBy: currentUser._id,
            });

            const response: ApiResponse<typeof result> = {
                success: true,
                message: "Inventory adjusted successfully.",
                data: result,
            };

            res.status(200).json(response);
        } catch (error: unknown) {
            next(error);
        }
    }

    /**
     * POST /inventory/:id/reserve — reserve stock.
     */
    async reserveStock(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const currentUser = this.requireUser(req, res);
            if (!currentUser) {
                return;
            }

            const result = await this.inventoryService.reserveInventoryStock({
                inventoryId: this.getParam(req.params.id),
                quantity: Number(req.body.quantity),
                referenceType: String(req.body.referenceType),
                referenceId: String(req.body.referenceId),
                expiresAt: req.body.expiresAt,
                notes:
                    typeof req.body.notes === "string"
                        ? req.body.notes
                        : undefined,
                performedBy: currentUser._id,
            });

            const response: ApiResponse<typeof result> = {
                success: true,
                message: "Stock reserved successfully.",
                data: result,
            };

            res.status(201).json(response);
        } catch (error: unknown) {
            next(error);
        }
    }

    /**
     * POST /inventory/:id/release — release reservation.
     */
    async releaseStock(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const currentUser = this.requireUser(req, res);
            if (!currentUser) {
                return;
            }

            const result = await this.inventoryService.releaseInventoryStock({
                inventoryId: this.getParam(req.params.id),
                reservationId: String(req.body.reservationId),
                notes:
                    typeof req.body.notes === "string"
                        ? req.body.notes
                        : undefined,
                performedBy: currentUser._id,
            });

            const response: ApiResponse<typeof result> = {
                success: true,
                message: "Stock reservation released successfully.",
                data: result,
            };

            res.status(200).json(response);
        } catch (error: unknown) {
            next(error);
        }
    }

    /**
     * GET /inventory/:id/movements — movement history.
     */
    async getStockMovements(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const result = await this.inventoryService.listInventoryMovements({
                inventoryId: this.getParam(req.params.id),
                page: this.getQueryNumber(req.query.page),
                limit: this.getQueryNumber(req.query.limit),
                movementType: this.getQueryString(req.query.movementType),
            });

            const response: ApiResponse<IStockMovementDocument[]> & {
                pagination: InventoryPaginationMeta;
            } = {
                success: true,
                message: "Stock movements fetched successfully.",
                data: result.data,
                pagination: result.pagination,
            };

            res.status(200).json(response);
        } catch (error: unknown) {
            next(error);
        }
    }

    /**
     * GET /inventory/alerts — active low stock alerts.
     */
    async getLowStockAlerts(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const alerts =
                await this.inventoryService.getActiveLowStockAlerts();

            const response: ApiResponse<ILowStockAlertDocument[]> = {
                success: true,
                message: "Low stock alerts fetched successfully.",
                data: alerts,
            };

            res.status(200).json(response);
        } catch (error: unknown) {
            next(error);
        }
    }

    /**
     * GET /inventory/reports/summary
     */
    async getInventorySummaryReport(
        _req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const data =
                await this.inventoryService.getInventorySummaryReport();

            const response: ApiResponse<typeof data> = {
                success: true,
                message: "Inventory summary report fetched successfully.",
                data,
            };

            res.status(200).json(response);
        } catch (error: unknown) {
            next(error);
        }
    }

    /**
     * GET /inventory/reports/low-stock
     */
    async getLowStockReport(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const result = await this.inventoryService.getLowStockReport({
                page: this.getQueryNumber(req.query.page),
                limit: this.getQueryNumber(req.query.limit),
            });

            const response: ApiResponse<typeof result.data> & {
                pagination: InventoryPaginationMeta;
            } = {
                success: true,
                message: "Low stock report fetched successfully.",
                data: result.data,
                pagination: result.pagination,
            };

            res.status(200).json(response);
        } catch (error: unknown) {
            next(error);
        }
    }

    /**
     * GET /inventory/reports/movements
     */
    async getMovementAnalyticsReport(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const data =
                await this.inventoryService.getMovementAnalyticsReport({
                    movementType: this.getQueryString(req.query.movementType),
                    startDate: this.getQueryString(req.query.startDate),
                    endDate: this.getQueryString(req.query.endDate),
                    warehouseId: this.getQueryString(req.query.warehouseId),
                });

            const response: ApiResponse<typeof data> = {
                success: true,
                message: "Movement analytics report fetched successfully.",
                data,
            };

            res.status(200).json(response);
        } catch (error: unknown) {
            next(error);
        }
    }

    /**
     * GET /inventory/reports/reservations
     */
    async getReservationReport(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const result = await this.inventoryService.getReservationReport({
                page: this.getQueryNumber(req.query.page),
                limit: this.getQueryNumber(req.query.limit),
            });

            const response: ApiResponse<{
                counts: typeof result.counts;
                reservations: typeof result.data;
            }> & {
                pagination: InventoryPaginationMeta;
            } = {
                success: true,
                message: "Reservation report fetched successfully.",
                data: {
                    counts: result.counts,
                    reservations: result.data,
                },
                pagination: result.pagination,
            };

            res.status(200).json(response);
        } catch (error: unknown) {
            next(error);
        }
    }

    /**
     * Placeholder — GET product stock (kept for Step 14.1 continuity).
     */
    async getProductStock(
        _req: Request,
        _res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            throw new Error(
                "InventoryController.getProductStock is not implemented yet."
            );
        } catch (error: unknown) {
            next(error);
        }
    }

    private requireUser(
        req: Request,
        res: Response
    ): { _id: string } | null {
        if (!req.user) {
            const response: ApiResponse = {
                success: false,
                message: "Unauthorized",
            };

            res.status(401).json(response);
            return null;
        }

        return { _id: req.user._id.toString() };
    }

    private getParam(value: string | string[] | undefined): string {
        if (value === undefined) {
            return "";
        }

        return Array.isArray(value) ? value[0] : value;
    }

    private getQueryString(value: unknown): string | undefined {
        if (typeof value === "string" && value.trim().length > 0) {
            return value.trim();
        }

        if (Array.isArray(value) && typeof value[0] === "string") {
            const first = value[0].trim();
            return first.length > 0 ? first : undefined;
        }

        return undefined;
    }

    private getQueryNumber(value: unknown): number | undefined {
        if (typeof value === "number" && Number.isFinite(value)) {
            return value;
        }

        const raw = this.getQueryString(value);

        if (raw === undefined) {
            return undefined;
        }

        const parsed = Number(raw);

        if (Number.isNaN(parsed)) {
            return undefined;
        }

        return parsed;
    }

    private getQueryBoolean(value: unknown): boolean | undefined {
        if (typeof value === "boolean") {
            return value;
        }

        const raw = this.getQueryString(value);

        if (raw === undefined) {
            return undefined;
        }

        if (raw.toLowerCase() === "true") {
            return true;
        }

        if (raw.toLowerCase() === "false") {
            return false;
        }

        return undefined;
    }
}
