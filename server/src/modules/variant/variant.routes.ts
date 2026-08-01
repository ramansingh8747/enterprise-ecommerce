import { Router } from "express";
import { body } from "express-validator";
import { authenticate } from "../../middleware/auth.middleware";
import { authorize, ROLES } from "../../middleware/role.middleware";
import { validateRequest } from "../../middleware/validate.middleware";
import { VariantController } from "./variant.controller";
import { VariantRepository } from "./variant.repository";
import { VariantService } from "./variant.service";
import {
    createVariantSchema,
    deleteVariantSchema,
    getVariantByIdSchema,
    getVariantsQuerySchema,
    productIdParamSchema,
    updateVariantSchema,
    variantIdParamSchema,
} from "./variant.validation";

/**
 * Enterprise Product Variant Routes.
 *
 * HTTP route wiring for the Variant module.
 * Composes auth, RBAC, validators, and controller handlers only.
 *
 * Mount under: /api/v1/variants
 *
 * Nested product variants:
 * Mount `productVariantRoutes` under: /api/v1/products
 * → GET /api/v1/products/:productId/variants
 */

const variantRepository = new VariantRepository();
const variantService = new VariantService(variantRepository);
const variantController = new VariantController(variantService);

const router = Router();

/**
 * PATCH /variants/:id/stock
 * Supports absolute set (`stock`) or delta ops (`operation` + `quantity`).
 */
const updateVariantStockSchema = [
    ...variantIdParamSchema,
    body("operation")
        .optional()
        .isString()
        .withMessage("operation must be a string.")
        .trim()
        .toLowerCase()
        .isIn(["set", "increase", "decrease"])
        .withMessage("operation must be one of: set, increase, decrease."),
    body("stock")
        .optional()
        .isInt({ min: 0 })
        .withMessage(
            "Variant stock must be an integer greater than or equal to 0."
        )
        .toInt(),
    body("quantity")
        .optional()
        .isInt({ min: 1 })
        .withMessage("quantity must be an integer greater than or equal to 1.")
        .toInt(),
    body().custom((_, { req }) => {
        const payload =
            req.body && typeof req.body === "object"
                ? (req.body as Record<string, unknown>)
                : {};

        const operation =
            typeof payload.operation === "string"
                ? payload.operation.toLowerCase()
                : "set";

        if (operation === "set") {
            if (payload.stock === undefined || payload.stock === null) {
                throw new Error(
                    "Variant stock is required when operation is set."
                );
            }
            return true;
        }

        if (payload.quantity === undefined || payload.quantity === null) {
            throw new Error(
                "quantity is required when operation is increase or decrease."
            );
        }

        return true;
    }),
];

/**
 * ---------------------------------------------------------
 * Authenticated view routes (ADMIN, SUPER_ADMIN)
 * Middleware order: Authentication → Authorization → Validation → Controller
 * ---------------------------------------------------------
 */

/**
 * GET /variants
 */
router.get(
    "/",
    authenticate,
    authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN),
    ...getVariantsQuerySchema,
    validateRequest,
    (req, res, next) => variantController.getAllVariants(req, res, next)
);

/**
 * PATCH /variants/:id/stock
 * Roles: ADMIN, SUPER_ADMIN
 * Registered before /:id so the static segment is matched first.
 */
router.patch(
    "/:id/stock",
    authenticate,
    authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN),
    ...updateVariantStockSchema,
    validateRequest,
    (req, res, next) => variantController.updateVariantStock(req, res, next)
);

/**
 * GET /variants/:id
 */
router.get(
    "/:id",
    authenticate,
    authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN),
    ...getVariantByIdSchema,
    validateRequest,
    (req, res, next) => variantController.getVariantById(req, res, next)
);

/**
 * POST /variants
 * Roles: ADMIN, SUPER_ADMIN
 */
router.post(
    "/",
    authenticate,
    authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN),
    ...createVariantSchema,
    validateRequest,
    (req, res, next) => variantController.createVariant(req, res, next)
);

/**
 * PUT /variants/:id
 * Roles: ADMIN, SUPER_ADMIN
 */
router.put(
    "/:id",
    authenticate,
    authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN),
    ...variantIdParamSchema,
    ...updateVariantSchema,
    validateRequest,
    (req, res, next) => variantController.updateVariant(req, res, next)
);

/**
 * DELETE /variants/:id
 * Roles: SUPER_ADMIN only
 */
router.delete(
    "/:id",
    authenticate,
    authorize(ROLES.SUPER_ADMIN),
    ...deleteVariantSchema,
    validateRequest,
    (req, res, next) => variantController.deleteVariant(req, res, next)
);

/**
 * Nested Product → Variants router.
 * Mount under /api/v1/products (does not modify the Product module).
 *
 * GET /products/:productId/variants
 * Roles: ADMIN, SUPER_ADMIN
 */
const productVariantRoutes = Router();

productVariantRoutes.get(
    "/:productId/variants",
    authenticate,
    authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN),
    ...productIdParamSchema,
    validateRequest,
    (req, res, next) =>
        variantController.getVariantsByProduct(req, res, next)
);

export default router;
export {
    productVariantRoutes,
    variantRepository,
    variantService,
    variantController,
};
