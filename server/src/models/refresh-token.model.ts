import mongoose, { Document, Schema, Types } from "mongoose";

/**
 * Refresh-token persistence document.
 * Used by legacy auth/session helpers that store hashed refresh tokens.
 */
export interface IRefreshToken extends Document {
    userId: Types.ObjectId;
    tokenHash: string;
    familyId: string;
    deviceInfo?: string;
    ipAddress?: string;
    lastUsedAt?: Date;
    revoked: boolean;
    expiresAt?: Date;
}

const RefreshTokenSchema = new Schema<IRefreshToken>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        tokenHash: {
            type: String,
            required: true,
        },

        familyId: {
            type: String,
            required: true,
            index: true,
        },

        deviceInfo: String,
        ipAddress: String,

        lastUsedAt: {
            type: Date,
            default: Date.now,
        },

        revoked: {
            type: Boolean,
            default: false,
        },

        expiresAt: Date,
    },
    {
        timestamps: true,
    }
);

RefreshTokenSchema.index({ userId: 1 });
RefreshTokenSchema.index({ tokenHash: 1 });

export const RefreshToken = mongoose.model<IRefreshToken>(
    "RefreshToken",
    RefreshTokenSchema
);

export default RefreshToken;
