import { ReviewStatus } from '../interfaces/review.interface';
import { IRatingDistribution } from '../interfaces/rating-summary.interface';

/**
 * Enterprise API Response DTO representation of a merchant reply.
 */
export interface MerchantReplyResponse {
  comment: string;
  repliedAt: Date;
  repliedBy: string;
}

/**
 * Enterprise API Response DTO representation of a product review.
 */
export interface ReviewResponse {
  _id: string;
  userId: string;
  userName?: string;
  userAvatar?: string;
  productId: string;
  variantId?: string;
  orderId?: string;
  rating: number;
  title?: string;
  comment: string;
  images: string[];
  isVerifiedPurchase: boolean;
  status: ReviewStatus;
  helpfulVotes: number;
  unhelpfulVotes: number;
  merchantReply?: MerchantReplyResponse;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Enterprise API Response DTO representation of product rating summaries.
 */
export interface RatingSummaryResponse {
  productId: string;
  averageRating: number;
  totalReviews: number;
  distribution: IRatingDistribution;
  updatedAt: Date;
}

/**
 * Paginated API Response payload for review listing queries.
 */
export interface PaginatedReviewsResponse {
  items: ReviewResponse[];
  summary?: RatingSummaryResponse;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
