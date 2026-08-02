import { Request, Router } from "express";
import { authenticate } from "../../../middleware/auth.middleware";
import { authorize, ROLES } from "../../../middleware/role.middleware";
import { validateRequest } from "../../../middleware/validate.middleware";
import { InventoryController } from "../controllers/inventory.controller";
import { InventoryRepository } from "../repositories/inventory.repository";
import { InventoryService } from "../services/inventory.service";
import {
    adjustInventorySchema,
    getInventoryListQuerySchema,
    getInventoryMovementsQuerySchema,
    getLowStockReportQuerySchema,
    getMovementAnalyticsQuerySchema,
    getReservationReportQuerySchema,
    inventoryIdParamSchema,
    releaseInventorySchema,
    reserveInventorySchema,
} from "../validations/inventory.validation";

/**
 * Enterprise Inventory Routes — composition root (Steps 14.8–14.9).
 *
 * Wires Repository → Service → Controller.
 * Mount under: /api/v1/inventory
 *
 * RBAC (existing role middleware — no RBAC module changes):
 * - Inventory Read     → ADMIN, SUPER_ADMIN (GET + reports)
 * - Inventory Update   → ADMIN, SUPER_ADMIN
 * - Inventory Reserve  → ADMIN, SUPER_ADMIN (reserve / release)
 * - Inventory Adjustment → ADMIN, SUPER_ADMIN (adjust)
 */

const inventoryRepository = new InventoryRepository();
const inventoryService = new InventoryService(inventoryRepository);
const inventoryController = new InventoryController(inventoryService);

const router = Router();

/**
 * Static paths before /:id
 */

/**
 * GET /inventory/reports/summary
 * Roles: ADMIN, SUPER_ADMIN (Inventory Read)
 */
router.get(
    "/reports/summary",
    authenticate,
    authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN),
    (req, res, next) =>
        inventoryController.getInventorySummaryReport(
            req as Request,
            res,
            next
        )
);

/**
 * GET /inventory/reports/low-stock
 * Roles: ADMIN, SUPER_ADMIN (Inventory Read)
 */
router.get(
    "/reports/low-stock",
    authenticate,
    authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN),
    ...getLowStockReportQuerySchema,
    validateRequest,
    (req, res, next) =>
        inventoryController.getLowStockReport(req as Request, res, next)
);

/**
 * GET /inventory/reports/movements
 * Roles: ADMIN, SUPER_ADMIN (Inventory Read)
 */
router.get(
    "/reports/movements",
    authenticate,
    authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN),
    ...getMovementAnalyticsQuerySchema,
    validateRequest,
    (req, res, next) =>
        inventoryController.getMovementAnalyticsReport(
            req as Request,
            res,
            next
        )
);

/**
 * GET /inventory/reports/reservations
 * Roles: ADMIN, SUPER_ADMIN (Inventory Read)
 */
router.get(
    "/reports/reservations",
    authenticate,
    authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN),
    ...getReservationReportQuerySchema,
    validateRequest,
    (req, res, next) =>
        inventoryController.getReservationReport(req as Request, res, next)
);

/**
 * GET /inventory/alerts
 * Roles: ADMIN, SUPER_ADMIN (Inventory Read)
 */
router.get(
    "/alerts",
    authenticate,
    authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN),
    (req, res, next) =>
        inventoryController.getLowStockAlerts(req as Request, res, next)
);

/**
 * GET /inventory
 * Roles: ADMIN, SUPER_ADMIN (Inventory Read)
 */
router.get(
    "/",
    authenticate,
    authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN),
    ...getInventoryListQuerySchema,
    validateRequest,
    (req, res, next) =>
        inventoryController.listInventory(req as Request, res, next)
);

/**
 * GET /inventory/:id/movements
 * Roles: ADMIN, SUPER_ADMIN (Inventory Read)
 */
router.get(
    "/:id/movements",
    authenticate,
    authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN),
    ...getInventoryMovementsQuerySchema,
    validateRequest,
    (req, res, next) =>
        inventoryController.getStockMovements(req as Request, res, next)
);

/**
 * PATCH /inventory/:id/adjust
 * Roles: ADMIN, SUPER_ADMIN (Inventory Adjustment)
 */
router.patch(
    "/:id/adjust",
    authenticate,
    authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN),
    ...adjustInventorySchema,
    validateRequest,
    (req, res, next) =>
        inventoryController.adjustStock(req as Request, res, next)
);

/**
 * POST /inventory/:id/reserve
 * Roles: ADMIN, SUPER_ADMIN (Inventory Reserve)
 */
router.post(
    "/:id/reserve",
    authenticate,
    authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN),
    ...reserveInventorySchema,
    validateRequest,
    (req, res, next) =>
        inventoryController.reserveStock(req as Request, res, next)
);

/**
 * POST /inventory/:id/release
 * Roles: ADMIN, SUPER_ADMIN (Inventory Reserve)
 */
router.post(
    "/:id/release",
    authenticate,
    authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN),
    ...releaseInventorySchema,
    validateRequest,
    (req, res, next) =>
        inventoryController.releaseStock(req as Request, res, next)
);

/**
 * GET /inventory/:id
 * Roles: ADMIN, SUPER_ADMIN (Inventory Read)
 */
router.get(
    "/:id",
    authenticate,
    authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN),
    ...inventoryIdParamSchema,
    validateRequest,
    (req, res, next) =>
        inventoryController.getInventoryById(req as Request, res, next)
);

export default router;
export { inventoryRepository, inventoryService, inventoryController };
