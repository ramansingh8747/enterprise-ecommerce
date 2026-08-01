import { Document, Model, Types } from "mongoose";

/**
 * Brand lifecycle status values.
 */
export enum BrandStatus {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
}

/**
 * Enterprise Brand domain shape (persistence-agnostic field contract).
 */
export interface IBrand {
    name: string;
    slug: string;
    description?: string;
    logo?: string;
    website?: string;

    status: BrandStatus;
    isFeatured: boolean;

    seoTitle?: string;
    seoDescription?: string;

    createdBy: Types.ObjectId;
    updatedBy?: Types.ObjectId;

    /** Soft-delete marker — null/undefined means not deleted. */
    deletedAt?: Date | null;

    createdAt: Date;
    updatedAt: Date;
}

/**
 * Instance methods attached to Brand documents.
 */
export interface IBrandMethods {
    /**
     * Placeholder — marks the brand as ACTIVE.
     */
    activate(): Promise<IBrandDocument>;

    /**
     * Placeholder — marks the brand as INACTIVE.
     */
    deactivate(): Promise<IBrandDocument>;
}

/**
 * Enterprise Brand Mongoose document contract.
 */
export interface IBrandDocument
    extends Document, IBrand, IBrandMethods {
    _id: Types.ObjectId;
}

/**
 * Enterprise Brand Mongoose model contract (statics).
 */
export interface IBrandModel extends Model<IBrandDocument> {
    /**
     * Placeholder — find a brand by unique slug.
     */
    findBySlug(slug: string): Promise<IBrandDocument | null>;

    /**
     * Placeholder — find brands with ACTIVE status.
     */
    findActive(): Promise<IBrandDocument[]>;

    /**
     * Placeholder — find featured brands.
     */
    findFeatured(): Promise<IBrandDocument[]>;
}
