import { Document, Types } from "mongoose";

export interface ISession extends Document {

    userId: Types.ObjectId;

    refreshToken: string;

    device?: string;

    ipAddress?: string;

    userAgent?: string;

    isRevoked: boolean;

    expiresAt: Date;

    createdAt: Date;

    updatedAt: Date;

}