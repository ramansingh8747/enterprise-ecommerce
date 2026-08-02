/**
 * Enterprise Inventory Service (Steps 14.1–14.9).
 *
 * Application layer for inventory use cases (SRP).
 * Step 14.9: read-only reporting aggregations — no inventory mutations.
 */

import { Types } from "mongoose";
import {
    IAdjustStockInput,
    IAdjustStockResult,
} from "../interfaces/stock-adjustment.interface";
import {
    IInventorySummaryReport,
    ILowStockReportItem,
    IMovementAnalyticsFilter,
    IMovementAnalyticsReport,
    IReportPaginationFilter,
    IReservationStatusCounts,
} from "../interfaces/inventory.interface";
import {
    ICheckLowStockInput,
    ICreateLowStockAlert,
    IResolveLowStockAlertInput,
} from "../interfaces/low-stock-alert.interface";
import {
    ICreateStockReservation,
    IReservationActionInput,
    IReserveStockInput,
} from "../interfaces/stock-reservation.interface";
import { ICreateStockMovement } from "../interfaces/stock-movement.interface";
import { IInventoryDocument } from "../models/inventory.model";
import { ILowStockAlertDocument } from "../models/low-stock-alert.model";
import { IStockMovementDocument } from "../models/stock-movement.model";
import { IStockReservationDocument } from "../models/stock-reservation.model";
import {
    InventoryListQuery,
    InventoryRepository,
} from "../repositories/inventory.repository";
import { INVENTORY_DEFAULTS } from "../constants/inventory.constants";
import {
    LowStockAlertStatus,
    StockMovementReferenceType,
    StockMovementType,
    StockReservationStatus,
} from "../types/inventory.types";

export interface InventoryPaginationMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
}

export interface InventoryListResult {
    data: IInventoryDocument[];
    pagination: InventoryPaginationMeta;
}

export interface InventoryMovementListResult {
    data: IStockMovementDocument[];
    pagination: InventoryPaginationMeta;
}

export interface IAdjustStockByQuantityInput {
    inventoryId: string;
    quantity: number;
    reason?: string;
    performedBy: string;
}

export interface IAdjustStockByQuantityResult extends IAdjustStockResult {
    alert: ILowStockAlertDocument | null;
}

export interface IReserveInventoryInput {
    inventoryId: string;
    quantity: number;
    referenceType: string;
    referenceId: string;
    expiresAt?: Date | string;
    notes?: string;
    performedBy: string;
}

export interface IReserveInventoryResult {
    reservation: IStockReservationDocument;
    inventory: IInventoryDocument;
    movement: IStockMovementDocument;
}

export interface IReleaseInventoryInput {
    inventoryId: string;
    reservationId: string;
    notes?: string;
    performedBy: string;
}

export interface IReleaseInventoryResult {
    reservation: IStockReservationDocument;
    inventory: IInventoryDocument;
    movement: IStockMovementDocument;
}

export interface IReservationReportResult {
    counts: IReservationStatusCounts;
    data: IStockReservationDocument[];
    pagination: InventoryPaginationMeta;
}

export interface ILowStockReportResult {
    data: ILowStockReportItem[];
    pagination: InventoryPaginationMeta;
}

export class InventoryService {
    constructor(private readonly inventoryRepository: InventoryRepository) {}

    /**
     * Placeholder — get stock for a product (all warehouses).
     */
    async getProductStock(_productId: string): Promise<unknown> {
        throw new Error(
            "InventoryService.getProductStock is not implemented yet."
        );
    }

    /**
     * Paginated inventory listing.
     */
    async listInventory(
        query: InventoryListQuery = {}
    ): Promise<InventoryListResult> {
        const page =
            typeof query.page === "number" && query.page > 0
                ? query.page
                : INVENTORY_DEFAULTS.PAGE;
        const limit =
            typeof query.limit === "number" && query.limit > 0
                ? Math.min(query.limit, 100)
                : INVENTORY_DEFAULTS.LIMIT;

        const { items, total } =
            await this.inventoryRepository.findInventoryList({
                ...query,
                page,
                limit,
            });

        return {
            data: items,
            pagination: this.buildPagination(total, page, limit),
        };
    }

    /**
     * Returns a single inventory row by id.
     */
    async getInventoryById(id: string): Promise<IInventoryDocument> {
        if (!id) {
            throw new Error("Inventory id is required.");
        }

        const inventory = await this.inventoryRepository.findById(id);

        if (!inventory) {
            throw new Error("Inventory not found.");
        }

        return inventory;
    }

    /**
     * Adjusts availableStock by a signed quantity delta and records ADJUSTMENT.
     * Triggers low-stock check afterward (record only — no notifications).
     */
    async adjustStockByQuantity(
        input: IAdjustStockByQuantityInput
    ): Promise<IAdjustStockByQuantityResult> {
        if (
            typeof input.quantity !== "number" ||
            !Number.isFinite(input.quantity) ||
            input.quantity === 0
        ) {
            throw new Error("Invalid quantity.");
        }

        const inventory = await this.getInventoryById(input.inventoryId);

        if (!inventory.isActive) {
            throw new Error("Inventory is inactive.");
        }

        const delta = Math.trunc(input.quantity);
        const newAvailableStock = inventory.availableStock + delta;

        if (newAvailableStock < 0) {
            throw new Error("Insufficient stock.");
        }

        const result = await this.adjustStock({
            inventoryId: input.inventoryId,
            availableStock: newAvailableStock,
            performedBy: input.performedBy,
            notes: input.reason,
            referenceType: StockMovementReferenceType.MANUAL,
        });

        const alert = await this.checkLowStock({
            inventory: result.inventory._id,
            product: result.inventory.product,
            variant: result.inventory.variant,
            warehouseId: result.inventory.warehouseId,
            currentStock: result.inventory.availableStock,
            reorderLevel: result.inventory.reorderLevel,
            createdBy: input.performedBy,
        });

        return {
            ...result,
            alert,
        };
    }

    /**
     * Adjusts Inventory availableStock to an absolute value and records
     * an immutable ADJUSTMENT stock movement.
     *
     * totalStock is recalculated as availableStock + reservedStock.
     * reservedStock is never modified by adjustment.
     */
    async adjustStock(input: IAdjustStockInput): Promise<IAdjustStockResult> {
        const inventoryId = String(input.inventoryId);

        if (!inventoryId) {
            throw new Error("inventoryId is required.");
        }

        if (
            typeof input.availableStock !== "number" ||
            !Number.isFinite(input.availableStock) ||
            input.availableStock < 0
        ) {
            throw new Error("availableStock cannot be negative.");
        }

        if (!input.performedBy) {
            throw new Error("performedBy is required.");
        }

        const inventory =
            await this.inventoryRepository.findById(inventoryId);

        if (!inventory) {
            throw new Error("Inventory not found.");
        }

        if (!inventory.isActive) {
            throw new Error("Inventory is inactive.");
        }

        const previousAvailableStock = inventory.availableStock;
        const newAvailableStock = Math.floor(input.availableStock);

        if (newAvailableStock === previousAvailableStock) {
            throw new Error(
                "Invalid adjustment. availableStock is unchanged."
            );
        }

        const delta = Math.abs(newAvailableStock - previousAvailableStock);
        const reservedStock = inventory.reservedStock ?? 0;
        const totalStock = newAvailableStock + reservedStock;
        const updatedBy = input.updatedBy ?? input.performedBy;

        const updated = await this.inventoryRepository.updateById(
            inventoryId,
            {
                availableStock: newAvailableStock,
                totalStock,
                updatedBy,
            }
        );

        if (!updated) {
            throw new Error("Inventory not found.");
        }

        const movementPayload: ICreateStockMovement = {
            inventory: inventoryId,
            product: inventory.product,
            variant: inventory.variant,
            warehouseId: inventory.warehouseId,
            movementType: StockMovementType.ADJUSTMENT,
            quantity: delta,
            previousAvailableStock,
            newAvailableStock,
            referenceType:
                input.referenceType ?? StockMovementReferenceType.MANUAL,
            referenceId: input.referenceId,
            notes: input.notes,
            performedBy: input.performedBy,
        };

        try {
            const movement =
                await this.inventoryRepository.createMovement(movementPayload);

            return {
                inventory: updated,
                movement,
                previousAvailableStock,
                newAvailableStock,
            };
        } catch (error: unknown) {
            await this.inventoryRepository.updateById(inventoryId, {
                availableStock: previousAvailableStock,
                totalStock: previousAvailableStock + reservedStock,
                updatedBy,
            });
            throw error;
        }
    }

    /**
     * Reserves stock for a business reference (ORDER / CART / MANUAL).
     * Moves quantity from available → reserved; does not consume/ship stock.
     */
    async reserveInventoryStock(
        input: IReserveInventoryInput
    ): Promise<IReserveInventoryResult> {
        if (
            typeof input.quantity !== "number" ||
            !Number.isFinite(input.quantity) ||
            input.quantity <= 0
        ) {
            throw new Error("Invalid quantity.");
        }

        if (!input.referenceType || !input.referenceId) {
            throw new Error("referenceType and referenceId are required.");
        }

        if (!input.performedBy) {
            throw new Error("performedBy is required.");
        }

        const inventory = await this.getInventoryById(input.inventoryId);

        if (!inventory.isActive) {
            throw new Error("Inventory is inactive.");
        }

        const quantity = Math.floor(input.quantity);

        if (quantity > inventory.availableStock) {
            throw new Error("Insufficient stock.");
        }

        const previousAvailableStock = inventory.availableStock;
        const newAvailableStock = previousAvailableStock - quantity;
        const reservedStock = (inventory.reservedStock ?? 0) + quantity;
        const totalStock = newAvailableStock + reservedStock;

        const updated = await this.inventoryRepository.updateById(
            input.inventoryId,
            {
                availableStock: newAvailableStock,
                reservedStock,
                totalStock,
                updatedBy: input.performedBy,
            }
        );

        if (!updated) {
            throw new Error("Inventory not found.");
        }

        const reservationPayload: ICreateStockReservation = {
            inventory: inventory._id,
            product: inventory.product,
            variant: inventory.variant,
            warehouseId: inventory.warehouseId,
            reservedQuantity: quantity,
            status: StockReservationStatus.ACTIVE,
            referenceType: String(input.referenceType).trim().toUpperCase(),
            referenceId: input.referenceId,
            expiresAt: input.expiresAt
                ? new Date(input.expiresAt)
                : undefined,
            notes: input.notes,
            createdBy: input.performedBy,
        };

        let reservation: IStockReservationDocument;

        try {
            reservation =
                await this.inventoryRepository.createReservation(
                    reservationPayload
                );
        } catch (error: unknown) {
            await this.inventoryRepository.updateById(input.inventoryId, {
                availableStock: previousAvailableStock,
                reservedStock: inventory.reservedStock ?? 0,
                totalStock:
                    previousAvailableStock + (inventory.reservedStock ?? 0),
                updatedBy: input.performedBy,
            });
            throw error;
        }

        const movementPayload: ICreateStockMovement = {
            inventory: inventory._id,
            product: inventory.product,
            variant: inventory.variant,
            warehouseId: inventory.warehouseId,
            movementType: StockMovementType.RESERVE,
            quantity,
            previousAvailableStock,
            newAvailableStock,
            referenceType: reservationPayload.referenceType,
            referenceId: input.referenceId,
            notes: input.notes,
            performedBy: input.performedBy,
        };

        try {
            const movement =
                await this.inventoryRepository.createMovement(movementPayload);

            return {
                reservation,
                inventory: updated,
                movement,
            };
        } catch (error: unknown) {
            await this.inventoryRepository.releaseReservation(
                String(reservation._id),
                input.performedBy
            );
            await this.inventoryRepository.updateById(input.inventoryId, {
                availableStock: previousAvailableStock,
                reservedStock: inventory.reservedStock ?? 0,
                totalStock:
                    previousAvailableStock + (inventory.reservedStock ?? 0),
                updatedBy: input.performedBy,
            });
            throw error;
        }
    }

    /**
     * Creates an ACTIVE stock reservation document only (no stock mutation).
     * Prefer reserveInventoryStock for API flows.
     */
    async reserveStock(
        input: IReserveStockInput
    ): Promise<IStockReservationDocument> {
        if (
            typeof input.reservedQuantity !== "number" ||
            !Number.isFinite(input.reservedQuantity) ||
            input.reservedQuantity <= 0
        ) {
            throw new Error("reservedQuantity must be greater than 0.");
        }

        if (!input.inventory || !input.product) {
            throw new Error("inventory and product are required.");
        }

        if (!input.referenceType || !input.referenceId) {
            throw new Error("referenceType and referenceId are required.");
        }

        if (!input.createdBy) {
            throw new Error("createdBy is required.");
        }

        const payload: ICreateStockReservation = {
            ...input,
            reservedQuantity: Math.floor(input.reservedQuantity),
            status: StockReservationStatus.ACTIVE,
            referenceType: String(input.referenceType).trim().toUpperCase(),
        };

        return this.inventoryRepository.createReservation(payload);
    }

    /**
     * Releases an ACTIVE reservation for an inventory row.
     * Restores availableStock; keeps reservation history (status → RELEASED).
     */
    async releaseInventoryStock(
        input: IReleaseInventoryInput
    ): Promise<IReleaseInventoryResult> {
        if (!input.performedBy) {
            throw new Error("performedBy is required.");
        }

        const inventory = await this.getInventoryById(input.inventoryId);
        const reservation = await this.requireActiveReservation(
            String(input.reservationId)
        );

        if (String(reservation.inventory) !== String(inventory._id)) {
            throw new Error("Invalid reservation.");
        }

        const quantity = reservation.reservedQuantity;
        const previousAvailableStock = inventory.availableStock;
        const newAvailableStock = previousAvailableStock + quantity;
        const nextReserved = Math.max(
            0,
            (inventory.reservedStock ?? 0) - quantity
        );
        const totalStock = newAvailableStock + nextReserved;

        const updated = await this.inventoryRepository.updateById(
            input.inventoryId,
            {
                availableStock: newAvailableStock,
                reservedStock: nextReserved,
                totalStock,
                updatedBy: input.performedBy,
            }
        );

        if (!updated) {
            throw new Error("Inventory not found.");
        }

        const released = await this.inventoryRepository.releaseReservation(
            String(reservation._id),
            input.performedBy
        );

        if (!released) {
            await this.inventoryRepository.updateById(input.inventoryId, {
                availableStock: previousAvailableStock,
                reservedStock: inventory.reservedStock ?? 0,
                totalStock:
                    previousAvailableStock + (inventory.reservedStock ?? 0),
                updatedBy: input.performedBy,
            });
            throw new Error("Stock reservation not found.");
        }

        const movementPayload: ICreateStockMovement = {
            inventory: inventory._id,
            product: inventory.product,
            variant: inventory.variant,
            warehouseId: inventory.warehouseId,
            movementType: StockMovementType.RELEASE,
            quantity,
            previousAvailableStock,
            newAvailableStock,
            referenceType: reservation.referenceType,
            referenceId: reservation.referenceId,
            notes: input.notes,
            performedBy: input.performedBy,
        };

        try {
            const movement =
                await this.inventoryRepository.createMovement(movementPayload);

            return {
                reservation: released,
                inventory: updated,
                movement,
            };
        } catch (error: unknown) {
            await this.inventoryRepository.updateById(input.inventoryId, {
                availableStock: previousAvailableStock,
                reservedStock: inventory.reservedStock ?? 0,
                totalStock:
                    previousAvailableStock + (inventory.reservedStock ?? 0),
                updatedBy: input.performedBy,
            });
            throw error;
        }
    }

    /**
     * Releases an ACTIVE reservation (status → RELEASED) without stock mutation.
     * Prefer releaseInventoryStock for API flows.
     */
    async releaseStock(
        input: IReservationActionInput
    ): Promise<IStockReservationDocument> {
        const reservation = await this.requireActiveReservation(
            String(input.reservationId)
        );

        const released = await this.inventoryRepository.releaseReservation(
            String(reservation._id),
            input.updatedBy
        );

        if (!released) {
            throw new Error("Stock reservation not found.");
        }

        return released;
    }

    /**
     * Consumes an ACTIVE reservation (status → CONSUMED) after fulfillment.
     * Does not modify Inventory stock fields yet.
     */
    async consumeReservedStock(
        input: IReservationActionInput
    ): Promise<IStockReservationDocument> {
        const reservation = await this.requireActiveReservation(
            String(input.reservationId)
        );

        const consumed = await this.inventoryRepository.consumeReservation(
            String(reservation._id),
            input.updatedBy
        );

        if (!consumed) {
            throw new Error("Stock reservation not found.");
        }

        return consumed;
    }

    /**
     * @deprecated Prefer releaseStock / releaseInventoryStock.
     */
    async releaseReservation(
        reservationId: string,
        updatedBy?: string
    ): Promise<IStockReservationDocument> {
        return this.releaseStock({
            reservationId,
            updatedBy: updatedBy ?? reservationId,
        });
    }

    /**
     * Lists reservations for a business reference.
     */
    async getReservationsByReference(
        referenceType: string,
        referenceId: string
    ): Promise<IStockReservationDocument[]> {
        return this.inventoryRepository.getReservationByReference(
            referenceType,
            referenceId
        );
    }

    /**
     * Records an immutable stock movement (ledger only).
     */
    async recordMovement(
        data: ICreateStockMovement
    ): Promise<IStockMovementDocument> {
        if (
            typeof data.quantity !== "number" ||
            !Number.isFinite(data.quantity) ||
            data.quantity <= 0
        ) {
            throw new Error("quantity must be greater than 0.");
        }

        return this.inventoryRepository.createMovement(data);
    }

    /**
     * Lists stock movements for an Inventory id.
     */
    async getMovementsByInventory(
        inventoryId: string
    ): Promise<IStockMovementDocument[]> {
        return this.inventoryRepository.getMovementsByInventory(inventoryId);
    }

    /**
     * Paginated movement history for an inventory row.
     */
    async listInventoryMovements(input: {
        inventoryId: string;
        page?: number;
        limit?: number;
        movementType?: string;
    }): Promise<InventoryMovementListResult> {
        await this.getInventoryById(input.inventoryId);

        const page =
            typeof input.page === "number" && input.page > 0
                ? input.page
                : INVENTORY_DEFAULTS.PAGE;
        const limit =
            typeof input.limit === "number" && input.limit > 0
                ? Math.min(input.limit, 100)
                : INVENTORY_DEFAULTS.LIMIT;

        const { items, total } =
            await this.inventoryRepository.findMovementsByInventory({
                inventoryId: input.inventoryId,
                movementType: input.movementType,
                page,
                limit,
            });

        return {
            data: items,
            pagination: this.buildPagination(total, page, limit),
        };
    }

    /**
     * Lists stock movements for a Product id.
     */
    async getMovementsByProduct(
        productId: string
    ): Promise<IStockMovementDocument[]> {
        return this.inventoryRepository.getMovementsByProduct(productId);
    }

    /**
     * Placeholder — filtered movement listing / reporting.
     */
    async getStockMovements(_filters: unknown): Promise<unknown[]> {
        throw new Error(
            "InventoryService.getStockMovements is not implemented yet."
        );
    }

    /**
     * Evaluates stock against reorderLevel.
     * Creates an ACTIVE alert when currentStock <= reorderLevel.
     * Returns an existing ACTIVE alert for the same inventory (no duplicates).
     * Returns null when stock is above reorderLevel.
     * Does not send notifications.
     */
    async checkLowStock(
        input: ICheckLowStockInput
    ): Promise<ILowStockAlertDocument | null> {
        this.validateLowStockLevels(input.currentStock, input.reorderLevel);

        if (!input.inventory || !input.product) {
            throw new Error("inventory and product are required.");
        }

        if (!input.createdBy) {
            throw new Error("createdBy is required.");
        }

        if (input.currentStock > input.reorderLevel) {
            return null;
        }

        const existing =
            await this.inventoryRepository.findActiveAlertByInventory(
                String(input.inventory)
            );

        if (existing) {
            return existing;
        }

        return this.createAlert(input);
    }

    /**
     * Creates an ACTIVE low stock alert (recording only).
     */
    async createAlert(
        input: ICheckLowStockInput
    ): Promise<ILowStockAlertDocument> {
        this.validateLowStockLevels(input.currentStock, input.reorderLevel);

        if (!input.inventory || !input.product) {
            throw new Error("inventory and product are required.");
        }

        if (!input.createdBy) {
            throw new Error("createdBy is required.");
        }

        if (input.currentStock > input.reorderLevel) {
            throw new Error(
                "Cannot create alert when currentStock is above reorderLevel."
            );
        }

        const currentStock = Math.floor(input.currentStock);
        const reorderLevel = Math.floor(input.reorderLevel);
        const message =
            input.message?.trim() ||
            `Low stock: currentStock (${currentStock}) is at or below reorderLevel (${reorderLevel}).`;

        const payload: ICreateLowStockAlert = {
            inventory: input.inventory,
            product: input.product,
            variant: input.variant,
            warehouseId: input.warehouseId,
            currentStock,
            reorderLevel,
            status: LowStockAlertStatus.ACTIVE,
            message,
            triggeredAt: new Date(),
            createdBy: input.createdBy,
        };

        return this.inventoryRepository.createLowStockAlert(payload);
    }

    /**
     * Resolves an ACTIVE alert (status → RESOLVED).
     * Does not modify Inventory stock fields.
     */
    async resolveLowStockAlert(
        input: IResolveLowStockAlertInput
    ): Promise<ILowStockAlertDocument> {
        const alertId = String(input.alertId);

        if (!alertId) {
            throw new Error("alertId is required.");
        }

        if (!input.updatedBy) {
            throw new Error("updatedBy is required.");
        }

        const alert =
            await this.inventoryRepository.findLowStockAlertById(alertId);

        if (!alert) {
            throw new Error("Low stock alert not found.");
        }

        if (alert.status !== LowStockAlertStatus.ACTIVE) {
            throw new Error(
                `Invalid alert status. Expected ACTIVE, got ${alert.status}.`
            );
        }

        const resolved = await this.inventoryRepository.resolveAlert(
            alertId,
            input.updatedBy
        );

        if (!resolved) {
            throw new Error("Low stock alert not found.");
        }

        return resolved;
    }

    /**
     * Lists ACTIVE low stock alerts.
     */
    async getActiveLowStockAlerts(): Promise<ILowStockAlertDocument[]> {
        return this.inventoryRepository.getActiveAlerts();
    }

    /**
     * Inventory KPI summary report (read-only aggregation).
     */
    async getInventorySummaryReport(): Promise<IInventorySummaryReport> {
        return this.inventoryRepository.aggregateInventorySummary();
    }

    /**
     * Paginated low-stock report (availableStock <= reorderLevel).
     */
    async getLowStockReport(
        filters: IReportPaginationFilter = {}
    ): Promise<ILowStockReportResult> {
        const page =
            typeof filters.page === "number" && filters.page > 0
                ? filters.page
                : INVENTORY_DEFAULTS.PAGE;
        const limit =
            typeof filters.limit === "number" && filters.limit > 0
                ? Math.min(filters.limit, 100)
                : INVENTORY_DEFAULTS.LIMIT;

        const { items, total } =
            await this.inventoryRepository.aggregateLowStockReport(
                page,
                limit
            );

        return {
            data: items,
            pagination: this.buildPagination(total, page, limit),
        };
    }

    /**
     * Movement analytics report (read-only aggregation).
     */
    async getMovementAnalyticsReport(
        filters: IMovementAnalyticsFilter = {}
    ): Promise<IMovementAnalyticsReport> {
        if (
            filters.movementType &&
            !Object.values(StockMovementType).includes(
                filters.movementType.toUpperCase() as StockMovementType
            )
        ) {
            throw new Error("Invalid movementType.");
        }

        if (
            filters.warehouseId &&
            !Types.ObjectId.isValid(String(filters.warehouseId))
        ) {
            throw new Error("warehouseId must be a valid Mongo ObjectId.");
        }

        const startDate = this.parseOptionalDate(
            filters.startDate,
            "startDate"
        );
        const endDate = this.parseOptionalDate(filters.endDate, "endDate");

        if (startDate && endDate && startDate > endDate) {
            throw new Error("Invalid date range. startDate cannot be after endDate.");
        }

        return this.inventoryRepository.aggregateMovementAnalytics({
            movementType: filters.movementType
                ? String(filters.movementType).trim().toUpperCase()
                : undefined,
            startDate,
            endDate,
            warehouseId: filters.warehouseId
                ? String(filters.warehouseId)
                : undefined,
        });
    }

    /**
     * Reservation summary report with status counts + pagination.
     */
    async getReservationReport(
        filters: IReportPaginationFilter = {}
    ): Promise<IReservationReportResult> {
        const page =
            typeof filters.page === "number" && filters.page > 0
                ? filters.page
                : INVENTORY_DEFAULTS.PAGE;
        const limit =
            typeof filters.limit === "number" && filters.limit > 0
                ? Math.min(filters.limit, 100)
                : INVENTORY_DEFAULTS.LIMIT;

        const { counts, items, total } =
            await this.inventoryRepository.aggregateReservationReport(
                page,
                limit
            );

        return {
            counts,
            data: items,
            pagination: this.buildPagination(total, page, limit),
        };
    }

    private parseOptionalDate(
        value: Date | string | undefined,
        fieldName: string
    ): Date | undefined {
        if (value === undefined || value === null || value === "") {
            return undefined;
        }

        const date = value instanceof Date ? value : new Date(value);

        if (Number.isNaN(date.getTime())) {
            throw new Error(`Invalid ${fieldName}.`);
        }

        return date;
    }

    private buildPagination(
        total: number,
        page: number,
        limit: number
    ): InventoryPaginationMeta {
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

    private validateLowStockLevels(
        currentStock: number,
        reorderLevel: number
    ): void {
        if (
            typeof currentStock !== "number" ||
            !Number.isFinite(currentStock) ||
            currentStock < 0
        ) {
            throw new Error("currentStock cannot be negative.");
        }

        if (
            typeof reorderLevel !== "number" ||
            !Number.isFinite(reorderLevel) ||
            reorderLevel < 0
        ) {
            throw new Error("reorderLevel cannot be negative.");
        }
    }

    private async requireActiveReservation(
        reservationId: string
    ): Promise<IStockReservationDocument> {
        if (!reservationId) {
            throw new Error("reservationId is required.");
        }

        const reservation =
            await this.inventoryRepository.findReservationById(reservationId);

        if (!reservation) {
            throw new Error("Stock reservation not found.");
        }

        if (reservation.status !== StockReservationStatus.ACTIVE) {
            throw new Error(
                `Invalid reservation status. Expected ACTIVE, got ${reservation.status}.`
            );
        }

        return reservation;
    }
}
