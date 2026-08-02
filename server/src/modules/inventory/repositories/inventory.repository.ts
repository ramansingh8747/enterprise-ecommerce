import { Model, QueryFilter, Types, UpdateQuery } from "mongoose";
import { IUpdateInventory } from "../interfaces/inventory.interface";
import {
    ICreateLowStockAlert,
} from "../interfaces/low-stock-alert.interface";
import {
    ICreateStockReservation,
} from "../interfaces/stock-reservation.interface";
import {
    ICreateStockMovement,
} from "../interfaces/stock-movement.interface";
import Inventory, {
    IInventoryDocument,
} from "../models/inventory.model";
import LowStockAlert, {
    ILowStockAlertDocument,
} from "../models/low-stock-alert.model";
import StockMovement, {
    IStockMovementDocument,
} from "../models/stock-movement.model";
import StockReservation, {
    IStockReservationDocument,
} from "../models/stock-reservation.model";
import {
    LowStockAlertStatus,
    StockMovementType,
    StockReservationStatus,
} from "../types/inventory.types";

/**
 * Inventory list filter options (repository — persistence only).
 */
export interface InventoryListQuery {
    search?: string;
    warehouseId?: string;
    product?: string;
    variant?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
}

/**
 * Movement list filter options for an inventory row.
 */
export interface InventoryMovementListQuery {
    inventoryId: string;
    movementType?: string;
    page?: number;
    limit?: number;
}

/**
 * Enterprise Inventory Repository (Steps 14.1–14.9).
 *
 * Data-access layer (SRP). Persistence only — no stock business rules.
 */
export class InventoryRepository {
    private readonly inventoryModel: Model<IInventoryDocument>;
    private readonly stockMovementModel: Model<IStockMovementDocument>;
    private readonly stockReservationModel: Model<IStockReservationDocument>;
    private readonly lowStockAlertModel: Model<ILowStockAlertDocument>;

    constructor(
        inventoryModel: Model<IInventoryDocument> = Inventory,
        stockMovementModel: Model<IStockMovementDocument> = StockMovement,
        stockReservationModel: Model<IStockReservationDocument> = StockReservation,
        lowStockAlertModel: Model<ILowStockAlertDocument> = LowStockAlert
    ) {
        this.inventoryModel = inventoryModel;
        this.stockMovementModel = stockMovementModel;
        this.stockReservationModel = stockReservationModel;
        this.lowStockAlertModel = lowStockAlertModel;
    }

    /**
     * Placeholder — create inventory item / warehouse stock row.
     */
    async create(_data: unknown): Promise<unknown> {
        throw new Error("InventoryRepository.create is not implemented yet.");
    }

    /**
     * Finds an Inventory document by id.
     */
    async findById(id: string): Promise<IInventoryDocument | null> {
        if (!Types.ObjectId.isValid(id)) {
            return null;
        }

        return this.inventoryModel.findById(id).exec();
    }

    /**
     * Paginated inventory listing with optional filters / SKU search.
     */
    async findInventoryList(
        query: InventoryListQuery = {}
    ): Promise<{ items: IInventoryDocument[]; total: number }> {
        const page =
            typeof query.page === "number" && query.page > 0 ? query.page : 1;
        const limit =
            typeof query.limit === "number" && query.limit > 0
                ? Math.min(query.limit, 100)
                : 20;
        const skip = (page - 1) * limit;

        const filter: QueryFilter<IInventoryDocument> = {};

        if (query.warehouseId && Types.ObjectId.isValid(query.warehouseId)) {
            filter.warehouseId = query.warehouseId;
        }

        if (query.product && Types.ObjectId.isValid(query.product)) {
            filter.product = query.product;
        }

        if (query.variant && Types.ObjectId.isValid(query.variant)) {
            filter.variant = query.variant;
        }

        if (typeof query.isActive === "boolean") {
            filter.isActive = query.isActive;
        }

        if (query.search?.trim()) {
            const escaped = query.search
                .trim()
                .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            filter.sku = { $regex: escaped, $options: "i" };
        }

        const [items, total] = await Promise.all([
            this.inventoryModel
                .find(filter)
                .sort({ updatedAt: -1 })
                .skip(skip)
                .limit(limit)
                .exec(),
            this.inventoryModel.countDocuments(filter).exec(),
        ]);

        return { items, total };
    }

    /**
     * Placeholder — find stock for product at a warehouse.
     */
    async findByProductAndWarehouse(
        _productId: string,
        _warehouseId: string
    ): Promise<unknown | null> {
        throw new Error(
            "InventoryRepository.findByProductAndWarehouse is not implemented yet."
        );
    }

    /**
     * Placeholder — list inventory for a product (multi-location).
     */
    async findByProduct(_productId: string): Promise<unknown[]> {
        throw new Error(
            "InventoryRepository.findByProduct is not implemented yet."
        );
    }

    /**
     * Updates an Inventory document by id.
     */
    async updateById(
        id: string,
        data: IUpdateInventory | UpdateQuery<IInventoryDocument>
    ): Promise<IInventoryDocument | null> {
        if (!Types.ObjectId.isValid(id)) {
            return null;
        }

        return this.inventoryModel
            .findByIdAndUpdate(id, data, {
                new: true,
                runValidators: true,
            })
            .exec();
    }

    /**
     * Persists a new stock movement ledger entry (append-only).
     */
    async createMovement(
        data: ICreateStockMovement
    ): Promise<IStockMovementDocument> {
        return this.stockMovementModel.create(data);
    }

    /**
     * Lists movements for an Inventory document, newest first.
     */
    async getMovementsByInventory(
        inventoryId: string
    ): Promise<IStockMovementDocument[]> {
        if (!Types.ObjectId.isValid(inventoryId)) {
            return [];
        }

        return this.stockMovementModel
            .find({ inventory: inventoryId })
            .sort({ createdAt: -1 })
            .exec();
    }

    /**
     * Paginated movements for an Inventory document with optional type filter.
     */
    async findMovementsByInventory(
        query: InventoryMovementListQuery
    ): Promise<{ items: IStockMovementDocument[]; total: number }> {
        if (!Types.ObjectId.isValid(query.inventoryId)) {
            return { items: [], total: 0 };
        }

        const page =
            typeof query.page === "number" && query.page > 0 ? query.page : 1;
        const limit =
            typeof query.limit === "number" && query.limit > 0
                ? Math.min(query.limit, 100)
                : 20;
        const skip = (page - 1) * limit;

        const filter: QueryFilter<IStockMovementDocument> = {
            inventory: query.inventoryId,
        };

        if (query.movementType?.trim()) {
            const movementType = query.movementType
                .trim()
                .toUpperCase() as StockMovementType;
            if (Object.values(StockMovementType).includes(movementType)) {
                filter.movementType = movementType;
            }
        }

        const [items, total] = await Promise.all([
            this.stockMovementModel
                .find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .exec(),
            this.stockMovementModel.countDocuments(filter).exec(),
        ]);

        return { items, total };
    }

    /**
     * Lists movements for a Product, newest first.
     */
    async getMovementsByProduct(
        productId: string
    ): Promise<IStockMovementDocument[]> {
        if (!Types.ObjectId.isValid(productId)) {
            return [];
        }

        return this.stockMovementModel
            .find({ product: productId })
            .sort({ createdAt: -1 })
            .exec();
    }

    /**
     * Persists a new stock reservation.
     */
    async createReservation(
        data: ICreateStockReservation
    ): Promise<IStockReservationDocument> {
        return this.stockReservationModel.create(data);
    }

    /**
     * Finds a reservation by id.
     */
    async findReservationById(
        id: string
    ): Promise<IStockReservationDocument | null> {
        if (!Types.ObjectId.isValid(id)) {
            return null;
        }

        return this.stockReservationModel.findById(id).exec();
    }

    /**
     * Finds reservations by business reference.
     */
    async getReservationByReference(
        referenceType: string,
        referenceId: string
    ): Promise<IStockReservationDocument[]> {
        if (!referenceType?.trim() || !Types.ObjectId.isValid(referenceId)) {
            return [];
        }

        return this.stockReservationModel
            .find({
                referenceType: referenceType.trim().toUpperCase(),
                referenceId,
            })
            .sort({ createdAt: -1 })
            .exec();
    }

    /**
     * Sets reservation status to RELEASED (data access only).
     */
    async releaseReservation(
        id: string,
        updatedBy?: Types.ObjectId | string
    ): Promise<IStockReservationDocument | null> {
        if (!Types.ObjectId.isValid(id)) {
            return null;
        }

        return this.stockReservationModel
            .findByIdAndUpdate(
                id,
                {
                    $set: {
                        status: StockReservationStatus.RELEASED,
                        ...(updatedBy ? { updatedBy } : {}),
                    },
                },
                { new: true, runValidators: true }
            )
            .exec();
    }

    /**
     * Sets reservation status to CONSUMED (data access only).
     */
    async consumeReservation(
        id: string,
        updatedBy?: Types.ObjectId | string
    ): Promise<IStockReservationDocument | null> {
        if (!Types.ObjectId.isValid(id)) {
            return null;
        }

        return this.stockReservationModel
            .findByIdAndUpdate(
                id,
                {
                    $set: {
                        status: StockReservationStatus.CONSUMED,
                        ...(updatedBy ? { updatedBy } : {}),
                    },
                },
                { new: true, runValidators: true }
            )
            .exec();
    }

    /**
     * Persists a new low stock alert.
     */
    async createLowStockAlert(
        data: ICreateLowStockAlert
    ): Promise<ILowStockAlertDocument> {
        return this.lowStockAlertModel.create(data);
    }

    /**
     * Finds an alert by id.
     */
    async findLowStockAlertById(
        id: string
    ): Promise<ILowStockAlertDocument | null> {
        if (!Types.ObjectId.isValid(id)) {
            return null;
        }

        return this.lowStockAlertModel.findById(id).exec();
    }

    /**
     * Lists ACTIVE low stock alerts, newest first.
     */
    async getActiveAlerts(): Promise<ILowStockAlertDocument[]> {
        return this.lowStockAlertModel
            .find({ status: LowStockAlertStatus.ACTIVE })
            .sort({ triggeredAt: -1 })
            .exec();
    }

    /**
     * Finds the ACTIVE alert for an Inventory row, if any.
     */
    async findActiveAlertByInventory(
        inventoryId: string
    ): Promise<ILowStockAlertDocument | null> {
        if (!Types.ObjectId.isValid(inventoryId)) {
            return null;
        }

        return this.lowStockAlertModel
            .findOne({
                inventory: inventoryId,
                status: LowStockAlertStatus.ACTIVE,
            })
            .exec();
    }

    /**
     * Sets alert status to RESOLVED (data access only).
     */
    async resolveAlert(
        id: string,
        updatedBy?: Types.ObjectId | string
    ): Promise<ILowStockAlertDocument | null> {
        if (!Types.ObjectId.isValid(id)) {
            return null;
        }

        return this.lowStockAlertModel
            .findByIdAndUpdate(
                id,
                {
                    $set: {
                        status: LowStockAlertStatus.RESOLVED,
                        resolvedAt: new Date(),
                        ...(updatedBy ? { updatedBy } : {}),
                    },
                },
                { new: true, runValidators: true }
            )
            .exec();
    }

    /**
     * Aggregates inventory summary metrics (read-only).
     */
    async aggregateInventorySummary(): Promise<{
        totalInventoryRecords: number;
        totalProducts: number;
        totalAvailableStock: number;
        totalReservedStock: number;
        totalStock: number;
        activeLowStockAlerts: number;
    }> {
        const [inventoryAgg, activeLowStockAlerts] = await Promise.all([
            this.inventoryModel
                .aggregate<{
                    totalInventoryRecords: number;
                    totalProducts: number;
                    totalAvailableStock: number;
                    totalReservedStock: number;
                    totalStock: number;
                }>([
                    {
                        $group: {
                            _id: null,
                            totalInventoryRecords: { $sum: 1 },
                            products: { $addToSet: "$product" },
                            totalAvailableStock: { $sum: "$availableStock" },
                            totalReservedStock: { $sum: "$reservedStock" },
                            totalStock: { $sum: "$totalStock" },
                        },
                    },
                    {
                        $project: {
                            _id: 0,
                            totalInventoryRecords: 1,
                            totalProducts: { $size: "$products" },
                            totalAvailableStock: 1,
                            totalReservedStock: 1,
                            totalStock: 1,
                        },
                    },
                ])
                .exec(),
            this.lowStockAlertModel
                .countDocuments({ status: LowStockAlertStatus.ACTIVE })
                .exec(),
        ]);

        const row = inventoryAgg[0];

        return {
            totalInventoryRecords: row?.totalInventoryRecords ?? 0,
            totalProducts: row?.totalProducts ?? 0,
            totalAvailableStock: row?.totalAvailableStock ?? 0,
            totalReservedStock: row?.totalReservedStock ?? 0,
            totalStock: row?.totalStock ?? 0,
            activeLowStockAlerts,
        };
    }

    /**
     * Paginated low-stock inventory rows (availableStock <= reorderLevel).
     */
    async aggregateLowStockReport(
        page = 1,
        limit = 20
    ): Promise<{
        items: Array<{
            inventory: Types.ObjectId;
            product: Types.ObjectId;
            variant?: Types.ObjectId;
            warehouseId?: Types.ObjectId;
            currentStock: number;
            reorderLevel: number;
            sku?: string;
        }>;
        total: number;
    }> {
        const safePage = page > 0 ? page : 1;
        const safeLimit = limit > 0 ? Math.min(limit, 100) : 20;
        const skip = (safePage - 1) * safeLimit;

        const match = {
            $expr: { $lte: ["$availableStock", "$reorderLevel"] },
        };

        const [items, countRows] = await Promise.all([
            this.inventoryModel
                .aggregate<{
                    inventory: Types.ObjectId;
                    product: Types.ObjectId;
                    variant?: Types.ObjectId;
                    warehouseId?: Types.ObjectId;
                    currentStock: number;
                    reorderLevel: number;
                    sku?: string;
                }>([
                    { $match: match },
                    { $sort: { availableStock: 1, updatedAt: -1 } },
                    { $skip: skip },
                    { $limit: safeLimit },
                    {
                        $project: {
                            _id: 0,
                            inventory: "$_id",
                            product: 1,
                            variant: 1,
                            warehouseId: 1,
                            currentStock: "$availableStock",
                            reorderLevel: 1,
                            sku: 1,
                        },
                    },
                ])
                .exec(),
            this.inventoryModel
                .aggregate<{ total: number }>([
                    { $match: match },
                    { $count: "total" },
                ])
                .exec(),
        ]);

        return {
            items,
            total: countRows[0]?.total ?? 0,
        };
    }

    /**
     * Aggregates movement analytics by type (read-only).
     */
    async aggregateMovementAnalytics(filters: {
        movementType?: string;
        startDate?: Date;
        endDate?: Date;
        warehouseId?: string;
    }): Promise<{
        totalMovements: number;
        totalIn: number;
        totalOut: number;
        totalReserve: number;
        totalRelease: number;
        totalAdjustment: number;
    }> {
        const match: QueryFilter<IStockMovementDocument> = {};

        if (filters.movementType) {
            const movementType =
                filters.movementType.toUpperCase() as StockMovementType;
            if (Object.values(StockMovementType).includes(movementType)) {
                match.movementType = movementType;
            }
        }

        if (filters.warehouseId && Types.ObjectId.isValid(filters.warehouseId)) {
            match.warehouseId = new Types.ObjectId(filters.warehouseId);
        }

        if (filters.startDate || filters.endDate) {
            const createdAt: { $gte?: Date; $lte?: Date } = {};
            if (filters.startDate) {
                createdAt.$gte = filters.startDate;
            }
            if (filters.endDate) {
                createdAt.$lte = filters.endDate;
            }
            match.createdAt = createdAt;
        }

        const rows = await this.stockMovementModel
            .aggregate<{
                _id: string | null;
                count: number;
            }>([
                { $match: match },
                {
                    $group: {
                        _id: "$movementType",
                        count: { $sum: 1 },
                    },
                },
            ])
            .exec();

        const counts: Record<string, number> = {};
        let totalMovements = 0;

        for (const row of rows) {
            const key = row._id ?? "";
            counts[key] = row.count;
            totalMovements += row.count;
        }

        return {
            totalMovements,
            totalIn: counts[StockMovementType.IN] ?? 0,
            totalOut: counts[StockMovementType.OUT] ?? 0,
            totalReserve: counts[StockMovementType.RESERVE] ?? 0,
            totalRelease: counts[StockMovementType.RELEASE] ?? 0,
            totalAdjustment: counts[StockMovementType.ADJUSTMENT] ?? 0,
        };
    }

    /**
     * Reservation status counts + paginated reservation rows (read-only).
     */
    async aggregateReservationReport(
        page = 1,
        limit = 20
    ): Promise<{
        counts: {
            ACTIVE: number;
            RELEASED: number;
            CONSUMED: number;
        };
        items: IStockReservationDocument[];
        total: number;
    }> {
        const safePage = page > 0 ? page : 1;
        const safeLimit = limit > 0 ? Math.min(limit, 100) : 20;
        const skip = (safePage - 1) * safeLimit;

        const [statusRows, items, total] = await Promise.all([
            this.stockReservationModel
                .aggregate<{ _id: string; count: number }>([
                    {
                        $group: {
                            _id: "$status",
                            count: { $sum: 1 },
                        },
                    },
                ])
                .exec(),
            this.stockReservationModel
                .find()
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(safeLimit)
                .exec(),
            this.stockReservationModel.countDocuments().exec(),
        ]);

        const counts = {
            ACTIVE: 0,
            RELEASED: 0,
            CONSUMED: 0,
        };

        for (const row of statusRows) {
            if (row._id === StockReservationStatus.ACTIVE) {
                counts.ACTIVE = row.count;
            } else if (row._id === StockReservationStatus.RELEASED) {
                counts.RELEASED = row.count;
            } else if (row._id === StockReservationStatus.CONSUMED) {
                counts.CONSUMED = row.count;
            }
        }

        return { counts, items, total };
    }
}
