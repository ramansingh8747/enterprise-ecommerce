import { Router } from "express";
import { ProductController } from "../controllers/product.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorize, ROLES } from "../middleware/role.middleware";
import { uploadProductImages } from "../middleware/upload.middleware";
import { BrandRepository } from "../modules/brand/brand.repository";
import { ProductRepository } from "../repositories/product.repository";
import { ProductService } from "../services/product.service";
import {
    createProductValidator,
    deleteProductValidator,
    getProductByIdValidator,
    getProductBySkuValidator,
    getProductBySlugValidator,
    updateProductValidator,
} from "../validators/product.validator";

/**
 * Enterprise Product Routes.
 *
 * HTTP route wiring for the Product module.
 * Composes auth, RBAC, validators, and controller handlers only.
 *
 * Mount under: /api/v1/products
 */

const productRepository = new ProductRepository();
const brandRepository = new BrandRepository();
const productService = new ProductService(
    productRepository,
    brandRepository
);
const productController = new ProductController(productService);

const router = Router();

/**
 * POST /products
 * Roles: ADMIN, SUPER_ADMIN
 */
router.post(
    "/",
    authenticate,
    authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN),
    uploadProductImages,
    ...createProductValidator,
    (req, res, next) => productController.createProduct(req, res, next)
);

/**
 * GET /products
 * Roles: ADMIN, SUPER_ADMIN
 * (Manager / Inventory Manager are not defined in enterprise ROLES)
 */
router.get(
    "/",
    authenticate,
    authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN),
    (req, res, next) => productController.getProducts(req, res, next)
);

/**
 * GET /products/sku/:sku
 * Must be registered before /:id
 */
router.get(
    "/sku/:sku",
    authenticate,
    authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN),
    ...getProductBySkuValidator,
    (req, res, next) => productController.getProductBySku(req, res, next)
);

/**
 * GET /products/slug/:slug
 * Must be registered before /:id
 */
router.get(
    "/slug/:slug",
    authenticate,
    authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN),
    ...getProductBySlugValidator,
    (req, res, next) => productController.getProductBySlug(req, res, next)
);

/**
 * GET /products/:id
 * Roles: ADMIN, SUPER_ADMIN
 */
router.get(
    "/:id",
    authenticate,
    authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN),
    ...getProductByIdValidator,
    (req, res, next) => productController.getProductById(req, res, next)
);

/**
 * PUT /products/:id
 * Roles: ADMIN, SUPER_ADMIN
 */
router.put(
    "/:id",
    authenticate,
    authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN),
    uploadProductImages,
    ...updateProductValidator,
    (req, res, next) => productController.updateProduct(req, res, next)
);

/**
 * DELETE /products/:id
 * Roles: SUPER_ADMIN only
 */
router.delete(
    "/:id",
    authenticate,
    authorize(ROLES.SUPER_ADMIN),
    ...deleteProductValidator,
    (req, res, next) => productController.deleteProduct(req, res, next)
);

export default router;
