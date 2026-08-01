import { body, param, query, ValidationChain } from "express-validator";

/**
 * Enterprise Brand Validation chains.
 *
 * Request-shape validation only (SRP).
 * Uses express-validator to match the Product and Category module style.
 * No database access, domain rules, or HTTP response handling.
 */

const BRAND_STATUSES = ["ACTIVE", "INACTIVE"] as const;

const CREATE_BRAND_ALLOWED_FIELDS = [
    "name",
    "slug",
    "description",
    "logo",
    "website",
    "status",
    "isFeatured",
    "seoTitle",
    "seoDescription",
] as const;

const UPDATE_BRAND_ALLOWED_FIELDS = [
    ...CREATE_BRAND_ALLOWED_FIELDS,
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
 * Shared optional body field rules reused by create/update.
 */
const optionalSlug = body("slug")
    .optional()
    .isString()
    .withMessage("Brand slug must be a string.")
    .trim()
    .toLowerCase()
    .isLength({ min: 2, max: 140 })
    .withMessage("Brand slug must be between 2 and 140 characters.")
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage(
        "Brand slug must contain only lowercase letters, numbers, and hyphens."
    );

const optionalDescription = body("description")
    .optional()
    .isString()
    .withMessage("Brand description must be a string.")
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Brand description cannot exceed 1000 characters.");

const optionalLogo = body("logo")
    .optional()
    .isString()
    .withMessage("Brand logo must be a string.")
    .trim()
    .isURL()
    .withMessage("Brand logo must be a valid URL.");

const optionalWebsite = body("website")
    .optional()
    .isString()
    .withMessage("Brand website must be a string.")
    .trim()
    .isURL()
    .withMessage("Brand website must be a valid URL.");

const optionalStatus = body("status")
    .optional()
    .isString()
    .withMessage("Brand status must be a string.")
    .trim()
    .toUpperCase()
    .isIn([...BRAND_STATUSES])
    .withMessage(
        `Brand status must be one of: ${BRAND_STATUSES.join(", ")}.`
    );

const optionalIsFeatured = body("isFeatured")
    .optional()
    .isBoolean()
    .withMessage("isFeatured must be a boolean.")
    .toBoolean();

const optionalSeoTitle = body("seoTitle")
    .optional()
    .isString()
    .withMessage("SEO title must be a string.")
    .trim()
    .isLength({ max: 150 })
    .withMessage("SEO title cannot exceed 150 characters.");

const optionalSeoDescription = body("seoDescription")
    .optional()
    .isString()
    .withMessage("SEO description must be a string.")
    .trim()
    .isLength({ max: 300 })
    .withMessage("SEO description cannot exceed 300 characters.");

/**
 * POST /brands — create brand validation.
 */
export const createBrandSchema: ValidationChain[] = [
    rejectUnknownBodyFields(CREATE_BRAND_ALLOWED_FIELDS, "brand create"),

    body("name")
        .exists({ checkFalsy: true })
        .withMessage("Brand name is required.")
        .isString()
        .withMessage("Brand name must be a string.")
        .trim()
        .isLength({ min: 2, max: 120 })
        .withMessage("Brand name must be between 2 and 120 characters."),

    optionalSlug,
    optionalDescription,
    optionalLogo,
    optionalWebsite,
    optionalStatus,
    optionalIsFeatured,
    optionalSeoTitle,
    optionalSeoDescription,
];

/**
 * PUT/PATCH /brands/:id — update brand validation.
 * All fields optional; at least one updatable field or logo file must be present.
 * Unknown fields are rejected.
 */
export const updateBrandSchema: ValidationChain[] = [
    rejectUnknownBodyFields(UPDATE_BRAND_ALLOWED_FIELDS, "brand update"),

    body().custom((_, { req }) => {
        const bodyValue =
            req.body && typeof req.body === "object"
                ? (req.body as Record<string, unknown>)
                : {};

        const hasAtLeastOneField = UPDATE_BRAND_ALLOWED_FIELDS.some(
            (field) => bodyValue[field] !== undefined
        );

        const hasLogoFile = Boolean(req.file);

        if (!hasAtLeastOneField && !hasLogoFile) {
            throw new Error(
                "At least one field or logo file must be provided for brand update."
            );
        }

        return true;
    }),

    body("name")
        .optional()
        .isString()
        .withMessage("Brand name must be a string.")
        .trim()
        .isLength({ min: 2, max: 120 })
        .withMessage("Brand name must be between 2 and 120 characters."),

    optionalSlug,
    optionalDescription,
    optionalLogo,
    optionalWebsite,
    optionalStatus,
    optionalIsFeatured,
    optionalSeoTitle,
    optionalSeoDescription,
];

/**
 * PATCH /brands/:id/status — update brand status validation.
 */
export const updateBrandStatusSchema: ValidationChain[] = [
    rejectUnknownBodyFields(["status"], "brand status update"),

    body("status")
        .exists({ checkFalsy: true })
        .withMessage("Brand status is required.")
        .isString()
        .withMessage("Brand status must be a string.")
        .trim()
        .toUpperCase()
        .isIn([...BRAND_STATUSES])
        .withMessage(
            `Brand status must be one of: ${BRAND_STATUSES.join(", ")}.`
        ),
];

/**
 * Validate MongoDB ObjectId route param `:id`.
 */
export const brandIdParamSchema: ValidationChain[] = [
    param("id")
        .exists({ checkFalsy: true })
        .withMessage("Brand id is required.")
        .isMongoId()
        .withMessage("Brand id must be a valid Mongo ObjectId."),
];

/**
 * Validate lowercase slug route param `:slug`.
 */
export const brandSlugParamSchema: ValidationChain[] = [
    param("slug")
        .exists({ checkFalsy: true })
        .withMessage("Brand slug is required.")
        .isString()
        .withMessage("Brand slug must be a string.")
        .trim()
        .toLowerCase()
        .isLength({ min: 2, max: 140 })
        .withMessage("Brand slug must be between 2 and 140 characters.")
        .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
        .withMessage(
            "Brand slug must contain only lowercase letters, numbers, and hyphens."
        ),
];

/**
 * GET /brands — search / list query validation.
 */
export const getBrandsQuerySchema: ValidationChain[] = [
    query("keyword")
        .optional()
        .isString()
        .withMessage("Keyword must be a string.")
        .trim(),

    query("search")
        .optional()
        .isString()
        .withMessage("Search must be a string.")
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
        .isIn(["name", "createdAt", "updatedAt"])
        .withMessage(
            "sortBy must be one of: name, createdAt, updatedAt."
        ),

    query("sortOrder")
        .optional()
        .isString()
        .withMessage("sortOrder must be a string.")
        .trim()
        .toLowerCase()
        .isIn(["asc", "desc"])
        .withMessage("sortOrder must be either asc or desc."),

    query("status")
        .optional()
        .isString()
        .withMessage("status must be a string.")
        .trim()
        .toUpperCase()
        .isIn([...BRAND_STATUSES])
        .withMessage(
            `status must be one of: ${BRAND_STATUSES.join(", ")}.`
        ),

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
];
