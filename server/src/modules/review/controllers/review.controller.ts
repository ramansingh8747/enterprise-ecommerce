import { Request, Response, NextFunction } from 'express';
import { IReviewService } from '../interfaces/review-service.interface';
import { ApiResponse } from '../../../interfaces/api-response.interface';
import {
  ReviewResponse,
  PaginatedReviewsResponse,
} from '../dto/review-response.dto';
import { ReviewStatus } from '../interfaces/review.interface';

/**
 * Enterprise Review Controller (Module 18.5).
 * 
 * Thin HTTP adapter for Reviews & Ratings REST endpoints.
 * Responsibilities (SRP):
 * 1. Read authenticated userId from JWT context (req.user).
 * 2. Parse request path/query/body parameters.
 * 3. Delegate execution strictly to IReviewService interface.
 * 4. Return standardized ApiResponse envelopes.
 * 5. Pass unhandled errors to Express next(error) middleware.
 * 6. Zero business logic inside controller handlers.
 */
export class ReviewController {
  constructor(private readonly reviewService: IReviewService) {}

  /**
   * POST /api/v1/reviews
   * Submits a new product review for the authenticated user.
   */
  async createReview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?._id?.toString() || (req as any).user?.id?.toString();
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication token missing or user unauthorized',
        });
        return;
      }

      const review: ReviewResponse = await this.reviewService.createReview(userId, req.body);

      const response: ApiResponse<ReviewResponse> = {
        success: true,
        message: 'Review submitted successfully and is pending approval.',
        data: review,
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/products/:productId/reviews
   * Retrieves paginated approved reviews and rating summary for a product.
   */
  async getProductReviews(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const productId = String(req.params.productId);
      const page = req.query.page ? parseInt(String(req.query.page), 10) : undefined;
      const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : undefined;
      const status = req.query.status ? (String(req.query.status) as ReviewStatus) : undefined;

      const result: PaginatedReviewsResponse = await this.reviewService.getProductReviews(productId, {
        page,
        limit,
        status,
      });

      const response: ApiResponse<PaginatedReviewsResponse> = {
        success: true,
        message: 'Product reviews retrieved successfully.',
        data: result,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/reviews/me
   * Retrieves paginated reviews authored by the authenticated user.
   */
  async getUserReviews(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?._id?.toString() || (req as any).user?.id?.toString();
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication token missing or user unauthorized',
        });
        return;
      }

      const page = req.query.page ? parseInt(String(req.query.page), 10) : undefined;
      const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : undefined;

      const result: PaginatedReviewsResponse = await this.reviewService.getUserReviews(userId, {
        page,
        limit,
      });

      const response: ApiResponse<PaginatedReviewsResponse> = {
        success: true,
        message: 'User reviews retrieved successfully.',
        data: result,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/reviews/:reviewId
   * Updates an existing review written by the authenticated user.
   */
  async updateReview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?._id?.toString() || (req as any).user?.id?.toString();
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication token missing or user unauthorized',
        });
        return;
      }

      const reviewId = String(req.params.reviewId);

      const review: ReviewResponse = await this.reviewService.updateReview(userId, reviewId, req.body);

      const response: ApiResponse<ReviewResponse> = {
        success: true,
        message: 'Review updated successfully and resubmitted for moderation if approved previously.',
        data: review,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/reviews/:reviewId
   * Deletes a review authored by the user or an administrator.
   */
  async deleteReview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?._id?.toString() || (req as any).user?.id?.toString();
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication token missing or user unauthorized',
        });
        return;
      }

      const reviewId = String(req.params.reviewId);

      await this.reviewService.deleteReview(userId, reviewId);

      const response: ApiResponse = {
        success: true,
        message: 'Review deleted successfully.',
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/v1/reviews/:reviewId/approve
   * Approves a pending review (Admin action).
   */
  async approveReview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const adminId = (req as any).user?._id?.toString() || (req as any).user?.id?.toString();
      if (!adminId) {
        res.status(401).json({
          success: false,
          message: 'Authentication token missing or admin unauthorized',
        });
        return;
      }

      const reviewId = String(req.params.reviewId);

      const review: ReviewResponse = await this.reviewService.approveReview(adminId, reviewId);

      const response: ApiResponse<ReviewResponse> = {
        success: true,
        message: 'Review approved successfully.',
        data: review,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/v1/reviews/:reviewId/reject
   * Rejects a pending or flagged review (Admin action).
   */
  async rejectReview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const adminId = (req as any).user?._id?.toString() || (req as any).user?.id?.toString();
      if (!adminId) {
        res.status(401).json({
          success: false,
          message: 'Authentication token missing or admin unauthorized',
        });
        return;
      }

      const reviewId = String(req.params.reviewId);
      const { reason } = req.body;

      const review: ReviewResponse = await this.reviewService.rejectReview(adminId, reviewId, reason);

      const response: ApiResponse<ReviewResponse> = {
        success: true,
        message: 'Review rejected successfully.',
        data: review,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}
