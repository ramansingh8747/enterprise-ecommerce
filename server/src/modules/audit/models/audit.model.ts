import mongoose, { Document, Model, Schema } from 'mongoose';
import {
  AuditAction,
  AuditEntity,
  AuditSeverity,
  AuditStatus,
} from '../enums/audit.enums';

/**
 * Audit Actor Subdocument Interface.
 */
export interface IAuditActorSubdocument {
  userId: string;
  email: string;
  role: string;
  name?: string;
}

/**
 * Audit Change Subdocument Interface.
 */
export interface IAuditChangeSubdocument {
  field: string;
  before?: unknown;
  after?: unknown;
}

/**
 * Audit Metadata Subdocument Interface.
 */
export interface IAuditMetadataSubdocument {
  ip?: string;
  userAgent?: string;
  requestId?: string;
  correlationId?: string;
  source?: string;
  tags?: string[];
  additionalData?: Record<string, unknown>;
}

/**
 * Audit Log Mongoose Document Interface.
 */
export interface IAuditLogDocument extends Document {
  _id: mongoose.Types.ObjectId;
  actor: IAuditActorSubdocument;
  action: AuditAction;
  entity: AuditEntity;
  entityId?: string;
  severity: AuditSeverity;
  status: AuditStatus;
  metadata?: IAuditMetadataSubdocument;
  changes?: IAuditChangeSubdocument[];
  description: string;
  success: boolean;
  errorMessage?: string;
  duration?: number;
  createdAt: Date;
  updatedAt: Date;
}

/* ==========================================================================
   SUBDOCUMENT SCHEMAS
   ========================================================================== */

const AuditActorSchema = new Schema<IAuditActorSubdocument>(
  {
    userId: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    role: { type: String, required: true, trim: true },
    name: { type: String, trim: true },
  },
  { _id: false }
);

const AuditChangeSchema = new Schema<IAuditChangeSubdocument>(
  {
    field: { type: String, required: true, trim: true },
    before: { type: Schema.Types.Mixed },
    after: { type: Schema.Types.Mixed },
  },
  { _id: false }
);

const AuditMetadataSchema = new Schema<IAuditMetadataSubdocument>(
  {
    ip: { type: String, trim: true },
    userAgent: { type: String, trim: true },
    requestId: { type: String, trim: true },
    correlationId: { type: String, trim: true },
    source: { type: String, trim: true, default: 'API' },
    tags: { type: [String], default: [] },
    additionalData: { type: Schema.Types.Mixed },
  },
  { _id: false }
);

/* ==========================================================================
   MAIN AUDIT LOG SCHEMA
   ========================================================================== */

export const AuditLogSchema = new Schema<IAuditLogDocument>(
  {
    actor: { type: AuditActorSchema, required: true },
    action: {
      type: String,
      enum: Object.values(AuditAction),
      required: true,
      index: true,
    },
    entity: {
      type: String,
      enum: Object.values(AuditEntity),
      required: true,
      index: true,
    },
    entityId: { type: String, trim: true, index: true },
    severity: {
      type: String,
      enum: Object.values(AuditSeverity),
      default: AuditSeverity.LOW,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(AuditStatus),
      default: AuditStatus.SUCCESS,
      required: true,
      index: true,
    },
    metadata: { type: AuditMetadataSchema, default: {} },
    changes: { type: [AuditChangeSchema], default: [] },
    description: { type: String, required: true, trim: true },
    success: { type: Boolean, default: true, required: true, index: true },
    errorMessage: { type: String, trim: true },
    duration: { type: Number, min: 0 },
  },
  {
    timestamps: true,
    versionKey: false,
    collection: 'audit_logs',
  }
);

/* ==========================================================================
   INDEX STRATEGY DEFINITIONS
   ========================================================================== */

// 1. Single Field Indexes
AuditLogSchema.index({ createdAt: -1 }, { name: 'idx_audit_created_at_desc' });
AuditLogSchema.index({ 'actor.userId': 1 }, { name: 'idx_audit_actor_user_id' });

// 2. Compound Filter & Analytical Indexes
AuditLogSchema.index(
  { entity: 1, entityId: 1 },
  { name: 'idx_audit_entity_entity_id' }
);
AuditLogSchema.index(
  { 'actor.userId': 1, createdAt: -1 },
  { name: 'idx_audit_actor_created_at' }
);
AuditLogSchema.index(
  { action: 1, createdAt: -1 },
  { name: 'idx_audit_action_created_at' }
);
AuditLogSchema.index(
  { entity: 1, action: 1 },
  { name: 'idx_audit_entity_action' }
);
AuditLogSchema.index(
  { severity: 1, createdAt: -1 },
  { name: 'idx_audit_severity_created_at' }
);
AuditLogSchema.index(
  { status: 1, createdAt: -1 },
  { name: 'idx_audit_status_created_at' }
);

/**
 * AuditLog Mongoose Model.
 */
export const AuditLogModel: Model<IAuditLogDocument> =
  mongoose.models.AuditLog ||
  mongoose.model<IAuditLogDocument>('AuditLog', AuditLogSchema);

export default AuditLogModel;
