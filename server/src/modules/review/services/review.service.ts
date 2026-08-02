import { Types } from 'mongoose';
import { IReviewRepository } from '../interfaces/review-repository.interface';
import {
  IReviewService,
  ListProductReviewsQuery,
  ListUserReviewsQuery,
} from '../interfaces/review-service.interface';
import { CreateReviewRequest } from '../dto/create-review.dto';
import { UpdateReviewRequest } from '../dto/update-review.dto';
import {
  ReviewResponse,
  RatingSummaryResponse,
  PaginatedReviewsResponse,
} from '../dto/review-response.dto';
import { IReview, ReviewStatus } from '../interfaces/review.interface';
import { IRatingDistribution } from '../interfaces/rating-summary.interface';
import Product from '../../../models/product.model';
import Order from '../../order/models/order.model';
import { OrderStatus } from '../../order/types/order.types';
import User from '../../../models/user.model';

/**
 * Enterprise Review Service Implementation.
 * 
 * Encapsulates all application business rules, eligibility verification,
 * 1-review-per-user invariant checks, verified purchase verification,
 * moderation state transitions, and async rating aggregate calculations.
 */
export class ReviewService implements IReviewService {
  constructor(private readonly reviewRepository: IReviewRepository) {}

  /**
   * Helper method to map domain IReview to presentation ReviewResponse DTO.
   */
  private async mapToResponse(review: IReview): Promise<ReviewResponse> {
    let userName: string | undefined;
    let userAvatar: string | undefined;

    // Optional user lookup to enrich display name and avatar
    if (Types.ObjectId.isValid(review.userId.toString())) {
      const user = await User.findById(review.userId).select('name email avatar').lean().exec();
      if (user) {
        userName = (user as any).name || (user as any).email;
        userAvatar = (user as any).avatar;
      }
    }

    return {
      _id: review._id.toString(),
      userId: review.userId.toString(),
      userName,
      userAvatar,
      productId: review.productId.toString(),
      variantId: review.variantId ? review.variantId.toString() : undefined,
      orderId: review.orderId ? review.orderId.toString() : undefined,
      rating: review.rating,
      title: review.title,
      comment: review.comment,
      images: review.images || [],
      isVerifiedPurchase: review.isVerifiedPurchase,
      status: review.status,
      helpfulVotes: review.helpfulVotes,
      unhelpfulVotes: review.unhelpfulVotes,
      merchantReply: review.merchantReply
        ? {
            comment: review.merchantReply.comment,
            repliedAt: review.merchantReply.repliedAt,
            repliedBy: review.merchantReply.repliedBy.toString(),
          }
        : undefined,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
    };
  }

  /**
   * Recalculates and persists the pre-computed rating summary aggregate for a product.
   */
  private async recalculateRatingSummary(productId: string): Promise<RatingSummaryResponse> {
    const queryResult = await this.reviewRepository.findByProduct(productId, 'APPROVED', {
      page: 1,
      limit: 10000,
    });

    const approvedReviews = queryResult.items;
    const totalReviews = approvedReviews.length;

    const distribution: IRatingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let ratingSum = 0;

    approvedReviews.forEach((review) => {
      ratingSum += review.rating;
      const r = Math.min(Math.max(Math.round(review.rating), 1), 5) as 1 | 2 | 3 | 4 | 5;
      distribution[r] = (distribution[r] || 0) + 1;
    });

    const averageRating = totalReviews > 0 ? Number((ratingSum / totalReviews).toFixed(2)) : 0;

    const summary = await this.reviewRepository.upsertSummary(productId, {
      averageRating,
      totalReviews,
      distribution,
    });

    return {
      productId: summary.productId.toString(),
      averageRating: summary.averageRating,
      totalReviews: summary.totalReviews,
      distribution: summary.distribution,
      updatedAt: summary.updatedAt,
    };
  }

  /**
   * Submits a new review after validating catalog status, 1-review-per-user invariant, and verified purchase.
   */
  async createReview(userId: string, data: CreateReviewRequest): Promise<ReviewResponse> {
    if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(data.productId)) {
      throw new Error('Invalid userId or productId format');
    }

    // 1. Validate Rating integer score range (1 to 5)
    if (!data.rating || data.rating < 1 || data.rating > 5 || !Number.isInteger(data.rating)) {
      throw new Error('Rating must be an integer between 1 and 5');
    }

    // 2. Verify target Product existence and active status
    const product = await Product.findById(data.productId).lean().exec();
    if (!product || (product as any).status === 'ARCHIVED') {
      throw new Error('Product not found or inactive');
    }

    // 3. Enforce 1 Review per User per Product Invariant
    const existingReview = await this.reviewRepository.findByUserAndProduct(userId, data.productId);
    if (existingReview) {
      throw new Error('User has already submitted a review for this product');
    }

    // 4. Check Verified Purchase status against Order aggregate
    let isVerifiedPurchase = false;
    let verifiedOrderId: string | undefined = data.orderId;

    const completedOrder = await Order.findOne({
      customer: new Types.ObjectId(userId),
      'items.productId': new Types.ObjectId(data.productId),
      orderStatus: { $in: [OrderStatus.DELIVERED, OrderStatus.SHIPPED] },
    })
      .lean()
      .exec();

    if (completedOrder) {
      isVerifiedPurchase = true;
      verifiedOrderId = completedOrder._id.toString();
    }

    // 5. Persist initial review in PENDING state
    const createdReview = await this.reviewRepository.create({
      userId,
      productId: data.productId,
      variantId: data.variantId,
      orderId: verifiedOrderId,
      rating: data.rating,
      title: data.title,
      comment: data.comment,
      images: data.images || [],
      isVerifiedPurchase,
      status: 'PENDING',
    });

    return this.mapToResponse(createdReview);
  }

  /**
   * Retrieves paginated approved reviews for a product along with the product rating summary.
   */
  async getProductReviews(
    productId: string,
    query?: ListProductReviewsQuery
  ): Promise<PaginatedReviewsResponse> {
    if (!Types.ObjectId.isValid(productId)) {
      throw new Error(`Invalid productId format: ${productId}`);
    }

    const page = query?.page && query.page > 0 ? query.page : 1;
    const limit = query?.limit && query.limit > 0 ? query.limit : 10;
    const status: ReviewStatus = query?.status || 'APPROVED';

    const [result, summaryDomain] = await Promise.all([
      this.reviewRepository.findByProduct(productId, status, { page, limit }),
      this.reviewRepository.getSummaryByProductId(productId),
    ]);

    const items = await Promise.all(result.items.map((item: IReview) => this.mapToResponse(item)));
    const totalPages = Math.ceil(result.total / limit) || 1;

    const summary: RatingSummaryResponse | undefined = summaryDomain
      ? {
          productId: summaryDomain.productId.toString(),
          averageRating: summaryDomain.averageRating,
          totalReviews: summaryDomain.totalReviews,
          distribution: summaryDomain.distribution,
          updatedAt: summaryDomain.updatedAt,
        }
      : undefined;

    return {
      items,
      summary,
      total: result.total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Retrieves paginated reviews submitted by a specific user.
   */
  async getUserReviews(userId: string, query?: ListUserReviewsQuery): Promise<PaginatedReviewsResponse> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new Error(`Invalid userId format: ${userId}`);
    }

    const page = query?.page && query.page > 0 ? query.page : 1;
    const limit = query?.limit && query.limit > 0 ? query.limit : 10;

    const result = await this.reviewRepository.findByUser(userId, { page, limit });
    const items = await Promise.all(result.items.map((item: IReview) => this.mapToResponse(item)));
    const totalPages = Math.ceil(result.total / limit) || 1;

    return {
      items,
      total: result.total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Updates an existing review written by the requesting user.
   * If an approved review is modified, it transitions back to PENDING for re-moderation.
   */
  async updateReview(userId: string, reviewId: string, data: UpdateReviewRequest): Promise<ReviewResponse> {
    if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(reviewId)) {
      throw new Error('Invalid userId or reviewId format');
    }

    const review = await this.reviewRepository.findById(reviewId);
    if (!review) {
      throw new Error('Review not found');
    }

    if (review.userId.toString() !== userId) {
      throw new Error('Unauthorized: Only the review author can update this review');
    }

    if (data.rating !== undefined) {
      if (data.rating < 1 || data.rating > 5 || !Number.isInteger(data.rating)) {
        throw new Error('Rating must be an integer between 1 and 5');
      }
    }

    const wasApproved = review.status === 'APPROVED';
    const updatePayload: Partial<IReview> = {};

    if (data.rating !== undefined) updatePayload.rating = data.rating;
    if (data.title !== undefined) updatePayload.title = data.title;
    if (data.comment !== undefined) updatePayload.comment = data.comment;
    if (data.images !== undefined) updatePayload.images = data.images;

    // Reset status to PENDING if review was previously approved
    if (wasApproved) {
      updatePayload.status = 'PENDING';
    }

    const updated = await this.reviewRepository.update(reviewId, updatePayload);
    if (!updated) {
      throw new Error('Failed to update review');
    }

    // Recalculate rating summary if previously approved review was set back to PENDING
    if (wasApproved) {
      await this.recalculateRatingSummary(review.productId.toString());
    }

    return this.mapToResponse(updated);
  }

  /**
   * Deletes a review and triggers async rating summary recalculation if the review was APPROVED.
   */
  async deleteReview(userId: string, reviewId: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(reviewId)) {
      throw new Error('Invalid userId or reviewId format');
    }

    const review = await this.reviewRepository.findById(reviewId);
    if (!review) {
      throw new Error('Review not found');
    }

    const isAuthor = review.userId.toString() === userId;
    // User check or author verification
    if (!isAuthor) {
      const user = await User.findById(userId).lean().exec();
      const isAdmin = user && ((user as any).role === 'ADMIN' || (user as any).role === 'SUPER_ADMIN' || (user as any).role === 'admin');
      if (!isAdmin) {
        throw new Error('Unauthorized to delete this review');
      }
    }

    const wasApproved = review.status === 'APPROVED';
    const deleted = await this.reviewRepository.delete(reviewId);

    if (deleted && wasApproved) {
      await this.recalculateRatingSummary(review.productId.toString());
    }

    return deleted;
  }

  /**
   * Approves a pending review (Admin action) and updates the product rating summary aggregate.
   */
  async approveReview(adminId: string, reviewId: string): Promise<ReviewResponse> {
    if (!Types.ObjectId.isValid(adminId) || !Types.ObjectId.isValid(reviewId)) {
      throw new Error('Invalid adminId or reviewId format');
    }

    const approved = await this.reviewRepository.approve(reviewId);
    if (!approved) {
      throw new Error('Review not found');
    }

    // Recalculate rating summary after approval
    await this.recalculateRatingSummary(approved.productId.toString());

    return this.mapToResponse(approved);
  }

  /**
   * Rejects a pending or flagged review (Admin action).
   */
  async rejectReview(adminId: string, reviewId: string, reason?: string): Promise<ReviewResponse> {
    if (!Types.ObjectId.isValid(adminId) || !Types.ObjectId.isValid(reviewId)) {
      throw new Error('Invalid adminId or reviewId format');
    }

    const existing = await this.reviewRepository.findById(reviewId);
    const wasApproved = existing?.status === 'APPROVED';

    const rejected = await this.reviewRepository.reject(reviewId, reason);
    if (!rejected) {
      throw new Error('Review not found');
    }

    if (wasApproved) {
      await this.recalculateRatingSummary(rejected.productId.toString());
    }

    return this.mapToResponse(rejected);
  }
}
