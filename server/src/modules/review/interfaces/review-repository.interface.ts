import { IReview, ReviewStatus } from './review.interface';
import { IProductRatingSummary } from './rating-summary.interface';

/**
 * Filter and pagination query criteria for repository list queries.
 */
export interface IReviewListFilter {
  productId?: string;
  userId?: string;
  status?: ReviewStatus;
  page?: number;
  limit?: number;
}

/**
 * Paginated persistence query result wrapper.
 */
export interface IReviewQueryResult {
  items: IReview[];
  total: number;
}

/**
 * Data payload required to persist a new review document.
 */
export interface ICreateReviewData {
  userId: string;
  productId: string;
  variantId?: string;
  orderId?: string;
  rating: number;
  title?: string;
  comment: string;
  images?: string[];
  isVerifiedPurchase: boolean;
  status: ReviewStatus;
}

/**
 * Enterprise Review Repository Contract (Dependency Inversion Principle).
 * Exposes data persistence contracts without database driver leakage.
 */
export interface IReviewRepository {
  /**
   * Persists a new Review document.
   */
  create(data: ICreateReviewData): Promise<IReview>;

  /**
   * Finds a Review by its unique primary key.
   */
  findById(id: string): Promise<IReview | null>;

  /**
   * Finds a review by user ID and product ID to check 1-review-per-user invariant.
   */
  findByUserAndProduct(userId: string, productId: string): Promise<IReview | null>;

  /**
   * Finds reviews for a target product with optional status filtering and pagination.
   */
  findByProduct(
    productId: string,
    status?: ReviewStatus,
    filter?: IReviewListFilter
  ): Promise<IReviewQueryResult>;

  /**
   * Finds reviews submitted by a specific user with pagination.
   */
  findByUser(userId: string, filter?: IReviewListFilter): Promise<IReviewQueryResult>;

  /**
   * Updates an existing review document by ID.
   */
  update(id: string, data: Partial<IReview>): Promise<IReview | null>;

  /**
   * Hard-deletes a review document by ID.
   */
  delete(id: string): Promise<boolean>;

  /**
   * Transitions a review status to 'APPROVED'.
   */
  approve(id: string): Promise<IReview | null>;

  /**
   * Transitions a review status to 'REJECTED'.
   */
  reject(id: string, reason?: string): Promise<IReview | null>;

  /**
   * Fetches pre-calculated product rating summary by product ID.
   */
  getSummaryByProductId(productId: string): Promise<IProductRatingSummary | null>;

  /**
   * Upserts the pre-calculated rating summary aggregate for a product.
   */
  upsertSummary(productId: string, summary: Partial<IProductRatingSummary>): Promise<IProductRatingSummary>;
}
