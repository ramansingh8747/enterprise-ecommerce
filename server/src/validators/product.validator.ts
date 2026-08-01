import { body, param, ValidationChain } from "express-validator";
import {
    ProductStatus,
    StockStatus,
} from "../interfaces/product.interface";

/**
 * Enterprise Product Validation chains.
 *
 * Request-shape validation only (SRP).
 * No database access, domain rules, or HTTP response handling.
 */

const PRODUCT_STATUSES = Object.values(ProductStatus);
const STOCK_STATUSES = Object.values(StockStatus);

/**
 * Shared optional field rules reused by create/update where applicable.
 */
const optionalComparePrice = body("comparePrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Compare price must be a number greater than or equal to 0.");

const optionalCostPrice = body("costPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Cost price must be a number greater than or equal to 0.");

const optionalBrand = body("brand")
    .optional()
    .isMongoId()
    .withMessage("Invalid Brand ID.");

const requiredBrand = body("brand")
    .exists({ checkFalsy: true })
    .withMessage("Brand is required.")
    .isMongoId()
    .withMessage("Invalid Brand ID.");

const optionalThumbnail = body("thumbnail")
    .optional()
    .isString()
    .withMessage("Thumbnail must be a string.")
    .trim();

const optionalImages = body("images")
    .optional()
    .isArray()
    .withMessage("Images must be an array.");

const optionalTags = body("tags")
    .optional()
    .isArray()
    .withMessage("Tags must be an array.");

const optionalStatus = body("status")
    .optional()
    .isIn(PRODUCT_STATUSES)
    .withMessage(`Status must be one of: ${PRODUCT_STATUSES.join(", ")}.`);

const optionalStockStatus = body("stockStatus")
    .optional()
    .isIn(STOCK_STATUSES)
    .withMessage(
        `Stock status must be one of: ${STOCK_STATUSES.join(", ")}.`
    );

const optionalSeoTitle = body("seoTitle")
    .optional()
    .isString()
    .withMessage("SEO title must be a string.")
    .trim()
    .isLength({ max: 70 })
    .withMessage("SEO title cannot exceed 70 characters.");

const optionalSeoDescription = body("seoDescription")
    .optional()
    .isString()
    .withMessage("SEO description must be a string.")
    .trim()
    .isLength({ max: 160 })
    .withMessage("SEO description cannot exceed 160 characters.");

/**
 * POST /products — create product validation.
 */
export const createProductValidator: ValidationChain[] = [
    body("name")
        .exists({ checkFalsy: true })
        .withMessage("Product name is required.")
        .isString()
        .withMessage("Product name must be a string.")
        .trim()
        .isLength({ min: 3, max: 200 })
        .withMessage("Product name must be between 3 and 200 characters."),

    body("slug")
        .exists({ checkFalsy: true })
        .withMessage("Product slug is required.")
        .isString()
        .withMessage("Product slug must be a string.")
        .trim()
        .toLowerCase()
        .isLength({ min: 3, max: 250 })
        .withMessage("Product slug must be between 3 and 250 characters."),

    body("sku")
        .exists({ checkFalsy: true })
        .withMessage("Product SKU is required.")
        .isString()
        .withMessage("Product SKU must be a string.")
        .trim()
        .isLength({ min: 3, max: 100 })
        .withMessage("Product SKU must be between 3 and 100 characters."),

    body("price")
        .exists({ checkFalsy: false })
        .withMessage("Product price is required.")
        .isFloat({ min: 0 })
        .withMessage("Product price must be a number greater than or equal to 0."),

    optionalComparePrice,
    optionalCostPrice,

    body("quantity")
        .exists({ checkFalsy: false })
        .withMessage("Product quantity is required.")
        .isInt({ min: 0 })
        .withMessage("Product quantity must be an integer greater than or equal to 0."),

    body("category")
        .exists({ checkFalsy: true })
        .withMessage("Product category is required.")
        .isMongoId()
        .withMessage("Category must be a valid Mongo ObjectId."),

    requiredBrand,
    optionalThumbnail,
    optionalImages,
    optionalTags,
    optionalStatus,
    optionalStockStatus,
    optionalSeoTitle,
    optionalSeoDescription,
];

/**
 * PATCH/PUT /products/:id — update product validation.
 * All fields optional; rules apply only when the field is present.
 */
export const updateProductValidator: ValidationChain[] = [
    param("id")
        .exists({ checkFalsy: true })
        .withMessage("Product id is required.")
        .isMongoId()
        .withMessage("Product id must be a valid Mongo ObjectId."),

    body("name")
        .optional()
        .isString()
        .withMessage("Product name must be a string.")
        .trim()
        .isLength({ min: 3, max: 200 })
        .withMessage("Product name must be between 3 and 200 characters."),

    body("slug")
        .optional()
        .isString()
        .withMessage("Product slug must be a string.")
        .trim()
        .toLowerCase()
        .isLength({ min: 3, max: 250 })
        .withMessage("Product slug must be between 3 and 250 characters."),

    body("sku")
        .optional()
        .isString()
        .withMessage("Product SKU must be a string.")
        .trim()
        .isLength({ min: 3, max: 100 })
        .withMessage("Product SKU must be between 3 and 100 characters."),

    body("price")
        .optional()
        .isFloat({ min: 0 })
        .withMessage("Product price must be a number greater than or equal to 0."),

    optionalComparePrice,
    optionalCostPrice,

    body("quantity")
        .optional()
        .isInt({ min: 0 })
        .withMessage("Product quantity must be an integer greater than or equal to 0."),

    body("category")
        .optional()
        .isMongoId()
        .withMessage("Category must be a valid Mongo ObjectId."),

    optionalBrand,
    optionalThumbnail,
    optionalImages,
    optionalTags,
    optionalStatus,
    optionalStockStatus,
    optionalSeoTitle,
    optionalSeoDescription,
];

/**
 * GET /products/:id — validate Mongo ObjectId.
 */
export const getProductByIdValidator: ValidationChain[] = [
    param("id")
        .exists({ checkFalsy: true })
        .withMessage("Product id is required.")
        .isMongoId()
        .withMessage("Product id must be a valid Mongo ObjectId."),
];

/**
 * GET /products/sku/:sku — validate non-empty SKU.
 */
export const getProductBySkuValidator: ValidationChain[] = [
    param("sku")
        .exists({ checkFalsy: true })
        .withMessage("Product SKU is required.")
        .isString()
        .withMessage("Product SKU must be a string.")
        .trim()
        .notEmpty()
        .withMessage("Product SKU cannot be empty."),
];

/**
 * GET /products/slug/:slug — validate lowercase slug.
 */
export const getProductBySlugValidator: ValidationChain[] = [
    param("slug")
        .exists({ checkFalsy: true })
        .withMessage("Product slug is required.")
        .isString()
        .withMessage("Product slug must be a string.")
        .trim()
        .notEmpty()
        .withMessage("Product slug cannot be empty.")
        .isLowercase()
        .withMessage("Product slug must be lowercase."),
];

/**
 * DELETE /products/:id — validate Mongo ObjectId.
 */
export const deleteProductValidator: ValidationChain[] = [
    param("id")
        .exists({ checkFalsy: true })
        .withMessage("Product id is required.")
        .isMongoId()
        .withMessage("Product id must be a valid Mongo ObjectId."),
];
