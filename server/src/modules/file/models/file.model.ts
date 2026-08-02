import mongoose, { Schema, Document, Types } from 'mongoose';
import {
  StorageProviderType,
  FileVisibility,
  UploadStatus,
  FileCategory,
  OwnerEntityType,
} from '../types/file.types';

/**
 * Image Specific Metadata Interface.
 */
export interface IImageMetadata {
  width?: number;
  height?: number;
  aspectRatio?: number;
  dominantColor?: string;
  blurHash?: string;
  thumbnailUrls?: Map<string, string>;
}

/**
 * Document Specific Metadata Interface.
 */
export interface IDocumentMetadata {
  pageCount?: number;
  documentType?: string;
  encryptionStatus?: string;
  previewAvailable?: boolean;
}

/**
 * Polymorphic Owner Reference Interface.
 */
export interface IOwnerRef {
  entityType: OwnerEntityType | string;
  entityId: Types.ObjectId;
}

/**
 * Universal File Document Interface (Module 21.2).
 */
export interface IFile extends Document {
  _id: Types.ObjectId;
  filename: string;
  originalFilename: string;
  storedFilename: string;
  extension: string;
  mimeType: string;
  size: number;
  checksum?: string;
  category: FileCategory;
  provider: StorageProviderType;
  bucket?: string;
  folder?: string;
  url?: string;
  signedUrl?: string;
  visibility: FileVisibility;
  uploadStatus: UploadStatus;
  uploadedBy?: Types.ObjectId;
  uploadedAt: Date;
  lastAccessedAt?: Date;
  owner?: IOwnerRef;
  imageMetadata?: IImageMetadata;
  documentMetadata?: IDocumentMetadata;
  metadata?: Record<string, unknown>;
  tags?: string[];
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ImageMetadataSchema = new Schema<IImageMetadata>(
  {
    width: { type: Number, min: 1 },
    height: { type: Number, min: 1 },
    aspectRatio: { type: Number },
    dominantColor: { type: String, trim: true },
    blurHash: { type: String, trim: true },
    thumbnailUrls: { type: Map, of: String },
  },
  { _id: false }
);

const DocumentMetadataSchema = new Schema<IDocumentMetadata>(
  {
    pageCount: { type: Number, min: 1 },
    documentType: { type: String, trim: true },
    encryptionStatus: { type: String, trim: true },
    previewAvailable: { type: Boolean, default: false },
  },
  { _id: false }
);

const OwnerRefSchema = new Schema<IOwnerRef>(
  {
    entityType: {
      type: String,
      required: true,
      trim: true,
    },
    entityId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
  },
  { _id: false }
);

const FileSchema = new Schema<IFile>(
  {
    filename: {
      type: String,
      required: true,
      trim: true,
    },
    originalFilename: {
      type: String,
      required: true,
      trim: true,
    },
    storedFilename: {
      type: String,
      required: true,
      trim: true,
    },
    extension: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    mimeType: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    size: {
      type: Number,
      required: true,
      min: [0, 'File size cannot be negative'],
    },
    checksum: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      enum: Object.values(FileCategory),
      default: FileCategory.SYSTEM,
    },
    provider: {
      type: String,
      enum: Object.values(StorageProviderType),
      required: true,
    },
    bucket: {
      type: String,
      trim: true,
    },
    folder: {
      type: String,
      trim: true,
      default: 'general',
    },
    url: {
      type: String,
      trim: true,
    },
    signedUrl: {
      type: String,
      trim: true,
    },
    visibility: {
      type: String,
      enum: Object.values(FileVisibility),
      default: FileVisibility.PUBLIC,
    },
    uploadStatus: {
      type: String,
      enum: Object.values(UploadStatus),
      default: UploadStatus.PENDING,
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
    lastAccessedAt: {
      type: Date,
    },
    owner: {
      type: OwnerRefSchema,
    },
    imageMetadata: {
      type: ImageMetadataSchema,
    },
    documentMetadata: {
      type: DocumentMetadataSchema,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

/* ==========================================================================
   DATABASE INDEXES
   ========================================================================== */

// Single field indexes for query performance
FileSchema.index({ uploadedBy: 1 });
FileSchema.index({ provider: 1 });
FileSchema.index({ uploadStatus: 1 });
FileSchema.index({ category: 1 });
FileSchema.index({ tags: 1 });
FileSchema.index({ folder: 1 });
FileSchema.index({ isDeleted: 1 });

// Compound indexes for polymorphic owner lookups & soft delete filtering
FileSchema.index({ 'owner.entityType': 1, 'owner.entityId': 1 });
FileSchema.index({ isDeleted: 1, uploadStatus: 1, createdAt: -1 });
FileSchema.index({ uploadedBy: 1, isDeleted: 1, createdAt: -1 });
FileSchema.index({ category: 1, isDeleted: 1, createdAt: -1 });

export const FileModel = mongoose.model<IFile>('File', FileSchema);
export default FileModel;
