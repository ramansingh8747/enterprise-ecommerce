import { Schema, model, Document } from 'mongoose';
import { PaymentMethod, PaymentProvider, PaymentStatus, PaymentType } from '../enums/payment.enums';
import { DEFAULT_CURRENCY } from '../constants/payment.constants';

/**
 * Mongoose Subdocument Interface for Webhook Verification Info.
 */
export interface IWebhookSubdocument {
  verified: boolean;
  receivedAt?: Date;
  signature?: string;
  payloadReference?: string;
}

/**
 * Mongoose Subdocument Interface for Retry Tracking Info.
 */
export interface IRetrySubdocument {
  attempts: number;
  maxAttempts: number;
  lastAttemptAt?: Date;
}

/**
 * Mongoose Subdocument Interface for Refund Items.
 */
export interface IRefundSubdocument {
  refundId: string;
  amount: number;
  reason?: string;
  status: PaymentStatus;
  processedAt: Date;
}

/**
 * Mongoose Document Interface for Payment Record.
 */
export interface IPaymentDocument extends Document {
  paymentId: string;
  orderId: string;
  userId: string;
  provider: PaymentProvider;
  paymentMethod: PaymentMethod;
  paymentType: PaymentType;
  status: PaymentStatus;
  currency: string;
  amount: number;
  paidAmount: number;
  refundedAmount: number;
  gatewayTransactionId?: string;
  gatewayPaymentId?: string;
  gatewayOrderId?: string;
  metadata?: Record<string, unknown>;
  webhook?: IWebhookSubdocument;
  retry?: IRetrySubdocument;
  refunds?: IRefundSubdocument[];
  failureReason?: string;
  expiresAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Webhook Subdocument Schema
 */
const WebhookSchema = new Schema<IWebhookSubdocument>(
  {
    verified: { type: Boolean, default: false },
    receivedAt: { type: Date },
    signature: { type: String, trim: true },
    payloadReference: { type: String, trim: true },
  },
  { _id: false }
);

/**
 * Retry Subdocument Schema
 */
const RetrySchema = new Schema<IRetrySubdocument>(
  {
    attempts: { type: Number, default: 0, min: 0 },
    maxAttempts: { type: Number, default: 3, min: 1 },
    lastAttemptAt: { type: Date },
  },
  { _id: false }
);

/**
 * Refund Subdocument Schema
 */
const RefundSchema = new Schema<IRefundSubdocument>(
  {
    refundId: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    reason: { type: String, trim: true },
    status: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.REFUNDED,
    },
    processedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

/**
 * Core Payment Transaction Mongoose Schema (Module 27.2).
 */
const PaymentSchema = new Schema<IPaymentDocument>(
  {
    paymentId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    orderId: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    provider: {
      type: String,
      enum: Object.values(PaymentProvider),
      required: true,
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: Object.values(PaymentMethod),
      required: true,
      index: true,
    },
    paymentType: {
      type: String,
      enum: Object.values(PaymentType),
      default: PaymentType.PURCHASE,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.CREATED,
      index: true,
    },
    currency: {
      type: String,
      default: DEFAULT_CURRENCY,
      uppercase: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    refundedAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    gatewayTransactionId: { type: String, trim: true, index: true },
    gatewayPaymentId: { type: String, trim: true },
    gatewayOrderId: { type: String, trim: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
    webhook: { type: WebhookSchema },
    retry: { type: RetrySchema },
    refunds: { type: [RefundSchema], default: [] },
    failureReason: { type: String, trim: true },
    expiresAt: { type: Date },
    completedAt: { type: Date, index: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

/* ========================================================================
   COMPOUND INDEXES (Optimized for Lookup, Reconciliation & Reporting)
   ====================================================================== */

// Lookup payments by orderId and status
PaymentSchema.index({ orderId: 1, status: 1 });

// Lookup customer payment history
PaymentSchema.index({ userId: 1, createdAt: -1 });

// Reconciliation by provider and status
PaymentSchema.index({ provider: 1, status: 1 });

// Analysis by payment method and status
PaymentSchema.index({ paymentMethod: 1, status: 1 });

// Reporting by payment type and creation date
PaymentSchema.index({ paymentType: 1, createdAt: -1 });

export const PaymentModel = model<IPaymentDocument>('Payment', PaymentSchema);
