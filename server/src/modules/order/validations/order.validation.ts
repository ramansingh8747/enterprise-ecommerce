import { body, param, query, ValidationChain } from "express-validator";
import {
    ORDER_STATUSES,
    PAYMENT_STATUSES,
} from "../constants/order.constants";

/**
 * Enterprise Order Validation chains (Steps 15.4–15.7).
 *
 * Request-shape validation only (SRP).
 * Status transition rules belong in Order Service.
 */

const addressField = (prefix: string, required: boolean): ValidationChain[] => {
    const base = required
        ? body(prefix).exists({ checkFalsy: true }).withMessage(
              `${prefix} is required.`
          )
        : body(prefix).optional();

    const field = (name: string, opts: { required?: boolean; max: number }) => {
        const path = `${prefix}.${name}`;
        let chain = body(path);
        if (opts.required && required) {
            chain = chain
                .exists({ checkFalsy: true })
                .withMessage(`${path} is required.`);
        } else {
            chain = chain.optional();
        }
        return chain
            .isString()
            .withMessage(`${path} must be a string.`)
            .trim()
            .isLength({ max: opts.max })
            .withMessage(`${path} cannot exceed ${opts.max} characters.`);
    };

    return [
        base,
        field("fullName", { required: true, max: 120 }),
        field("phone", { required: false, max: 32 }),
        field("line1", { required: true, max: 200 }),
        field("line2", { required: false, max: 200 }),
        field("city", { required: true, max: 100 }),
        field("state", { required: false, max: 100 }),
        field("postalCode", { required: true, max: 32 }),
        field("country", { required: true, max: 100 }),
    ];
};

/**
 * POST /orders — create order validation.
 */
export const createOrderSchema: ValidationChain[] = [
    body("items")
        .exists({ checkFalsy: true })
        .withMessage("items is required.")
        .isArray({ min: 1 })
        .withMessage("items must be a non-empty array."),

    body("items.*.productId")
        .exists({ checkFalsy: true })
        .withMessage("items.productId is required.")
        .isMongoId()
        .withMessage("items.productId must be a valid Mongo ObjectId."),

    body("items.*.variantId")
        .exists({ checkFalsy: true })
        .withMessage("items.variantId is required.")
        .isMongoId()
        .withMessage("items.variantId must be a valid Mongo ObjectId."),

    body("items.*.quantity")
        .exists({ checkFalsy: true })
        .withMessage("items.quantity is required.")
        .isInt({ min: 1 })
        .withMessage("items.quantity must be an integer greater than 0.")
        .toInt(),

    body("items.*.discount")
        .optional()
        .isFloat({ min: 0 })
        .withMessage("items.discount cannot be negative.")
        .toFloat(),

    body("items.*.tax")
        .optional()
        .isFloat({ min: 0 })
        .withMessage("items.tax cannot be negative.")
        .toFloat(),

    ...addressField("shippingAddress", true),
    ...addressField("billingAddress", false),

    body("currency")
        .optional()
        .isString()
        .withMessage("currency must be a string.")
        .trim()
        .toUpperCase()
        .isLength({ min: 3, max: 8 })
        .withMessage("currency must be between 3 and 8 characters."),

    body("discount")
        .optional()
        .isFloat({ min: 0 })
        .withMessage("discount cannot be negative.")
        .toFloat(),

    body("tax")
        .optional()
        .isFloat({ min: 0 })
        .withMessage("tax cannot be negative.")
        .toFloat(),

    body("shippingCharge")
        .optional()
        .isFloat({ min: 0 })
        .withMessage("shippingCharge cannot be negative.")
        .toFloat(),

    body("notes")
        .optional()
        .isString()
        .withMessage("notes must be a string.")
        .trim()
        .isLength({ max: 2000 })
        .withMessage("notes cannot exceed 2000 characters."),
];

/**
 * GET /orders — list query validation.
 */
export const listOrdersQuerySchema: ValidationChain[] = [
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

    query("status")
        .optional()
        .isString()
        .withMessage("status must be a string.")
        .trim()
        .toUpperCase()
        .isIn([...ORDER_STATUSES])
        .withMessage(
            `Invalid status filter. Allowed: ${ORDER_STATUSES.join(", ")}.`
        ),

    query("paymentStatus")
        .optional()
        .isString()
        .withMessage("paymentStatus must be a string.")
        .trim()
        .toUpperCase()
        .isIn([...PAYMENT_STATUSES])
        .withMessage(
            `Invalid paymentStatus filter. Allowed: ${PAYMENT_STATUSES.join(", ")}.`
        ),

    query("customerId")
        .optional()
        .isMongoId()
        .withMessage("customerId must be a valid Mongo ObjectId."),

    query("fromDate")
        .optional()
        .isISO8601()
        .withMessage("fromDate must be a valid ISO 8601 date."),

    query("toDate")
        .optional()
        .isISO8601()
        .withMessage("toDate must be a valid ISO 8601 date."),
];

/**
 * GET /orders/:id — order id param validation.
 */
export const getOrderByIdSchema: ValidationChain[] = [
    param("id")
        .exists({ checkFalsy: true })
        .withMessage("Order id is required.")
        .isMongoId()
        .withMessage("Order id must be a valid Mongo ObjectId."),
];

/**
 * Shared filters for Order report endpoints (Step 15.8).
 */
export const orderReportQuerySchema: ValidationChain[] = [
    query("dateFrom")
        .optional()
        .isISO8601()
        .withMessage("dateFrom must be a valid ISO 8601 date."),

    query("dateTo")
        .optional()
        .isISO8601()
        .withMessage("dateTo must be a valid ISO 8601 date."),

    query("status")
        .optional()
        .isString()
        .withMessage("status must be a string.")
        .trim()
        .toUpperCase()
        .isIn([...ORDER_STATUSES])
        .withMessage(
            `Invalid status filter. Allowed: ${ORDER_STATUSES.join(", ")}.`
        ),

    query("paymentStatus")
        .optional()
        .isString()
        .withMessage("paymentStatus must be a string.")
        .trim()
        .toUpperCase()
        .isIn([...PAYMENT_STATUSES])
        .withMessage(
            `Invalid paymentStatus filter. Allowed: ${PAYMENT_STATUSES.join(", ")}.`
        ),

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
 * PATCH /orders/:id/status — update order status validation.
 * Transition rules are enforced in OrderService (not here).
 */
export const updateOrderStatusSchema: ValidationChain[] = [
    param("id")
        .exists({ checkFalsy: true })
        .withMessage("Order id is required.")
        .isMongoId()
        .withMessage("Order id must be a valid Mongo ObjectId."),

    body("status")
        .exists({ checkFalsy: true })
        .withMessage("status is required.")
        .isString()
        .withMessage("status must be a string.")
        .trim()
        .toUpperCase()
        .isIn([...ORDER_STATUSES])
        .withMessage(
            `status must be one of: ${ORDER_STATUSES.join(", ")}.`
        ),
];

/**
 * @deprecated Placeholder map retained for Step 15.1 naming continuity.
 */
export const orderValidationPlaceholders = {
    create: createOrderSchema,
    update: updateOrderStatusSchema,
    list: listOrdersQuerySchema,
    getById: getOrderByIdSchema,
    reports: orderReportQuerySchema,
    cancel: [] as ValidationChain[],
} as const;
