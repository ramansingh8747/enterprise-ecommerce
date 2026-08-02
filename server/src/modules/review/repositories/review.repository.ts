import { Types } from 'mongoose';
import { IReview, ReviewStatus } from '../interfaces/review.interface';
import {
  IReviewRepository,
  ICreateReviewData,
  IReviewListFilter,
  IReviewQueryResult,
} from '../interfaces/review-repository.interface';
import { IProductRatingSummary } from '../interfaces/rating-summary.interface';
import ReviewModel from '../models/review.model';
import ProductRatingSummaryModel from '../models/product-rating-summary.model';

/**
 * Enterprise Review Repository Implementation.
 * 
 * Handles all database queries for Reviews and Product Rating Summaries using Mongoose.
 * Adheres strictly to the Single Responsibility Principle (SRP) and Repository Pattern.
 * Exposes plain domain representations (IReview, IProductRatingSummary) to prevent driver leakage.
 */
export class ReviewRepository implements IReviewRepository {
  /**
   * Helper mapping method to translate raw Mongoose document / lean query objects to domain IReview interface.
   */
  private mapToDomain(doc: any): IReview {
    return {
      _id: doc._id,
      userId: doc.userId,
      productId: doc.productId,
      variantId: doc.variantId,
      orderId: doc.orderId,
      rating: doc.rating,
      title: doc.title,
      comment: doc.comment,
      images: doc.images || [],
      isVerifiedPurchase: Boolean(doc.isVerifiedPurchase),
      status: doc.status,
      helpfulVotes: doc.helpfulVotes || 0,
      unhelpfulVotes: doc.unhelpfulVotes || 0,
      merchantReply: doc.merchantReply
        ? {
            comment: doc.merchantReply.comment,
            repliedAt: doc.merchantReply.repliedAt,
            repliedBy: doc.merchantReply.repliedBy,
          }
        : undefined,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  /**
   * Helper mapping method for Product Rating Summary.
   */
  private mapSummaryToDomain(doc: any): IProductRatingSummary {
    return {
      productId: doc.productId,
      averageRating: doc.averageRating || 0,
      totalReviews: doc.totalReviews || 0,
      distribution: doc.distribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      updatedAt: doc.updatedAt,
    };
  }

  /**
   * Persists a new Review document in MongoDB.
   */
  async create(data: ICreateReviewData): Promise<IReview> {
    const payload = {
      userId: new Types.ObjectId(data.userId),
      productId: new Types.ObjectId(data.productId),
      variantId: data.variantId ? new Types.ObjectId(data.variantId) : undefined,
      orderId: data.orderId ? new Types.ObjectId(data.orderId) : undefined,
      rating: data.rating,
      title: data.title,
      comment: data.comment,
      images: data.images || [],
      isVerifiedPurchase: data.isVerifiedPurchase,
      status: data.status,
    };

    const doc = await ReviewModel.create(payload);
    return this.mapToDomain(doc.toObject());
  }

  /**
   * Finds a Review by ID using lean query execution.
   */
  async findById(id: string): Promise<IReview | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    const doc = await ReviewModel.findById(id).lean().exec();
    return doc ? this.mapToDomain(doc) : null;
  }

  /**
   * Finds a review by user ID and product ID to check 1-review-per-user invariant.
   */
  async findByUserAndProduct(userId: string, productId: string): Promise<IReview | null> {
    if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(productId)) {
      return null;
    }

    const doc = await ReviewModel.findOne({
      userId: new Types.ObjectId(userId),
      productId: new Types.ObjectId(productId),
    })
      .lean()
      .exec();

    return doc ? this.mapToDomain(doc) : null;
  }

  /**
   * Finds paginated reviews for a product with optional status filtering.
   */
  async findByProduct(
    productId: string,
    status?: ReviewStatus,
    filter?: IReviewListFilter
  ): Promise<IReviewQueryResult> {
    if (!Types.ObjectId.isValid(productId)) {
      return { items: [], total: 0 };
    }

    const queryFilter: any = { productId: new Types.ObjectId(productId) };
    if (status) {
      queryFilter.status = status;
    }

    const page = filter?.page && filter.page > 0 ? filter.page : 1;
    const limit = filter?.limit && filter.limit > 0 ? filter.limit : 10;
    const skip = (page - 1) * limit;

    const [docs, total] = await Promise.all([
      ReviewModel.find(queryFilter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      ReviewModel.countDocuments(queryFilter).exec(),
    ]);

    return {
      items: docs.map((doc) => this.mapToDomain(doc)),
      total,
    };
  }

  /**
   * Finds paginated reviews submitted by a specific user.
   */
  async findByUser(userId: string, filter?: IReviewListFilter): Promise<IReviewQueryResult> {
    if (!Types.ObjectId.isValid(userId)) {
      return { items: [], total: 0 };
    }

    const queryFilter = { userId: new Types.ObjectId(userId) };

    const page = filter?.page && filter.page > 0 ? filter.page : 1;
    const limit = filter?.limit && filter.limit > 0 ? filter.limit : 10;
    const skip = (page - 1) * limit;

    const [docs, total] = await Promise.all([
      ReviewModel.find(queryFilter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      ReviewModel.countDocuments(queryFilter).exec(),
    ]);

    return {
      items: docs.map((doc) => this.mapToDomain(doc)),
      total,
    };
  }

  /**
   * Updates an existing review document by ID.
   */
  async update(id: string, data: Partial<IReview>): Promise<IReview | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    const updatedDoc = await ReviewModel.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true }
    )
      .lean()
      .exec();

    return updatedDoc ? this.mapToDomain(updatedDoc) : null;
  }

  /**
   * Hard-deletes a review document by ID.
   */
  async delete(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) {
      return false;
    }

    const result = await ReviewModel.findByIdAndDelete(id).exec();
    return Boolean(result);
  }

  /**
   * Transitions review status to 'APPROVED'.
   */
  async approve(id: string): Promise<IReview | null> {
    return this.update(id, { status: 'APPROVED' });
  }

  /**
   * Transitions review status to 'REJECTED'.
   */
  async reject(id: string, _reason?: string): Promise<IReview | null> {
    return this.update(id, { status: 'REJECTED' });
  }

  /* ==========================================================================
     RATING SUMMARY PERSISTENCE METHODS
     ========================================================================== */

  /**
   * Fetches pre-calculated product rating summary by product ID.
   */
  async getSummaryByProductId(productId: string): Promise<IProductRatingSummary | null> {
    if (!Types.ObjectId.isValid(productId)) {
      return null;
    }

    const doc = await ProductRatingSummaryModel.findOne({
      productId: new Types.ObjectId(productId),
    })
      .lean()
      .exec();

    return doc ? this.mapSummaryToDomain(doc) : null;
  }

  /**
   * Upserts the pre-calculated rating summary aggregate for a product.
   */
  async upsertSummary(
    productId: string,
    summary: Partial<IProductRatingSummary>
  ): Promise<IProductRatingSummary> {
    if (!Types.ObjectId.isValid(productId)) {
      throw new Error(`Invalid productId format: ${productId}`);
    }

    const productObjId = new Types.ObjectId(productId);

    const doc = await ProductRatingSummaryModel.findOneAndUpdate(
      { productId: productObjId },
      {
        $set: {
          productId: productObjId,
          averageRating: summary.averageRating || 0,
          totalReviews: summary.totalReviews || 0,
          distribution: summary.distribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        },
      },
      { new: true, upsert: true }
    )
      .lean()
      .exec();

    return this.mapSummaryToDomain(doc);
  }
}
