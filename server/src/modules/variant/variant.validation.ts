import { body, param, query, ValidationChain } from "express-validator";

/**
 * Enterprise Product Variant Validation chains.
 *
 * Request-shape validation only (SRP).
 * Uses express-validator to match Product, Category, and Brand module style.
 * No database access, domain rules, or HTTP response handling.
 */

const VARIANT_SORT_BY = [
    "sku",
    "price",
    "stock",
    "color",
    "size",
    "createdAt",
    "updatedAt",
] as const;

const CREATE_VARIANT_ALLOWED_FIELDS = [
    "product",
    "sku",
    "color",
    "size",
    "price",
    "salePrice",
    "stock",
    "images",
    "isActive",
] as const;

const UPDATE_VARIANT_ALLOWED_FIELDS = [
    "sku",
    "color",
    "size",
    "price",
    "salePrice",
    "stock",
    "images",
    "isActive",
] as const;

/**
 * Rejects request bodies that contain fields outside the allow-list.
 */
const rejectUnknownBodyFields = (
    allowedFields: readonly string[],
    contextLabel: string
): ValidationChain =>
    body().custom((_, { req }) => {
        const bodyValue =
            req.body && typeof req.body === "object"
                ? (req.body as Record<string, unknown>)
                : {};

        const unknownFields = Object.keys(bodyValue).filter(
            (field) => !allowedFields.includes(field)
        );

        if (unknownFields.length > 0) {
            throw new Error(
                `Unknown field(s) in ${contextLabel}: ${unknownFields.join(", ")}.`
            );
        }

        return true;
    });

/**
 * Ensures salePrice does not exceed price when both are present.
 */
const assertSalePriceNotExceedsPrice = (
    salePrice: unknown,
    price: unknown
): boolean => {
    if (
        typeof salePrice === "number" &&
        typeof price === "number" &&
        salePrice > price
    ) {
        throw new Error("salePrice must not exceed price.");
    }

    return true;
};

/**
 * Shared optional body field rules reused by create/update.
 */
const optionalColor = body("color")
    .optional()
    .isString()
    .withMessage("Variant color must be a string.")
    .trim()
    .isLength({ max: 50 })
    .withMessage("Variant color cannot exceed 50 characters.");

const optionalSize = body("size")
    .optional()
    .isString()
    .withMessage("Variant size must be a string.")
    .trim()
    .isLength({ max: 30 })
    .withMessage("Variant size cannot exceed 30 characters.");

const optionalSalePrice = body("salePrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage(
        "Variant salePrice must be a number greater than or equal to 0."
    )
    .toFloat()
    .custom((value: number, { req }) => {
        const bodyValue =
            req.body && typeof req.body === "object"
                ? (req.body as Record<string, unknown>)
                : {};

        return assertSalePriceNotExceedsPrice(value, bodyValue.price);
    });

const optionalImages = body("images")
    .optional()
    .isArray()
    .withMessage("Variant images must be an array.");

const optionalImageUrls = body("images.*")
    .optional()
    .isString()
    .withMessage("Each variant image must be a string.")
    .trim()
    .isURL()
    .withMessage("Each variant image must be a valid URL.");

const optionalIsActive = body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean.")
    .toBoolean();

const optionalSku = body("sku")
    .optional()
    .isString()
    .withMessage("Variant SKU must be a string.")
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage("Variant SKU must be between 3 and 100 characters.");

const optionalPrice = body("price")
    .optional()
    .isFloat({ min: 0 })
    .withMessage(
        "Variant price must be a number greater than or equal to 0."
    )
    .toFloat();

const optionalStock = body("stock")
    .optional()
    .isInt({ min: 0 })
    .withMessage(
        "Variant stock must be an integer greater than or equal to 0."
    )
    .toInt();

/**
 * POST /variants — create variant validation.
 */
export const createVariantSchema: ValidationChain[] = [
    rejectUnknownBodyFields(CREATE_VARIANT_ALLOWED_FIELDS, "variant create"),

    body("product")
        .exists({ checkFalsy: true })
        .withMessage("Product is required.")
        .isMongoId()
        .withMessage("Product must be a valid Mongo ObjectId."),

    /**
     * SKU is optional — VariantService auto-generates when omitted.
     */
    optionalSku,

    optionalColor,
    optionalSize,

    body("price")
        .exists({ checkFalsy: false })
        .withMessage("Variant price is required.")
        .isFloat({ min: 0 })
        .withMessage(
            "Variant price must be a number greater than or equal to 0."
        )
        .toFloat(),

    optionalSalePrice,

    body("stock")
        .exists({ checkFalsy: false })
        .withMessage("Variant stock is required.")
        .isInt({ min: 0 })
        .withMessage(
            "Variant stock must be an integer greater than or equal to 0."
        )
        .toInt(),

    optionalImages,
    optionalImageUrls,
    optionalIsActive,
];

/**
 * PUT/PATCH /variants/:id — update variant validation.
 * All fields optional; at least one updatable field must be present.
 */
export const updateVariantSchema: ValidationChain[] = [
    rejectUnknownBodyFields(UPDATE_VARIANT_ALLOWED_FIELDS, "variant update"),

    body().custom((_, { req }) => {
        const bodyValue =
            req.body && typeof req.body === "object"
                ? (req.body as Record<string, unknown>)
                : {};

        const hasAtLeastOneField = UPDATE_VARIANT_ALLOWED_FIELDS.some(
            (field) => bodyValue[field] !== undefined
        );

        if (!hasAtLeastOneField) {
            throw new Error(
                "At least one field must be provided for variant update."
            );
        }

        return true;
    }),

    optionalSku,
    optionalColor,
    optionalSize,
    optionalPrice,
    optionalSalePrice,
    optionalStock,
    optionalImages,
    optionalImageUrls,
    optionalIsActive,
];

/**
 * Validate MongoDB ObjectId route param `:id` (get / delete).
 */
export const variantIdParamSchema: ValidationChain[] = [
    param("id")
        .exists({ checkFalsy: true })
        .withMessage("Variant id is required.")
        .isMongoId()
        .withMessage("Variant id must be a valid Mongo ObjectId."),
];

/**
 * GET /variants/:id — get variant by id.
 */
export const getVariantByIdSchema: ValidationChain[] = [
    ...variantIdParamSchema,
];

/**
 * DELETE /variants/:id — delete variant by id.
 */
export const deleteVariantSchema: ValidationChain[] = [
    ...variantIdParamSchema,
];

/**
 * Validate SKU route param `:sku`.
 */
export const variantSkuParamSchema: ValidationChain[] = [
    param("sku")
        .exists({ checkFalsy: true })
        .withMessage("Variant SKU is required.")
        .isString()
        .withMessage("Variant SKU must be a string.")
        .trim()
        .isLength({ min: 3, max: 100 })
        .withMessage("Variant SKU must be between 3 and 100 characters."),
];

/**
 * Validate Product id route param `:productId`.
 */
export const productIdParamSchema: ValidationChain[] = [
    param("productId")
        .exists({ checkFalsy: true })
        .withMessage("Product id is required.")
        .isMongoId()
        .withMessage("Product id must be a valid Mongo ObjectId."),
];

/**
 * GET /variants — list / search / filter query validation.
 */
export const getVariantsQuerySchema: ValidationChain[] = [
    query("page")
        .optional()
        .default(1)
        .isInt({ min: 1 })
        .withMessage("Page must be an integer greater than or equal to 1.")
        .toInt(),

    query("limit")
        .optional()
        .default(10)
        .isInt({ min: 1, max: 100 })
        .withMessage("Limit must be an integer between 1 and 100.")
        .toInt(),

    query("search")
        .optional()
        .isString()
        .withMessage("Search must be a string.")
        .trim(),

    query("product")
        .optional()
        .isMongoId()
        .withMessage("product must be a valid Mongo ObjectId."),

    query("color")
        .optional()
        .isString()
        .withMessage("color must be a string.")
        .trim()
        .isLength({ max: 50 })
        .withMessage("color cannot exceed 50 characters."),

    query("size")
        .optional()
        .isString()
        .withMessage("size must be a string.")
        .trim()
        .isLength({ max: 30 })
        .withMessage("size cannot exceed 30 characters."),

    query("minPrice")
        .optional()
        .isFloat({ min: 0 })
        .withMessage("minPrice must be a number greater than or equal to 0.")
        .toFloat(),

    query("maxPrice")
        .optional()
        .isFloat({ min: 0 })
        .withMessage("maxPrice must be a number greater than or equal to 0.")
        .toFloat()
        .custom((maxPrice: number, { req }) => {
            const minPriceRaw = req.query?.minPrice;
            const minPrice =
                typeof minPriceRaw === "string" || typeof minPriceRaw === "number"
                    ? Number(minPriceRaw)
                    : undefined;

            if (
                typeof minPrice === "number" &&
                !Number.isNaN(minPrice) &&
                maxPrice < minPrice
            ) {
                throw new Error("maxPrice must be greater than or equal to minPrice.");
            }

            return true;
        }),

    query("isActive")
        .optional()
        .isBoolean()
        .withMessage("isActive must be a boolean.")
        .toBoolean(),

    query("sortBy")
        .optional()
        .isString()
        .withMessage("sortBy must be a string.")
        .trim()
        .isIn([...VARIANT_SORT_BY])
        .withMessage(
            `sortBy must be one of: ${VARIANT_SORT_BY.join(", ")}.`
        ),

    query("sortOrder")
        .optional()
        .isString()
        .withMessage("sortOrder must be a string.")
        .trim()
        .toLowerCase()
        .isIn(["asc", "desc"])
        .withMessage("sortOrder must be either asc or desc."),
];
