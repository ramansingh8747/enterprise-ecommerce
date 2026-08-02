import mongoose, { Document, Model, Schema, Types } from "mongoose";
import { IMediaMetadata } from "../interfaces/media.interface";
import {
    MediaStorageProvider,
    MediaType,
} from "../types/media.types";

/**
 * Enterprise Media Mongoose document contract.
 *
 * Persistence-level TypeScript interface for the Media aggregate.
 * Independent of Product business logic — linked via `productId` only.
 */
export interface IMediaDocument extends Document {
    _id: Types.ObjectId;

    productId: Types.ObjectId;
    publicId?: string;
    url: string;
    secureUrl?: string;

    storageProvider: MediaStorageProvider;
    mediaType: MediaType;

    mimeType?: string;
    fileName?: string;
    originalName?: string;
    extension?: string;
    size?: number;
    width?: number;
    height?: number;

    altText?: string;
    displayOrder: number;
    isPrimary: boolean;
    metadata?: IMediaMetadata;

    createdBy?: Types.ObjectId;
    updatedBy?: Types.ObjectId;

    createdAt: Date;
    updatedAt: Date;
}

/**
 * Enterprise Media Mongoose schema.
 *
 * Validation, defaults, and indexes only — no upload or business logic.
 */
const mediaSchema = new Schema<IMediaDocument>(
    {
        /**
         * Parent Product reference — Media stays reusable; Product owns no media schema.
         */
        productId: {
            type: Schema.Types.ObjectId,
            ref: "Product",
            required: [true, "Media productId is required."],
            index: true,
        },

        publicId: {
            type: String,
            trim: true,
            maxlength: [512, "Media publicId cannot exceed 512 characters."],
        },

        url: {
            type: String,
            required: [true, "Media url is required."],
            trim: true,
            maxlength: [2048, "Media url cannot exceed 2048 characters."],
        },

        secureUrl: {
            type: String,
            trim: true,
            maxlength: [2048, "Media secureUrl cannot exceed 2048 characters."],
        },

        storageProvider: {
            type: String,
            enum: {
                values: Object.values(MediaStorageProvider),
                message: "Invalid storageProvider value.",
            },
            default: MediaStorageProvider.CLOUDINARY,
            required: [true, "Media storageProvider is required."],
            index: true,
        },

        mediaType: {
            type: String,
            enum: {
                values: Object.values(MediaType),
                message: "Invalid mediaType value.",
            },
            default: MediaType.IMAGE,
            required: [true, "Media mediaType is required."],
            index: true,
        },

        mimeType: {
            type: String,
            trim: true,
            maxlength: [128, "Media mimeType cannot exceed 128 characters."],
        },

        fileName: {
            type: String,
            trim: true,
            maxlength: [255, "Media fileName cannot exceed 255 characters."],
        },

        originalName: {
            type: String,
            trim: true,
            maxlength: [255, "Media originalName cannot exceed 255 characters."],
        },

        extension: {
            type: String,
            trim: true,
            lowercase: true,
            maxlength: [32, "Media extension cannot exceed 32 characters."],
        },

        size: {
            type: Number,
            min: [0, "Media size cannot be negative."],
        },

        width: {
            type: Number,
            min: [0, "Media width cannot be negative."],
        },

        height: {
            type: Number,
            min: [0, "Media height cannot be negative."],
        },

        altText: {
            type: String,
            trim: true,
            maxlength: [255, "Media altText cannot exceed 255 characters."],
        },

        displayOrder: {
            type: Number,
            default: 0,
            min: [0, "Media displayOrder cannot be negative."],
            index: true,
        },

        isPrimary: {
            type: Boolean,
            default: false,
            index: true,
        },

        metadata: {
            type: Schema.Types.Mixed,
            default: {},
        },

        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },

        updatedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
    },
    {
        timestamps: true,
        versionKey: false,
        collection: "media",
        toJSON: {
            virtuals: true,
        },
        toObject: {
            virtuals: true,
        },
    }
);

/**
 * Compound indexes for common Product media queries.
 */
mediaSchema.index({ productId: 1, displayOrder: 1 });
mediaSchema.index({ productId: 1, isPrimary: 1 });
mediaSchema.index({ productId: 1, mediaType: 1 });

/**
 * Enterprise Media model.
 */
export const Media: Model<IMediaDocument> =
    mongoose.models.Media ||
    mongoose.model<IMediaDocument>("Media", mediaSchema);

export default Media;
