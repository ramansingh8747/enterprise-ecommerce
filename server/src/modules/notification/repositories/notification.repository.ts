import { Types } from 'mongoose';
import { INotification } from '../interfaces/notification.interface';
import {
  INotificationRepository,
  INotificationQueryFilter,
  INotificationQueryResult,
} from '../interfaces/notification-repository.interface';
import {
  NotificationChannel,
  NotificationPriority,
  NotificationStatus,
  NotificationType,
} from '../types/notification.types';
import NotificationModel from '../models/notification.model';

/**
 * Enterprise Notification Repository Implementation (Module 19.3).
 * 
 * Handles all database persistence operations for Notifications using Mongoose.
 * Adheres to Clean Architecture, SOLID principles, and Repository Pattern.
 * Exposes plain domain representations (INotification) to prevent driver leakage.
 */
export class NotificationRepository implements INotificationRepository {
  /**
   * Translates a Mongoose document or lean query result to a plain INotification domain interface.
   */
  private mapToDomain(doc: any): INotification {
    if (!doc) {
      throw new Error('Cannot map null or undefined document to domain entity');
    }

    return {
      _id: doc._id ? doc._id.toString() : undefined,
      userId: doc.userId ? doc.userId.toString() : undefined,
      type: doc.type as NotificationType,
      channel: doc.channel as NotificationChannel,
      status: doc.status as NotificationStatus,
      priority: (doc.priority as NotificationPriority) || NotificationPriority.NORMAL,
      title: doc.title,
      message: doc.message,
      payload: doc.payload || {},
      metadata: doc.metadata || {},
      recipient: doc.recipient || {},
      attachments: doc.attachments || [],
      scheduledAt: doc.scheduledAt ? new Date(doc.scheduledAt) : undefined,
      sentAt: doc.sentAt ? new Date(doc.sentAt) : undefined,
      readAt: doc.readAt ? new Date(doc.readAt) : undefined,
      failureReason: doc.failureReason,
      retryCount: doc.retryCount || 0,
      maxRetries: doc.maxRetries ?? 3,
      isRead: Boolean(doc.isRead),
      createdBy: doc.createdBy ? doc.createdBy.toString() : undefined,
      updatedBy: doc.updatedBy ? doc.updatedBy.toString() : undefined,
      createdAt: doc.createdAt ? new Date(doc.createdAt) : undefined,
      updatedAt: doc.updatedAt ? new Date(doc.updatedAt) : undefined,
      template: doc.template,
      subject: doc.subject || doc.title,
      body: doc.body || doc.message,
      orderId: doc.orderId ? doc.orderId.toString() : undefined,
      providerMessageId: doc.providerMessageId,
    };
  }

  /**
   * Executes a paginated, sorted, and filtered query against the notifications collection.
   */
  private async executePaginatedQuery(
    baseFilter: any,
    filter?: INotificationQueryFilter
  ): Promise<INotificationQueryResult> {
    const page = filter?.page && filter.page > 0 ? filter.page : 1;
    const limit = filter?.limit && filter.limit > 0 ? Math.min(filter.limit, 100) : 10;
    const skip = (page - 1) * limit;

    const sortField = filter?.sortBy || 'createdAt';
    const sortOrder = filter?.sortOrder === 'asc' ? 1 : -1;
    const sortOptions: any = { [sortField]: sortOrder };

    const queryFilter = { ...baseFilter };
    if (filter?.type) queryFilter.type = filter.type;
    if (filter?.channel) queryFilter.channel = filter.channel;
    if (filter?.status) queryFilter.status = filter.status;
    if (filter?.priority) queryFilter.priority = filter.priority;
    if (filter?.isRead !== undefined) queryFilter.isRead = filter.isRead;

    const [docs, total] = await Promise.all([
      NotificationModel.find(queryFilter)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      NotificationModel.countDocuments(queryFilter).exec(),
    ]);

    const items = docs.map((doc) => this.mapToDomain(doc));
    const totalPages = Math.ceil(total / limit) || 1;

    return {
      items,
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Creates and persists a new Notification document in MongoDB.
   */
  async create(data: Partial<INotification>): Promise<INotification> {
    const payload: any = {
      userId: data.userId ? new Types.ObjectId(data.userId.toString()) : undefined,
      type: data.type,
      channel: data.channel,
      status: data.status || NotificationStatus.PENDING,
      priority: data.priority || NotificationPriority.NORMAL,
      title: data.title || data.subject,
      message: data.message || data.body,
      payload: data.payload || {},
      metadata: (data.metadata as any) || {},
      recipient: data.recipient,
      attachments: data.attachments || [],
      scheduledAt: data.scheduledAt,
      retryCount: data.retryCount || 0,
      maxRetries: data.maxRetries ?? 3,
      isRead: data.isRead || false,
      createdBy: data.createdBy ? new Types.ObjectId(data.createdBy.toString()) : undefined,
    };

    const doc = await NotificationModel.create(payload);
    return this.mapToDomain(doc.toObject());
  }

  /**
   * Finds a Notification by its unique primary key ID.
   */
  async findById(id: string): Promise<INotification | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    const doc = await NotificationModel.findById(id).lean().exec();
    return doc ? this.mapToDomain(doc) : null;
  }

  /**
   * Finds paginated notifications for a specific user.
   */
  async findByUser(
    userId: string,
    filter?: INotificationQueryFilter
  ): Promise<INotificationQueryResult> {
    if (!Types.ObjectId.isValid(userId)) {
      return { items: [], total: 0, page: 1, limit: 10, totalPages: 1 };
    }

    const baseFilter = { userId: new Types.ObjectId(userId) };
    return this.executePaginatedQuery(baseFilter, filter);
  }

  /**
   * Finds paginated notifications by delivery status.
   */
  async findByStatus(
    status: NotificationStatus,
    filter?: INotificationQueryFilter
  ): Promise<INotificationQueryResult> {
    const baseFilter = { status };
    return this.executePaginatedQuery(baseFilter, filter);
  }

  /**
   * Finds paginated notifications by delivery channel.
   */
  async findByChannel(
    channel: NotificationChannel,
    filter?: INotificationQueryFilter
  ): Promise<INotificationQueryResult> {
    const baseFilter = { channel };
    return this.executePaginatedQuery(baseFilter, filter);
  }

  /**
   * Finds paginated notifications by event type.
   */
  async findByType(
    type: NotificationType,
    filter?: INotificationQueryFilter
  ): Promise<INotificationQueryResult> {
    const baseFilter = { type };
    return this.executePaginatedQuery(baseFilter, filter);
  }

  /**
   * Finds paginated unread notifications for a specific user.
   */
  async findUnreadByUser(
    userId: string,
    filter?: INotificationQueryFilter
  ): Promise<INotificationQueryResult> {
    if (!Types.ObjectId.isValid(userId)) {
      return { items: [], total: 0, page: 1, limit: 10, totalPages: 1 };
    }

    const baseFilter = {
      userId: new Types.ObjectId(userId),
      isRead: false,
    };

    return this.executePaginatedQuery(baseFilter, filter);
  }

  /**
   * Finds pending/scheduled notifications ready for queue dispatch.
   */
  async findScheduledReady(now: Date = new Date(), limit: number = 50): Promise<INotification[]> {
    const query = {
      status: { $in: [NotificationStatus.PENDING, NotificationStatus.QUEUED] },
      $or: [{ scheduledAt: { $exists: false } }, { scheduledAt: null }, { scheduledAt: { $lte: now } }],
    };

    const docs = await NotificationModel.find(query)
      .sort({ priority: -1, createdAt: 1 })
      .limit(limit)
      .lean()
      .exec();

    return docs.map((doc) => this.mapToDomain(doc));
  }

  /**
   * Updates an existing notification document by ID.
   */
  async update(id: string, data: Partial<INotification>): Promise<INotification | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    const updatePayload: any = { ...data };
    delete updatePayload._id;

    if (data.userId) updatePayload.userId = new Types.ObjectId(data.userId.toString());
    if (data.updatedBy) updatePayload.updatedBy = new Types.ObjectId(data.updatedBy.toString());

    const updatedDoc = await NotificationModel.findByIdAndUpdate(
      id,
      { $set: updatePayload },
      { new: true }
    )
      .lean()
      .exec();

    return updatedDoc ? this.mapToDomain(updatedDoc) : null;
  }

  /**
   * Updates notification status and optional failure reason.
   */
  async updateStatus(
    id: string,
    status: NotificationStatus,
    failureReason?: string
  ): Promise<INotification | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    const updatePayload: any = { status };
    if (status === NotificationStatus.SENT) {
      updatePayload.sentAt = new Date();
    }
    if (failureReason) {
      updatePayload.failureReason = failureReason;
    }

    return this.update(id, updatePayload);
  }

  /**
   * Marks a single notification as read.
   */
  async markAsRead(id: string): Promise<INotification | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    return this.update(id, {
      isRead: true,
      readAt: new Date(),
    });
  }

  /**
   * Marks multiple notifications as read for a user.
   */
  async markMultipleAsRead(ids: string[]): Promise<number> {
    const validObjectIds = ids.filter((id) => Types.ObjectId.isValid(id)).map((id) => new Types.ObjectId(id));

    if (validObjectIds.length === 0) {
      return 0;
    }

    const result = await NotificationModel.updateMany(
      { _id: { $in: validObjectIds } },
      {
        $set: {
          isRead: true,
          readAt: new Date(),
        },
      }
    ).exec();

    return result.modifiedCount || 0;
  }

  /**
   * Increments retry count and updates failure diagnostic text.
   */
  async incrementRetryCount(id: string, failureReason?: string): Promise<INotification | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    const updatePayload: any = {
      $inc: { retryCount: 1 },
    };

    if (failureReason) {
      updatePayload.$set = {
        failureReason,
        status: NotificationStatus.RETRYING,
      };
    }

    const updatedDoc = await NotificationModel.findByIdAndUpdate(id, updatePayload, { new: true })
      .lean()
      .exec();

    return updatedDoc ? this.mapToDomain(updatedDoc) : null;
  }

  /**
   * Hard-deletes a notification by ID.
   */
  async delete(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) {
      return false;
    }

    const result = await NotificationModel.findByIdAndDelete(id).exec();
    return Boolean(result);
  }

  /**
   * Counts total unread notifications for a user.
   */
  async countUnread(userId: string): Promise<number> {
    if (!Types.ObjectId.isValid(userId)) {
      return 0;
    }

    return NotificationModel.countDocuments({
      userId: new Types.ObjectId(userId),
      isRead: false,
    }).exec();
  }

  /* ==========================================================================
     BACKWARD COMPATIBILITY PLACEHOLDERS
     ========================================================================== */

  async findByOrderId(orderId: string): Promise<INotification[]> {
    if (!Types.ObjectId.isValid(orderId)) {
      return [];
    }

    const docs = await NotificationModel.find({
      'payload.orderId': orderId,
    })
      .lean()
      .exec();

    return docs.map((doc) => this.mapToDomain(doc));
  }

  async updateById(id: string, data: unknown): Promise<INotification | null> {
    return this.update(id, data as Partial<INotification>);
  }
}
