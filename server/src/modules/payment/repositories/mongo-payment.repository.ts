import { Model, PipelineStage } from 'mongoose';
import { IPaymentDocument, PaymentModel } from '../models/payment.model';
import { IPaymentRepository } from './payment.repository';
import { PaymentFilters, PaymentPagination } from '../types/payment.types';
import { PaymentStatus } from '../enums/payment.enums';

/**
 * Enterprise Production MongoDB Payment Repository (Module 27.2).
 *
 * Implements IPaymentRepository using Mongoose. Supports dynamic query building,
 * lean pagination, aggregation pipelines, and record cleanup.
 */
export class MongoPaymentRepository implements IPaymentRepository {
  constructor(private readonly model: Model<IPaymentDocument> = PaymentModel) {}

  /**
   * Private query builder transforming PaymentFilters to Mongoose query object.
   */
  private buildQuery(filters?: PaymentFilters): Record<string, unknown> {
    const query: Record<string, unknown> = {};
    if (!filters) return query;

    if (filters.orderId) {
      query.orderId = String(filters.orderId).trim();
    }

    if (filters.customerId) {
      query.userId = String(filters.customerId).trim();
    }

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.provider) {
      query.provider = filters.provider;
    }

    if (filters.method) {
      query.paymentMethod = filters.method;
    }

    if (filters.startDate || filters.endDate) {
      const dateQuery: Record<string, Date> = {};
      if (filters.startDate) dateQuery.$gte = new Date(filters.startDate);
      if (filters.endDate) dateQuery.$lte = new Date(filters.endDate);
      query.createdAt = dateQuery;
    }

    if (filters.search) {
      const searchRegex = new RegExp(filters.search.trim(), 'i');
      query.$or = [
        { paymentId: searchRegex },
        { orderId: searchRegex },
        { userId: searchRegex },
        { gatewayTransactionId: searchRegex },
      ];
    }

    return query;
  }

  /**
   * Persists a new payment transaction record.
   */
  async create(data: Partial<IPaymentDocument>): Promise<IPaymentDocument> {
    const created = await this.model.create(data);
    return created.toObject() as IPaymentDocument;
  }

  /**
   * Bulk creates multiple payment transaction records.
   */
  async createMany(data: Array<Partial<IPaymentDocument>>): Promise<IPaymentDocument[]> {
    if (!data || data.length === 0) return [];
    const createdList = await this.model.insertMany(data);
    return createdList.map((doc: { toObject?: () => unknown }) =>
      (typeof doc.toObject === 'function' ? doc.toObject() : doc) as IPaymentDocument
    );
  }

  /**
   * Updates an existing payment transaction record by MongoDB _id or paymentId.
   */
  async update(id: string, update: Partial<IPaymentDocument>): Promise<IPaymentDocument | null> {
    const filter = id.startsWith('pay_') ? { paymentId: id } : { _id: id };
    const updated = await this.model
      .findOneAndUpdate(filter, { $set: update }, { new: true, runValidators: true })
      .lean();

    return (updated as unknown as IPaymentDocument) || null;
  }

  /**
   * Queries paginated payment records matching criteria filters and sorting.
   */
  async find(
    filters: PaymentFilters,
    pagination: PaymentPagination
  ): Promise<{
    items: IPaymentDocument[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const query = this.buildQuery(filters);
    const page = Math.max(1, pagination.page || 1);
    const limit = Math.max(1, Math.min(pagination.limit || 20, 100));
    const skip = (page - 1) * limit;

    const sortField = pagination.sortBy || 'createdAt';
    const sortOrder = pagination.sortOrder === 'ASC' ? 1 : -1;
    const sortOptions: Record<string, 1 | -1> = { [sortField]: sortOrder };

    const [items, total] = await Promise.all([
      this.model.find(query).sort(sortOptions).skip(skip).limit(limit).lean(),
      this.model.countDocuments(query),
    ]);

    return {
      items: items as unknown as IPaymentDocument[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  /**
   * Retrieves a single payment record by MongoDB _id.
   */
  async findById(id: string): Promise<IPaymentDocument | null> {
    const doc = await this.model.findById(id).lean();
    return (doc as unknown as IPaymentDocument) || null;
  }

  /**
   * Retrieves a single payment record by system paymentId.
   */
  async findByPaymentId(paymentId: string): Promise<IPaymentDocument | null> {
    const doc = await this.model.findOne({ paymentId: paymentId.trim() }).lean();
    return (doc as unknown as IPaymentDocument) || null;
  }

  /**
   * Executes custom MongoDB aggregation pipelines.
   */
  async aggregate<T = unknown>(pipeline: unknown[]): Promise<T[]> {
    const results = await this.model.aggregate(pipeline as PipelineStage[]);
    return results as T[];
  }

  /**
   * Counts total payment records matching criteria.
   */
  async count(filters?: PaymentFilters): Promise<number> {
    const query = this.buildQuery(filters);
    return this.model.countDocuments(query);
  }

  /**
   * Purges abandoned or incomplete payment records created before cutoff date.
   */
  async cleanup(olderThan: Date): Promise<number> {
    const result = await this.model.deleteMany({
      createdAt: { $lt: olderThan },
      status: {
        $in: [PaymentStatus.CREATED, PaymentStatus.PENDING, PaymentStatus.FAILED, PaymentStatus.CANCELLED, PaymentStatus.EXPIRED],
      },
    });

    return result.deletedCount || 0;
  }
}
