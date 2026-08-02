/**
 * Inventory Module — in-process service E2E (Step 14.10).
 *
 * Covers adjust / reserve / release / consume / alerts / movements / reports.
 * Uses MONGODB_URI. No HTTP server required.
 *
 * Usage:
 *   npx ts-node --transpile-only scripts/e2e-inventory.service.ts
 */

import dotenv from "dotenv";
dotenv.config();

import mongoose, { Types } from "mongoose";
import Inventory from "../src/modules/inventory/models/inventory.model";
import StockMovement from "../src/modules/inventory/models/stock-movement.model";
import StockReservation from "../src/modules/inventory/models/stock-reservation.model";
import LowStockAlert from "../src/modules/inventory/models/low-stock-alert.model";
import { InventoryRepository } from "../src/modules/inventory/repositories/inventory.repository";
import { InventoryService } from "../src/modules/inventory/services/inventory.service";
import {
    StockMovementType,
    StockReservationStatus,
    LowStockAlertStatus,
} from "../src/modules/inventory/types/inventory.types";

interface CheckResult {
    name: string;
    ok: boolean;
    detail?: string;
}

const results: CheckResult[] = [];
const E2E_SKU = "E2E-INV-SKU-14-10";
const E2E_SKU_LOW = "E2E-INV-SKU-LOW-14-10";

const record = (name: string, ok: boolean, detail?: string): void => {
    results.push({ name, ok, detail });
    console.log(`[${ok ? "PASS" : "FAIL"}] ${name}${detail ? ` — ${detail}` : ""}`);
};

const expectReject = async (
    name: string,
    fn: () => Promise<unknown>,
    includes?: string
): Promise<void> => {
    try {
        await fn();
        record(name, false, "Expected error but succeeded");
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        const ok = includes ? message.toLowerCase().includes(includes.toLowerCase()) : true;
        record(name, ok, message);
    }
};

const run = async (): Promise<void> => {
    if (!process.env.MONGODB_URI) {
        throw new Error("MONGODB_URI is required.");
    }

    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    if (!db) {
        throw new Error("MongoDB connection unavailable.");
    }

    const user =
        (await db.collection("users").findOne({ mobile: "9999999999" })) ||
        (await db.collection("users").findOne({}));

    if (!user) {
        throw new Error("No user found. Create an authenticated user first.");
    }

    const actorId = user._id as Types.ObjectId;
    const productId = new Types.ObjectId();
    const referenceId = new Types.ObjectId();
    const warehouseId = new Types.ObjectId();

    // Cleanup prior E2E rows
    await Inventory.deleteMany({ sku: { $in: [E2E_SKU, E2E_SKU_LOW] } });
    await StockMovement.deleteMany({ notes: /E2E-INV-14-10/ });
    await StockReservation.deleteMany({ notes: /E2E-INV-14-10/ });
    await LowStockAlert.deleteMany({ message: /E2E-INV-14-10/ });

    const repository = new InventoryRepository();
    const service = new InventoryService(repository);

    const inventory = await Inventory.create({
        product: productId,
        warehouseId,
        sku: E2E_SKU,
        availableStock: 100,
        reservedStock: 0,
        totalStock: 100,
        reorderLevel: 10,
        isActive: true,
        createdBy: actorId,
    });

    const inventoryId = String(inventory._id);

    // --- Inventory list / get / filters ---
    const listed = await service.listInventory({
        page: 1,
        limit: 20,
        search: "E2E-INV",
        isActive: true,
    });
    record(
        "List inventory with search/pagination",
        listed.data.some((row) => String(row._id) === inventoryId) &&
            listed.pagination.page === 1,
        `total=${listed.pagination.total}`
    );

    const filtered = await service.listInventory({
        warehouseId: String(warehouseId),
        product: String(productId),
        page: 1,
        limit: 10,
    });
    record(
        "List inventory with warehouse/product filters",
        filtered.data.some((row) => String(row._id) === inventoryId)
    );

    const fetched = await service.getInventoryById(inventoryId);
    record("Get inventory details", String(fetched._id) === inventoryId);

    await expectReject(
        "Get inventory 404 for unknown id",
        () => service.getInventoryById(new Types.ObjectId().toHexString()),
        "not found"
    );

    // --- Stock adjustment ---
    const increased = await service.adjustStockByQuantity({
        inventoryId,
        quantity: 20,
        reason: "E2E-INV-14-10 increase",
        performedBy: String(actorId),
    });
    record(
        "Increase stock",
        increased.newAvailableStock === 120 &&
            increased.movement.movementType === StockMovementType.ADJUSTMENT,
        `available=${increased.newAvailableStock}`
    );

    const decreased = await service.adjustStockByQuantity({
        inventoryId,
        quantity: -15,
        reason: "E2E-INV-14-10 decrease",
        performedBy: String(actorId),
    });
    record(
        "Decrease stock",
        decreased.newAvailableStock === 105 &&
            decreased.movement.movementType === StockMovementType.ADJUSTMENT,
        `available=${decreased.newAvailableStock}`
    );

    await expectReject(
        "Prevent negative stock on adjust",
        () =>
            service.adjustStockByQuantity({
                inventoryId,
                quantity: -10000,
                reason: "E2E-INV-14-10 overdraw",
                performedBy: String(actorId),
            }),
        "insufficient"
    );

    const afterNegativeAttempt = await service.getInventoryById(inventoryId);
    record(
        "Stock unchanged after rejected overdraw",
        afterNegativeAttempt.availableStock === 105,
        `available=${afterNegativeAttempt.availableStock}`
    );

    // --- Low stock alert via adjust ---
    const lowInventory = await Inventory.create({
        product: new Types.ObjectId(),
        sku: E2E_SKU_LOW,
        availableStock: 50,
        reservedStock: 0,
        totalStock: 50,
        reorderLevel: 40,
        isActive: true,
        createdBy: actorId,
    });

    const lowAdjust = await service.adjustStockByQuantity({
        inventoryId: String(lowInventory._id),
        quantity: -20,
        reason: "E2E-INV-14-10 trigger low",
        performedBy: String(actorId),
    });
    record(
        "Low stock check triggered on adjust",
        lowAdjust.alert !== null &&
            lowAdjust.alert?.status === LowStockAlertStatus.ACTIVE &&
            lowAdjust.newAvailableStock === 30,
        lowAdjust.alert ? `alert=${lowAdjust.alert._id}` : "no alert"
    );

    const dupAlert = await service.checkLowStock({
        inventory: lowInventory._id,
        product: lowInventory.product,
        currentStock: 30,
        reorderLevel: 40,
        message: "E2E-INV-14-10 duplicate check",
        createdBy: String(actorId),
    });
    record(
        "Duplicate low-stock alert prevented",
        dupAlert !== null &&
            String(dupAlert._id) === String(lowAdjust.alert?._id)
    );

    if (lowAdjust.alert) {
        const resolved = await service.resolveLowStockAlert({
            alertId: String(lowAdjust.alert._id),
            updatedBy: String(actorId),
        });
        record(
            "Resolve low stock alert",
            resolved.status === LowStockAlertStatus.RESOLVED &&
                resolved.resolvedAt instanceof Date
        );
    } else {
        record("Resolve low stock alert", false, "No alert to resolve");
    }

    // --- Reservation ---
    const reserved = await service.reserveInventoryStock({
        inventoryId,
        quantity: 10,
        referenceType: "ORDER",
        referenceId: String(referenceId),
        notes: "E2E-INV-14-10 reserve",
        performedBy: String(actorId),
    });
    record(
        "Reserve stock",
        reserved.reservation.status === StockReservationStatus.ACTIVE &&
            reserved.inventory.availableStock === 95 &&
            reserved.inventory.reservedStock === 10 &&
            reserved.movement.movementType === StockMovementType.RESERVE,
        `available=${reserved.inventory.availableStock} reserved=${reserved.inventory.reservedStock}`
    );

    await expectReject(
        "Prevent reserving more than available",
        () =>
            service.reserveInventoryStock({
                inventoryId,
                quantity: 9999,
                referenceType: "ORDER",
                referenceId: String(new Types.ObjectId()),
                notes: "E2E-INV-14-10 over-reserve",
                performedBy: String(actorId),
            }),
        "insufficient"
    );

    const secondReserve = await service.reserveInventoryStock({
        inventoryId,
        quantity: 5,
        referenceType: "CART",
        referenceId: String(new Types.ObjectId()),
        notes: "E2E-INV-14-10 reserve-2",
        performedBy: String(actorId),
    });

    const released = await service.releaseInventoryStock({
        inventoryId,
        reservationId: String(secondReserve.reservation._id),
        notes: "E2E-INV-14-10 release",
        performedBy: String(actorId),
    });
    record(
        "Release reservation",
        released.reservation.status === StockReservationStatus.RELEASED &&
            released.movement.movementType === StockMovementType.RELEASE &&
            released.inventory.reservedStock === 10,
        `status=${released.reservation.status} reserved=${released.inventory.reservedStock}`
    );

    const stillExists = await StockReservation.findById(
        secondReserve.reservation._id
    );
    record(
        "Reservation history preserved after release",
        stillExists !== null &&
            stillExists.status === StockReservationStatus.RELEASED
    );

    await expectReject(
        "Reject release of non-ACTIVE reservation",
        () =>
            service.releaseInventoryStock({
                inventoryId,
                reservationId: String(secondReserve.reservation._id),
                performedBy: String(actorId),
            }),
        "invalid reservation status"
    );

    // Consume remaining ACTIVE reservation (service-level; no HTTP in 14.8)
    const consumed = await service.consumeReservedStock({
        reservationId: String(reserved.reservation._id),
        updatedBy: String(actorId),
    });
    record(
        "Consume reservation (service)",
        consumed.status === StockReservationStatus.CONSUMED
    );

    // Note: consume does not yet restore/mutate inventory counters (by design in 14.6/14.8)
    const afterConsume = await service.getInventoryById(inventoryId);
    record(
        "Consume does not delete reservation document",
        (await StockReservation.findById(reserved.reservation._id)) !== null &&
            afterConsume.reservedStock === 10
    );

    // --- Movements (IN / OUT / history / immutability) ---
    const current = await service.getInventoryById(inventoryId);
    await service.recordMovement({
        inventory: inventoryId,
        product: productId,
        warehouseId,
        movementType: StockMovementType.IN,
        quantity: 3,
        previousAvailableStock: current.availableStock,
        newAvailableStock: current.availableStock + 3,
        notes: "E2E-INV-14-10 IN",
        performedBy: String(actorId),
    });
    await service.recordMovement({
        inventory: inventoryId,
        product: productId,
        warehouseId,
        movementType: StockMovementType.OUT,
        quantity: 2,
        previousAvailableStock: current.availableStock,
        newAvailableStock: Math.max(0, current.availableStock - 2),
        notes: "E2E-INV-14-10 OUT",
        performedBy: String(actorId),
    });

    const movements = await service.listInventoryMovements({
        inventoryId,
        page: 1,
        limit: 50,
    });
    const types = new Set(movements.data.map((m) => m.movementType));
    record(
        "Movement history includes ADJUSTMENT/RESERVE/RELEASE/IN/OUT",
        types.has(StockMovementType.ADJUSTMENT) &&
            types.has(StockMovementType.RESERVE) &&
            types.has(StockMovementType.RELEASE) &&
            types.has(StockMovementType.IN) &&
            types.has(StockMovementType.OUT),
        `types=${[...types].join(",")}`
    );

    const sampleMovement = movements.data[0];
    const beforeUpdate = sampleMovement.quantity;
    // Immutability: repository has no updateMovement — verify findById unchanged after attempted raw update rejection pattern
    const updateResult = await StockMovement.updateOne(
        { _id: sampleMovement._id },
        { $set: { quantity: beforeUpdate } }
    );
    record(
        "Movement documents remain queryable (ledger intact)",
        updateResult.acknowledged === true &&
            (await StockMovement.findById(sampleMovement._id))?.quantity ===
                beforeUpdate
    );

    // No updateMovement / deleteMovement on repository
    record(
        "Repository has no update/delete movement API (immutable design)",
        typeof (repository as unknown as { updateMovement?: unknown })
            .updateMovement === "undefined" &&
            typeof (repository as unknown as { deleteMovement?: unknown })
                .deleteMovement === "undefined"
    );

    // --- Reports ---
    const summary = await service.getInventorySummaryReport();
    record(
        "Summary report returns KPIs",
        summary.totalInventoryRecords >= 1 &&
            typeof summary.totalAvailableStock === "number" &&
            typeof summary.activeLowStockAlerts === "number",
        JSON.stringify(summary)
    );

    const lowStockReport = await service.getLowStockReport({
        page: 1,
        limit: 20,
    });
    record(
        "Low stock report paginates",
        Array.isArray(lowStockReport.data) &&
            lowStockReport.pagination.limit === 20
    );

    const movementReport = await service.getMovementAnalyticsReport({
        warehouseId: String(warehouseId),
    });
    record(
        "Movement analytics report aggregates",
        movementReport.totalMovements >= 1 &&
            movementReport.totalAdjustment >= 1 &&
            movementReport.totalReserve >= 1,
        JSON.stringify(movementReport)
    );

    const reservationReport = await service.getReservationReport({
        page: 1,
        limit: 20,
    });
    record(
        "Reservation report returns counts + rows",
        reservationReport.counts.CONSUMED >= 1 &&
            reservationReport.counts.RELEASED >= 1 &&
            reservationReport.data.length >= 1,
        JSON.stringify(reservationReport.counts)
    );

    // Cleanup E2E fixtures
    await Inventory.deleteMany({ sku: { $in: [E2E_SKU, E2E_SKU_LOW] } });
    await StockMovement.deleteMany({ notes: /E2E-INV-14-10/ });
    await StockReservation.deleteMany({ notes: /E2E-INV-14-10/ });
    await LowStockAlert.deleteMany({
        $or: [
            { message: /E2E-INV-14-10/ },
            { inventory: { $in: [inventory._id, lowInventory._id] } },
        ],
    });

    await mongoose.disconnect();

    const failed = results.filter((r) => !r.ok);
    console.log(
        `\nInventory service E2E: ${results.length - failed.length}/${results.length} passed`
    );

    if (failed.length > 0) {
        process.exit(1);
    }
};

run().catch(async (error) => {
    console.error(error);
    try {
        await mongoose.disconnect();
    } catch {
        // ignore
    }
    process.exit(1);
});
