import mongoose, { Schema } from "mongoose";
import { ISession } from "../interfaces/session.interface";

const sessionSchema = new Schema<ISession>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        refreshToken: {
            type: String,
            required: true
        },

        device: {
            type: String
        },

        ipAddress: {
            type: String
        },

        userAgent: {
            type: String
        },

        isRevoked: {
            type: Boolean,
            default: false
        },

        expiresAt: {
            type: Date,
            required: true
        }

    },
    {
        timestamps: true
    }
);

// ✅ Add indexes here
sessionSchema.index({ userId: 1 });

sessionSchema.index({ refreshToken: 1 });

sessionSchema.index({ expiresAt: 1 });

export default mongoose.model<ISession>(
    "Session",
    sessionSchema
);