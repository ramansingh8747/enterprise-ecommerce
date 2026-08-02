import mongoose, { Document, Model, Schema, Types } from 'mongoose';
import {
  NotificationChannel,
  NotificationPriority,
  NotificationStatus,
  NotificationType,
} from '../types/notification.types';
import { NotificationRecipient } from '../interfaces/notification-recipient.interface';
import { NotificationAttachment } from '../interfaces/notification-attachment.interface';

/**
 * Mongoose Document interface for Notification entity.
 */
export interface INotificationDocument extends Document {
  _id: Types.ObjectId;
  userId?: Types.ObjectId;
  type: NotificationType;
  channel: NotificationChannel;
  status: NotificationStatus;
  priority: NotificationPriority;
  title?: string;
  message: string;
  payload: Record<string, unknown>;
  metadata: Record<string, unknown>;
  recipient: NotificationRecipient;
  attachments: NotificationAttachment[];
  scheduledAt?: Date;
  sentAt?: Date;
  readAt?: Date;
  failureReason?: string;
  retryCount: number;
  maxRetries: number;
  isRead: boolean;
  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Mongoose Schema for Recipient Subdocument.
 */
const RecipientSchema = new Schema<NotificationRecipient>(
  {
    userId: { type: String },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    deviceToken: { type: String, trim: true },
    webhookUrl: { type: String, trim: true },
    name: { type: String, trim: true },
  },
  { _id: false }
);

/**
 * Mongoose Schema for Attachment Subdocument.
 */
const AttachmentSchema = new Schema<NotificationAttachment>(
  {
    filename: { type: String, required: true, trim: true },
    content: { type: Schema.Types.Mixed },
    contentType: { type: String, required: true, trim: true },
    path: { type: String, trim: true },
    cid: { type: String, trim: true },
  },
  { _id: false }
);

/**
 * Mongoose Schema for Notification Aggregate Root.
 */
export const NotificationSchema = new Schema<INotificationDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(NotificationType),
      required: [true, 'Notification type is required'],
      index: true,
    },
    channel: {
      type: String,
      enum: Object.values(NotificationChannel),
      required: [true, 'Notification channel is required'],
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(NotificationStatus),
      default: NotificationStatus.PENDING,
      required: true,
      index: true,
    },
    priority: {
      type: String,
      enum: Object.values(NotificationPriority),
      default: NotificationPriority.NORMAL,
      required: true,
      index: true,
    },
    title: {
      type: String,
      trim: true,
      maxlength: [250, 'Notification title cannot exceed 250 characters'],
    },
    message: {
      type: String,
      required: [true, 'Notification message body is required'],
      trim: true,
      maxlength: [10000, 'Notification message body cannot exceed 10000 characters'],
    },
    payload: {
      type: Schema.Types.Mixed,
      default: {},
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    recipient: {
      type: RecipientSchema,
      required: [true, 'Notification recipient details are required'],
    },
    attachments: {
      type: [AttachmentSchema],
      default: [],
    },
    scheduledAt: {
      type: Date,
      index: true,
    },
    sentAt: {
      type: Date,
    },
    readAt: {
      type: Date,
    },
    failureReason: {
      type: String,
      trim: true,
      maxlength: [2000, 'Failure reason text cannot exceed 2000 characters'],
    },
    retryCount: {
      type: Number,
      default: 0,
      min: [0, 'retryCount cannot be negative'],
      required: true,
    },
    maxRetries: {
      type: Number,
      default: 3,
      min: [0, 'maxRetries cannot be negative'],
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
      required: true,
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    versionKey: false,
    collection: 'notifications',
    strict: true,
  }
);

/* ==========================================================================
   COMPOUND INDEX STRATEGY DEFINITIONS
   ========================================================================== */

// 1. User Inbox Paginated Query Index (Powers user notifications tab sorted by recency)
NotificationSchema.index(
  { userId: 1, isRead: 1, createdAt: -1 },
  { name: 'idx_notification_user_inbox' }
);

// 2. Queue Worker Dispatch Processing Index (Powers background queue pick-up)
NotificationSchema.index(
  { status: 1, priority: -1, scheduledAt: 1, createdAt: 1 },
  { name: 'idx_notification_queue_worker' }
);

// 3. Maintenance & Retention Cleanup Index (Powers automated archiving of sent/failed logs)
NotificationSchema.index(
  { status: 1, createdAt: 1 },
  { name: 'idx_notification_status_created' }
);

/**
 * Mongoose Model for Notification collection.
 */
export const NotificationModel: Model<INotificationDocument> =
  mongoose.models.Notification ||
  mongoose.model<INotificationDocument>('Notification', NotificationSchema);

export default NotificationModel;
