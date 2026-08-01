import { Request, Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { authorize, ROLES } from "../../middleware/role.middleware";
import { uploadCategoryImage } from "../../middleware/upload.middleware";
import { ProductRepository } from "../../repositories/product.repository";
import { CategoryController } from "./category.controller";
import { CategoryRepository } from "./category.repository";
import { CategoryService } from "./category.service";
import {
    categoryIdParamSchema,
    categorySearchQuerySchema,
    createCategorySchema,
    slugParamSchema,
    updateCategorySchema,
    updateFeaturedSchema,
    updateSortOrderSchema,
    updateStatusSchema,
} from "./category.validation";

/**
 * Enterprise Category Routes.
 *
 * HTTP route wiring for the Category module.
 * Composes auth, RBAC, validators, and controller handlers only.
 *
 * Mount under: /api/v1/categories
 */

const categoryRepository = new CategoryRepository();
const productRepository = new ProductRepository();
const categoryService = new CategoryService(
    categoryRepository,
    productRepository
);
const categoryController = new CategoryController(categoryService);

const router = Router();

/**
 * ---------------------------------------------------------
 * Public GET routes
 * Static paths must be registered before /:id
 * ---------------------------------------------------------
 */

/**
 * GET /categories/tree
 */
router.get(
    "/tree",
    (req, res, next) =>
        categoryController.getCategoryTree(req as Request, res, next)
);

/**
 * GET /categories/roots
 */
router.get(
    "/roots",
    (req, res, next) =>
        categoryController.getRootCategories(req as Request, res, next)
);

/**
 * GET /categories/search
 * Keyword search with the same filters, sort, and pagination as GET /.
 */
router.get(
    "/search",
    ...categorySearchQuerySchema,
    (req, res, next) =>
        categoryController.searchCategories(req as Request, res, next)
);

/**
 * GET /categories/slug/:slug
 */
router.get(
    "/slug/:slug",
    ...slugParamSchema,
    (req, res, next) =>
        categoryController.getCategoryBySlug(req as Request, res, next)
);

/**
 * GET /categories
 * Enterprise listing: keyword search, filters, sort, pagination, field selection.
 */
router.get(
    "/",
    ...categorySearchQuerySchema,
    (req, res, next) =>
        categoryController.getAllCategories(req as Request, res, next)
);

/**
 * GET /categories/:id/children
 * Must be registered before /:id alone is fine; kept before for clarity.
 */
router.get(
    "/:id/children",
    ...categoryIdParamSchema,
    (req, res, next) =>
        categoryController.getChildren(req as Request, res, next)
);

/**
 * GET /categories/:id
 */
router.get(
    "/:id",
    ...categoryIdParamSchema,
    (req, res, next) =>
        categoryController.getCategoryById(req as Request, res, next)
);

/**
 * ---------------------------------------------------------
 * Protected Admin routes (ADMIN, SUPER_ADMIN)
 * ---------------------------------------------------------
 */

/**
 * POST /categories
 */
router.post(
    "/",
    authenticate,
    authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN),
    ...createCategorySchema,
    (req, res, next) =>
        categoryController.createCategory(req as Request, res, next)
);

/**
 * PUT /categories/:id
 */
router.put(
    "/:id",
    authenticate,
    authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN),
    ...categoryIdParamSchema,
    ...updateCategorySchema,
    (req, res, next) =>
        categoryController.updateCategory(req as Request, res, next)
);

/**
 * DELETE /categories/:id
 */
router.delete(
    "/:id",
    authenticate,
    authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN),
    ...categoryIdParamSchema,
    (req, res, next) =>
        categoryController.deleteCategory(req as Request, res, next)
);

/**
 * PATCH /categories/:id/status
 */
router.patch(
    "/:id/status",
    authenticate,
    authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN),
    ...categoryIdParamSchema,
    ...updateStatusSchema,
    (req, res, next) =>
        categoryController.updateCategoryStatus(req as Request, res, next)
);

/**
 * PATCH /categories/:id/featured
 */
router.patch(
    "/:id/featured",
    authenticate,
    authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN),
    ...categoryIdParamSchema,
    ...updateFeaturedSchema,
    (req, res, next) =>
        categoryController.updateFeaturedStatus(req as Request, res, next)
);

/**
 * PATCH /categories/:id/sort-order
 */
router.patch(
    "/:id/sort-order",
    authenticate,
    authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN),
    ...categoryIdParamSchema,
    ...updateSortOrderSchema,
    (req, res, next) =>
        categoryController.updateSortOrder(req as Request, res, next)
);

/**
 * POST /categories/:id/image
 * Upload or replace category image via Cloudinary (field: image).
 */
router.post(
    "/:id/image",
    authenticate,
    authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN),
    ...categoryIdParamSchema,
    uploadCategoryImage,
    (req, res, next) =>
        categoryController.uploadCategoryImage(req as Request, res, next)
);

export default router;
