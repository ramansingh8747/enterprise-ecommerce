import { body, param, query, ValidationChain } from "express-validator";
import { StockMovementType } from "../types/inventory.types";
import { StockReservationReferenceType } from "../types/inventory.types";

/**
 * Enterprise Inventory Validation chains (Steps 14.8–14.9).
 *
 * Request-shape validation only (SRP).
 * Uses express-validator to match Brand / Product / Media style.
 */

const MOVEMENT_TYPES = Object.values(StockMovementType);
const RESERVATION_REFERENCE_TYPES = Object.values(
    StockReservationReferenceType
);

/**
 * Validate MongoDB ObjectId route param `:id`.
 */
export const inventoryIdParamSchema: ValidationChain[] = [
    param("id")
        .exists({ checkFalsy: true })
        .withMessage("Inventory id is required.")
        .isMongoId()
        .withMessage("Inventory id must be a valid Mongo ObjectId."),
];

/**
 * GET /inventory — list query validation.
 */
export const getInventoryListQuerySchema: ValidationChain[] = [
    query("page")
        .optional()
        .default(1)
        .isInt({ min: 1 })
        .withMessage("Page must be an integer greater than or equal to 1.")
        .toInt(),

    query("limit")
        .optional()
        .default(20)
        .isInt({ min: 1, max: 100 })
        .withMessage("Limit must be an integer between 1 and 100.")
        .toInt(),

    query("search")
        .optional()
        .isString()
        .withMessage("Search must be a string.")
        .trim(),

    query("warehouseId")
        .optional()
        .isMongoId()
        .withMessage("warehouseId must be a valid Mongo ObjectId."),

    query("product")
        .optional()
        .isMongoId()
        .withMessage("product must be a valid Mongo ObjectId."),

    query("variant")
        .optional()
        .isMongoId()
        .withMessage("variant must be a valid Mongo ObjectId."),

    query("isActive")
        .optional()
        .isBoolean()
        .withMessage("isActive must be a boolean.")
        .toBoolean(),
];

/**
 * PATCH /inventory/:id/adjust
 */
export const adjustInventorySchema: ValidationChain[] = [
    ...inventoryIdParamSchema,

    body("quantity")
        .exists({ checkFalsy: true })
        .withMessage("quantity is required.")
        .isFloat()
        .withMessage("quantity must be a number.")
        .custom((value) => {
            const num = Number(value);
            if (!Number.isFinite(num) || num === 0) {
                throw new Error("Invalid quantity.");
            }
            return true;
        })
        .toFloat(),

    body("reason")
        .optional()
        .isString()
        .withMessage("reason must be a string.")
        .trim()
        .isLength({ max: 1000 })
        .withMessage("reason cannot exceed 1000 characters."),
];

/**
 * POST /inventory/:id/reserve
 */
export const reserveInventorySchema: ValidationChain[] = [
    ...inventoryIdParamSchema,

    body("quantity")
        .exists({ checkFalsy: true })
        .withMessage("quantity is required.")
        .isInt({ min: 1 })
        .withMessage("quantity must be an integer greater than 0.")
        .toInt(),

    body("referenceType")
        .exists({ checkFalsy: true })
        .withMessage("referenceType is required.")
        .isString()
        .withMessage("referenceType must be a string.")
        .trim()
        .toUpperCase()
        .isIn([...RESERVATION_REFERENCE_TYPES])
        .withMessage(
            `referenceType must be one of: ${RESERVATION_REFERENCE_TYPES.join(", ")}.`
        ),

    body("referenceId")
        .exists({ checkFalsy: true })
        .withMessage("referenceId is required.")
        .isMongoId()
        .withMessage("referenceId must be a valid Mongo ObjectId."),

    body("expiresAt")
        .optional()
        .isISO8601()
        .withMessage("expiresAt must be a valid ISO 8601 date.")
        .toDate(),

    body("notes")
        .optional()
        .isString()
        .withMessage("notes must be a string.")
        .trim()
        .isLength({ max: 1000 })
        .withMessage("notes cannot exceed 1000 characters."),
];

/**
 * POST /inventory/:id/release
 */
export const releaseInventorySchema: ValidationChain[] = [
    ...inventoryIdParamSchema,

    body("reservationId")
        .exists({ checkFalsy: true })
        .withMessage("reservationId is required.")
        .isMongoId()
        .withMessage("reservationId must be a valid Mongo ObjectId."),

    body("notes")
        .optional()
        .isString()
        .withMessage("notes must be a string.")
        .trim()
        .isLength({ max: 1000 })
        .withMessage("notes cannot exceed 1000 characters."),
];

/**
 * GET /inventory/:id/movements
 */
export const getInventoryMovementsQuerySchema: ValidationChain[] = [
    ...inventoryIdParamSchema,

    query("page")
        .optional()
        .default(1)
        .isInt({ min: 1 })
        .withMessage("Page must be an integer greater than or equal to 1.")
        .toInt(),

    query("limit")
        .optional()
        .default(20)
        .isInt({ min: 1, max: 100 })
        .withMessage("Limit must be an integer between 1 and 100.")
        .toInt(),

    query("movementType")
        .optional()
        .isString()
        .withMessage("movementType must be a string.")
        .trim()
        .toUpperCase()
        .isIn([...MOVEMENT_TYPES])
        .withMessage(
            `movementType must be one of: ${MOVEMENT_TYPES.join(", ")}.`
        ),
];

/**
 * Shared pagination query for report list endpoints.
 */
const reportPaginationQuerySchema: ValidationChain[] = [
    query("page")
        .optional()
        .default(1)
        .isInt({ min: 1 })
        .withMessage("Page must be an integer greater than or equal to 1.")
        .toInt(),

    query("limit")
        .optional()
        .default(20)
        .isInt({ min: 1, max: 100 })
        .withMessage("Limit must be an integer between 1 and 100.")
        .toInt(),
];

/**
 * GET /inventory/reports/low-stock
 */
export const getLowStockReportQuerySchema: ValidationChain[] = [
    ...reportPaginationQuerySchema,
];

/**
 * GET /inventory/reports/movements
 */
export const getMovementAnalyticsQuerySchema: ValidationChain[] = [
    query("movementType")
        .optional()
        .isString()
        .withMessage("movementType must be a string.")
        .trim()
        .toUpperCase()
        .isIn([...MOVEMENT_TYPES])
        .withMessage(
            `movementType must be one of: ${MOVEMENT_TYPES.join(", ")}.`
        ),

    query("startDate")
        .optional()
        .isISO8601()
        .withMessage("startDate must be a valid ISO 8601 date.")
        .toDate(),

    query("endDate")
        .optional()
        .isISO8601()
        .withMessage("endDate must be a valid ISO 8601 date.")
        .toDate(),

    query("warehouseId")
        .optional()
        .isMongoId()
        .withMessage("warehouseId must be a valid Mongo ObjectId."),
];

/**
 * GET /inventory/reports/reservations
 */
export const getReservationReportQuerySchema: ValidationChain[] = [
    ...reportPaginationQuerySchema,
];

/**
 * @deprecated Placeholder map retained for Step 14.1 naming continuity.
 */
export const inventoryValidationPlaceholders = {
    adjust: adjustInventorySchema,
    reserve: reserveInventorySchema,
    release: releaseInventorySchema,
    listMovements: getInventoryMovementsQuerySchema,
    lowStock: getLowStockReportQuerySchema,
} as const;
