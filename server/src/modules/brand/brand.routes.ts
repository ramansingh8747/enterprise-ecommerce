import { Request, Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { authorize, ROLES } from "../../middleware/role.middleware";
import { uploadBrandLogo } from "../../middleware/upload.middleware";
import { BrandController } from "./brand.controller";
import { BrandRepository } from "./brand.repository";
import { BrandService } from "./brand.service";
import {
    brandIdParamSchema,
    brandSlugParamSchema,
    createBrandSchema,
    getBrandsQuerySchema,
    updateBrandSchema,
    updateBrandStatusSchema,
} from "./brand.validation";

/**
 * Enterprise Brand Routes.
 *
 * HTTP route wiring for the Brand module.
 * Composes auth, RBAC, validators, upload, and controller handlers only.
 *
 * Mount under: /api/v1/brands
 */

const brandRepository = new BrandRepository();
const brandService = new BrandService(brandRepository);
const brandController = new BrandController(brandService);

const router = Router();

/**
 * ---------------------------------------------------------
 * Public GET routes
 * Static paths must be registered before /:id
 * ---------------------------------------------------------
 */

/**
 * GET /brands/slug/:slug
 */
router.get(
    "/slug/:slug",
    ...brandSlugParamSchema,
    (req, res, next) =>
        brandController.getBrandBySlug(req as Request, res, next)
);

/**
 * GET /brands
 * Enterprise listing: keyword search, filters, sort, pagination, field selection.
 */
router.get(
    "/",
    ...getBrandsQuerySchema,
    (req, res, next) =>
        brandController.getAllBrands(req as Request, res, next)
);

/**
 * GET /brands/:id
 */
router.get(
    "/:id",
    ...brandIdParamSchema,
    (req, res, next) =>
        brandController.getBrandById(req as Request, res, next)
);

/**
 * ---------------------------------------------------------
 * Protected Admin routes (ADMIN, SUPER_ADMIN)
 * ---------------------------------------------------------
 */

/**
 * POST /brands
 * Optional multipart field: logo (Cloudinary).
 */
router.post(
    "/",
    authenticate,
    authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN),
    uploadBrandLogo,
    ...createBrandSchema,
    (req, res, next) =>
        brandController.createBrand(req as Request, res, next)
);

/**
 * PATCH /brands/:id/status
 * Registered before /:id so the static segment is matched first.
 */
router.patch(
    "/:id/status",
    authenticate,
    authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN),
    ...brandIdParamSchema,
    ...updateBrandStatusSchema,
    (req, res, next) =>
        brandController.updateBrandStatus(req as Request, res, next)
);

/**
 * PATCH /brands/:id
 * Optional multipart field: logo (Cloudinary) — create or replace logo.
 */
router.patch(
    "/:id",
    authenticate,
    authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN),
    ...brandIdParamSchema,
    uploadBrandLogo,
    ...updateBrandSchema,
    (req, res, next) =>
        brandController.updateBrand(req as Request, res, next)
);

/**
 * DELETE /brands/:id
 */
router.delete(
    "/:id",
    authenticate,
    authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN),
    ...brandIdParamSchema,
    (req, res, next) =>
        brandController.deleteBrand(req as Request, res, next)
);

export default router;
export { brandRepository, brandService, brandController };
