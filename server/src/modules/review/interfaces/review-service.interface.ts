import { CreateReviewRequest } from '../dto/create-review.dto';
import { UpdateReviewRequest } from '../dto/update-review.dto';
import { ReviewResponse, PaginatedReviewsResponse } from '../dto/review-response.dto';
import { ReviewStatus } from './review.interface';

export interface ListProductReviewsQuery {
  page?: number;
  limit?: number;
  status?: ReviewStatus;
}

export interface ListUserReviewsQuery {
  page?: number;
  limit?: number;
}

/**
 * Enterprise Review Service Contract (Clean Architecture Application Boundary).
 * Encapsulates all business logic rules, 1-review-per-user enforcement,
 * verified purchase checks, moderation workflows, and rating summary recalculations.
 */
export interface IReviewService {
  /**
   * Submits a new review for a product after verifying user eligibility and purchase history.
   * @param userId Authenticated author user ID
   * @param data Creation payload
   * @returns Populated ReviewResponse model
   */
  createReview(userId: string, data: CreateReviewRequest): Promise<ReviewResponse>;

  /**
   * Fetches paginated approved reviews for a product along with rating summary.
   * @param productId Target product ID
   * @param query Pagination and filtering parameters
   * @returns Paginated review list with rating summary
   */
  getProductReviews(productId: string, query?: ListProductReviewsQuery): Promise<PaginatedReviewsResponse>;

  /**
   * Fetches paginated reviews submitted by a specific user.
   * @param userId Target author user ID
   * @param query Pagination parameters
   * @returns Paginated user review list
   */
  getUserReviews(userId: string, query?: ListUserReviewsQuery): Promise<PaginatedReviewsResponse>;

  /**
   * Updates an existing review written by the requesting user.
   * @param userId Authenticated author user ID
   * @param reviewId Target review ID
   * @param data Update payload
   * @returns Updated ReviewResponse model
   */
  updateReview(userId: string, reviewId: string, data: UpdateReviewRequest): Promise<ReviewResponse>;

  /**
   * Deletes a review and triggers async recalculation of product rating summary.
   * @param userId Authenticated author user ID or admin ID
   * @param reviewId Target review ID
   * @returns True if successfully deleted
   */
  deleteReview(userId: string, reviewId: string): Promise<boolean>;

  /**
   * Approves a pending review (Admin action) and updates the product rating aggregate.
   * @param adminId Authenticated administrator user ID
   * @param reviewId Target review ID
   * @returns Updated ReviewResponse model
   */
  approveReview(adminId: string, reviewId: string): Promise<ReviewResponse>;

  /**
   * Rejects a pending or flagged review (Admin action).
   * @param adminId Authenticated administrator user ID
   * @param reviewId Target review ID
   * @param reason Optional rejection notes
   * @returns Updated ReviewResponse model
   */
  rejectReview(adminId: string, reviewId: string, reason?: string): Promise<ReviewResponse>;
}
