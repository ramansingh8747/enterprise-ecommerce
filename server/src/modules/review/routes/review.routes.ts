import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../../../middleware/auth.middleware';
import { authorize, ROLES } from '../../../middleware/role.middleware';
import { reviewController } from '../../../container';
import {
  createReviewValidation,
  updateReviewValidation,
  deleteReviewValidation,
  approveReviewValidation,
  rejectReviewValidation,
  getProductReviewsValidation,
} from '../validations/review.validation';

const reviewRouter = Router();

/* ==========================================================================
   PUBLIC ENDPOINTS
   ========================================================================== */

/**
 * GET /api/v1/reviews/product/:productId
 * Public endpoint to fetch paginated approved reviews and rating summary for a product.
 */
reviewRouter.get(
  '/product/:productId',
  getProductReviewsValidation,
  (req: Request, res: Response, next: NextFunction) => reviewController.getProductReviews(req, res, next)
);

/* ==========================================================================
   AUTHENTICATED CUSTOMER ENDPOINTS (JWT Required)
   ========================================================================== */

/**
 * GET /api/v1/reviews/me
 * Fetches paginated reviews submitted by the requesting user.
 */
reviewRouter.get('/me', authenticate, (req: Request, res: Response, next: NextFunction) =>
  reviewController.getUserReviews(req, res, next)
);

/**
 * POST /api/v1/reviews
 * Submits a new review for a product.
 */
reviewRouter.post(
  '/',
  authenticate,
  createReviewValidation,
  (req: Request, res: Response, next: NextFunction) => reviewController.createReview(req, res, next)
);

/**
 * PUT /api/v1/reviews/:reviewId
 * Updates an existing review authored by the user.
 */
reviewRouter.put(
  '/:reviewId',
  authenticate,
  updateReviewValidation,
  (req: Request, res: Response, next: NextFunction) => reviewController.updateReview(req, res, next)
);

/**
 * DELETE /api/v1/reviews/:reviewId
 * Deletes a review authored by the user or an administrator.
 */
reviewRouter.delete(
  '/:reviewId',
  authenticate,
  deleteReviewValidation,
  (req: Request, res: Response, next: NextFunction) => reviewController.deleteReview(req, res, next)
);

/* ==========================================================================
   ADMINISTRATOR MODERATION ENDPOINTS (JWT + RBAC Required)
   ========================================================================== */

/**
 * PATCH /api/v1/reviews/:reviewId/approve
 * Approves a pending or flagged review.
 */
reviewRouter.patch(
  '/:reviewId/approve',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  approveReviewValidation,
  (req: Request, res: Response, next: NextFunction) => reviewController.approveReview(req, res, next)
);

/**
 * PATCH /api/v1/reviews/:reviewId/reject
 * Rejects a pending or flagged review.
 */
reviewRouter.patch(
  '/:reviewId/reject',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  rejectReviewValidation,
  (req: Request, res: Response, next: NextFunction) => reviewController.rejectReview(req, res, next)
);

export default reviewRouter;
