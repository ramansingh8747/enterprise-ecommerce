import { Router } from "express";
import { param } from "express-validator";
import { authenticate } from "../../../middleware/auth.middleware";
import { authorize, ROLES } from "../../../middleware/role.middleware";
import { validateRequest } from "../../../middleware/validate.middleware";
import { ProductRepository } from "../../../repositories/product.repository";
import { MediaController } from "../controllers/media.controller";
import {
    uploadProductMediaImages,
    uploadReplaceMediaImage,
} from "../middleware/multer.middleware";
import { cloudinaryProvider } from "../providers/cloudinary.provider";
import { MediaRepository } from "../repositories/media.repository";
import { MediaService } from "../services/media.service";

/**
 * Enterprise Media Routes — composition root (Step 13.7).
 *
 * Wires MediaRepository + ProductRepository + CloudinaryProvider + MediaService.
 *
 * Nested product media routes mount under: /api/v1/products
 * → POST /api/v1/products/:productId/media
 */

const mediaRepository = new MediaRepository();
const productRepository = new ProductRepository();
const mediaService = new MediaService(
    mediaRepository,
    cloudinaryProvider,
    productRepository
);
const mediaController = new MediaController(mediaService);

const router = Router();

/**
 * Generic /api/v1/media router remains empty until dedicated media APIs are added.
 */
export default router;

/**
 * Nested Product media routes.
 * Mount under `/api/v1/products`.
 */
const productMediaRoutes = Router({ mergeParams: true });

const productIdParamSchema = [
    param("productId")
        .exists({ checkFalsy: true })
        .withMessage("Product id is required.")
        .isMongoId()
        .withMessage("Product id must be a valid Mongo ObjectId."),
];

const mediaIdParamSchema = [
    param("mediaId")
        .exists({ checkFalsy: true })
        .withMessage("Media id is required.")
        .isMongoId()
        .withMessage("Media id must be a valid Mongo ObjectId."),
];

/**
 * POST /products/:productId/media
 * Roles: ADMIN, SUPER_ADMIN
 * multipart field: images (1 → MAX_PRODUCT_IMAGES)
 */
productMediaRoutes.post(
    "/:productId/media",
    authenticate,
    authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN),
    uploadProductMediaImages,
    ...productIdParamSchema,
    validateRequest,
    (req, res, next) => mediaController.uploadProductMedia(req, res, next)
);

/**
 * PATCH /products/:productId/media/:mediaId/primary
 * Roles: ADMIN, SUPER_ADMIN
 */
productMediaRoutes.patch(
    "/:productId/media/:mediaId/primary",
    authenticate,
    authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN),
    ...productIdParamSchema,
    ...mediaIdParamSchema,
    validateRequest,
    (req, res, next) =>
        mediaController.setProductPrimaryMedia(req, res, next)
);

/**
 * PUT /products/:productId/media/:mediaId
 * Roles: ADMIN, SUPER_ADMIN
 * multipart field: image
 */
productMediaRoutes.put(
    "/:productId/media/:mediaId",
    authenticate,
    authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN),
    uploadReplaceMediaImage,
    ...productIdParamSchema,
    ...mediaIdParamSchema,
    validateRequest,
    (req, res, next) => mediaController.replaceProductMedia(req, res, next)
);

/**
 * DELETE /products/:productId/media/:mediaId
 * Roles: ADMIN, SUPER_ADMIN
 */
productMediaRoutes.delete(
    "/:productId/media/:mediaId",
    authenticate,
    authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN),
    ...productIdParamSchema,
    ...mediaIdParamSchema,
    validateRequest,
    (req, res, next) => mediaController.deleteProductMedia(req, res, next)
);

export { mediaRepository, mediaService, mediaController, productMediaRoutes };
