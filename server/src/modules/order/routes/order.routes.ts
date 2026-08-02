import { Request, Router } from "express";
import { authenticate } from "../../../middleware/auth.middleware";
import { authorize, ROLES } from "../../../middleware/role.middleware";
import { validateRequest } from "../../../middleware/validate.middleware";
import { ProductRepository } from "../../../repositories/product.repository";
import { InventoryRepository } from "../../inventory/repositories/inventory.repository";
import { VariantRepository } from "../../variant/variant.repository";
import { OrderController } from "../controllers/order.controller";
import { OrderRepository } from "../repositories/order.repository";
import { OrderService } from "../services/order.service";
import {
    createOrderSchema,
    getOrderByIdSchema,
    listOrdersQuerySchema,
    orderReportQuerySchema,
    updateOrderStatusSchema,
} from "../validations/order.validation";

/**
 * Enterprise Order Routes — composition root (Steps 15.4–15.8).
 *
 * Mount under: /api/v1/orders
 *
 * Report paths are registered before /:id so "reports" is not captured as an id.
 */

const orderRepository = new OrderRepository();
const productRepository = new ProductRepository();
const variantRepository = new VariantRepository();
const inventoryRepository = new InventoryRepository();
const orderService = new OrderService(
    orderRepository,
    productRepository,
    variantRepository,
    inventoryRepository
);
const orderController = new OrderController(orderService);

const router = Router();

/**
 * POST /orders
 * Roles: CUSTOMER, ADMIN, SUPER_ADMIN
 */
router.post(
    "/",
    authenticate,
    authorize(ROLES.CUSTOMER, ROLES.ADMIN, ROLES.SUPER_ADMIN),
    ...createOrderSchema,
    validateRequest,
    (req, res, next) =>
        orderController.createOrder(req as Request, res, next)
);

/**
 * GET /orders
 * Roles: CUSTOMER (own), ADMIN / SUPER_ADMIN (all + filters)
 */
router.get(
    "/",
    authenticate,
    authorize(ROLES.CUSTOMER, ROLES.ADMIN, ROLES.SUPER_ADMIN),
    ...listOrdersQuerySchema,
    validateRequest,
    (req, res, next) =>
        orderController.listOrders(req as Request, res, next)
);

/**
 * GET /orders/reports/* — ADMIN / SUPER_ADMIN only (Step 15.8)
 */
router.get(
    "/reports/summary",
    authenticate,
    authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN),
    ...orderReportQuerySchema,
    validateRequest,
    (req, res, next) =>
        orderController.getOrderSummaryReport(req as Request, res, next)
);

router.get(
    "/reports/revenue",
    authenticate,
    authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN),
    ...orderReportQuerySchema,
    validateRequest,
    (req, res, next) =>
        orderController.getRevenueReport(req as Request, res, next)
);

router.get(
    "/reports/status",
    authenticate,
    authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN),
    ...orderReportQuerySchema,
    validateRequest,
    (req, res, next) =>
        orderController.getOrdersByStatusReport(req as Request, res, next)
);

router.get(
    "/reports/daily",
    authenticate,
    authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN),
    ...orderReportQuerySchema,
    validateRequest,
    (req, res, next) =>
        orderController.getDailyOrdersReport(req as Request, res, next)
);

router.get(
    "/reports/monthly",
    authenticate,
    authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN),
    ...orderReportQuerySchema,
    validateRequest,
    (req, res, next) =>
        orderController.getMonthlyOrdersReport(req as Request, res, next)
);

/**
 * GET /orders/:id
 * Roles: CUSTOMER (own), ADMIN / SUPER_ADMIN (any)
 */
router.get(
    "/:id",
    authenticate,
    authorize(ROLES.CUSTOMER, ROLES.ADMIN, ROLES.SUPER_ADMIN),
    ...getOrderByIdSchema,
    validateRequest,
    (req, res, next) =>
        orderController.getOrderById(req as Request, res, next)
);

/**
 * PATCH /orders/:id/status
 * Roles: ADMIN, SUPER_ADMIN
 */
router.patch(
    "/:id/status",
    authenticate,
    authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN),
    ...updateOrderStatusSchema,
    validateRequest,
    (req, res, next) =>
        orderController.updateOrderStatus(req as Request, res, next)
);

export default router;
export { orderRepository, orderService, orderController };
