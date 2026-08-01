import { body, param, query, ValidationChain } from "express-validator";

/**
 * Enterprise Category Validation chains.
 *
 * Request-shape validation only (SRP).
 * Uses express-validator to match the Product module style.
 * No database access, domain rules, or HTTP response handling.
 */

/**
 * Shared optional body field rules reused by create/update.
 */
const optionalSlug = body("slug")
    .optional()
    .isString()
    .withMessage("Category slug must be a string.")
    .trim()
    .toLowerCase()
    .isLength({ min: 2, max: 120 })
    .withMessage("Category slug must be between 2 and 120 characters.");

const optionalDescription = body("description")
    .optional()
    .isString()
    .withMessage("Category description must be a string.")
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Category description cannot exceed 1000 characters.");

const optionalImage = body("image")
    .optional()
    .isString()
    .withMessage("Category image must be a string.")
    .trim()
    .isURL()
    .withMessage("Category image must be a valid URL.");

const optionalParentCategory = body("parentCategory")
    .optional({ nullable: true })
    .custom((value: unknown) => {
        if (value === null || value === undefined || value === "") {
            return true;
        }

        if (typeof value !== "string") {
            throw new Error("Parent category must be a valid Mongo ObjectId.");
        }

        const objectIdPattern = /^[a-fA-F0-9]{24}$/;
        if (!objectIdPattern.test(value)) {
            throw new Error("Parent category must be a valid Mongo ObjectId.");
        }

        return true;
    });

const optionalSortOrder = body("sortOrder")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Sort order must be an integer greater than or equal to 0.")
    .toInt();

const optionalIsFeatured = body("isFeatured")
    .optional()
    .isBoolean()
    .withMessage("isFeatured must be a boolean.")
    .toBoolean();

const optionalMetaTitle = body("metaTitle")
    .optional()
    .isString()
    .withMessage("Meta title must be a string.")
    .trim()
    .isLength({ max: 150 })
    .withMessage("Meta title cannot exceed 150 characters.");

const optionalMetaDescription = body("metaDescription")
    .optional()
    .isString()
    .withMessage("Meta description must be a string.")
    .trim()
    .isLength({ max: 300 })
    .withMessage("Meta description cannot exceed 300 characters.");

/**
 * POST /categories — create category validation.
 */
export const createCategorySchema: ValidationChain[] = [
    body("name")
        .exists({ checkFalsy: true })
        .withMessage("Category name is required.")
        .isString()
        .withMessage("Category name must be a string.")
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage("Category name must be between 2 and 100 characters."),

    optionalSlug,
    optionalDescription,
    optionalImage,
    optionalParentCategory,
    optionalSortOrder,
    optionalIsFeatured,
    optionalMetaTitle,
    optionalMetaDescription,
];

/**
 * PUT /categories/:id — update category validation.
 * All fields optional; at least one updatable field must be present.
 */
export const updateCategorySchema: ValidationChain[] = [
    body()
        .custom((_, { req }) => {
            const allowedFields = [
                "name",
                "slug",
                "description",
                "image",
                "parentCategory",
                "sortOrder",
                "isFeatured",
                "isActive",
                "metaTitle",
                "metaDescription",
            ] as const;

            const bodyValue =
                req.body && typeof req.body === "object"
                    ? (req.body as Record<string, unknown>)
                    : {};

            const hasAtLeastOneField = allowedFields.some(
                (field) => bodyValue[field] !== undefined
            );

            if (!hasAtLeastOneField) {
                throw new Error(
                    "At least one field must be provided for category update."
                );
            }

            return true;
        }),

    body("name")
        .optional()
        .isString()
        .withMessage("Category name must be a string.")
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage("Category name must be between 2 and 100 characters."),

    optionalSlug,
    optionalDescription,
    optionalImage,
    optionalParentCategory,
    optionalSortOrder,
    optionalIsFeatured,

    body("isActive")
        .optional()
        .isBoolean()
        .withMessage("isActive must be a boolean.")
        .toBoolean(),

    optionalMetaTitle,
    optionalMetaDescription,
];

/**
 * Validate MongoDB ObjectId route param `:id`.
 */
export const categoryIdParamSchema: ValidationChain[] = [
    param("id")
        .exists({ checkFalsy: true })
        .withMessage("Category id is required.")
        .isMongoId()
        .withMessage("Category id must be a valid Mongo ObjectId."),
];

/**
 * Validate lowercase slug route param `:slug`.
 */
export const slugParamSchema: ValidationChain[] = [
    param("slug")
        .exists({ checkFalsy: true })
        .withMessage("Category slug is required.")
        .isString()
        .withMessage("Category slug must be a string.")
        .trim()
        .isLength({ min: 2 })
        .withMessage("Category slug must be at least 2 characters.")
        .isLowercase()
        .withMessage("Category slug must be lowercase."),
];

/**
 * GET /categories — search / list query validation.
 */
export const categorySearchQuerySchema: ValidationChain[] = [
    query("keyword")
        .optional()
        .isString()
        .withMessage("Keyword must be a string.")
        .trim(),

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

    query("sortBy")
        .optional()
        .isString()
        .withMessage("sortBy must be a string.")
        .trim()
        .isIn(["name", "sortOrder", "createdAt", "updatedAt"])
        .withMessage(
            "sortBy must be one of: name, sortOrder, createdAt, updatedAt."
        ),

    query("sortOrder")
        .optional()
        .isString()
        .withMessage("sortOrder must be a string.")
        .trim()
        .toLowerCase()
        .isIn(["asc", "desc"])
        .withMessage("sortOrder must be either asc or desc."),

    query("parentCategory")
        .optional({ nullable: true })
        .custom((value: unknown) => {
            if (
                value === null ||
                value === undefined ||
                value === "" ||
                value === "null"
            ) {
                return true;
            }

            if (typeof value !== "string") {
                throw new Error(
                    "parentCategory must be a valid Mongo ObjectId."
                );
            }

            const objectIdPattern = /^[a-fA-F0-9]{24}$/;
            if (!objectIdPattern.test(value)) {
                throw new Error(
                    "parentCategory must be a valid Mongo ObjectId."
                );
            }

            return true;
        }),

    query("level")
        .optional()
        .isInt({ min: 0 })
        .withMessage("level must be an integer greater than or equal to 0.")
        .toInt(),

    query("isActive")
        .optional()
        .isBoolean()
        .withMessage("isActive must be a boolean.")
        .toBoolean(),

    query("isFeatured")
        .optional()
        .isBoolean()
        .withMessage("isFeatured must be a boolean.")
        .toBoolean(),

    query("createdBy")
        .optional()
        .isMongoId()
        .withMessage("createdBy must be a valid Mongo ObjectId."),

    query("fields")
        .optional()
        .isString()
        .withMessage("fields must be a string.")
        .trim()
        .matches(/^[a-zA-Z0-9_,\s]+$/)
        .withMessage(
            "fields must be a comma-separated list of field names."
        ),

    query("populateParent")
        .optional()
        .isBoolean()
        .withMessage("populateParent must be a boolean.")
        .toBoolean(),
];

/**
 * PATCH — update category active status.
 */
export const updateStatusSchema: ValidationChain[] = [
    body("isActive")
        .exists({ checkNull: true })
        .withMessage("isActive is required.")
        .isBoolean()
        .withMessage("isActive must be a boolean.")
        .toBoolean(),
];

/**
 * PATCH — update category featured flag.
 */
export const updateFeaturedSchema: ValidationChain[] = [
    body("isFeatured")
        .exists({ checkNull: true })
        .withMessage("isFeatured is required.")
        .isBoolean()
        .withMessage("isFeatured must be a boolean.")
        .toBoolean(),
];

/**
 * PATCH — update category sort order.
 */
export const updateSortOrderSchema: ValidationChain[] = [
    body("sortOrder")
        .exists({ checkNull: true })
        .withMessage("sortOrder is required.")
        .isInt({ min: 0 })
        .withMessage("sortOrder must be an integer greater than or equal to 0.")
        .toInt(),
];
