import { Document, Model, Types } from "mongoose";
import { CouponStatus, DiscountType } from "../types/coupon.types";

/**
 * Domain entity contract for Coupon.
 */
export interface ICoupon {
    // Basic Information
    code: string;
    name: string;
    description?: string;

    // Discount
    discountType: DiscountType;
    discountValue: number;

    // Restrictions
    minimumOrderAmount?: number;
    maximumDiscountAmount?: number;

    // Usage
    usageLimit?: number | null;
    usageCount: number;

    // Validity
    validFrom: Date;
    validUntil: Date;

    // Status
    status: CouponStatus;
    isActive: boolean;

    // Future Ready Fields (Scope Restrictions)
    applicableCategories?: Types.ObjectId[];
    applicableBrands?: Types.ObjectId[];
    applicableProducts?: Types.ObjectId[];
    excludedProducts?: Types.ObjectId[];

    // Audit
    createdBy: Types.ObjectId;
    updatedBy?: Types.ObjectId;

    // Timestamps
    createdAt?: Date;
    updatedAt?: Date;
}

/**
 * Payload contract for creating a new Coupon.
 */
export interface ICreateCoupon {
    code: string;
    name: string;
    description?: string;
    discountType: DiscountType;
    discountValue: number;
    minimumOrderAmount?: number;
    maximumDiscountAmount?: number;
    usageLimit?: number | null;
    validFrom: Date;
    validUntil: Date;
    status?: CouponStatus;
    isActive?: boolean;
    applicableCategories?: Types.ObjectId[];
    applicableBrands?: Types.ObjectId[];
    applicableProducts?: Types.ObjectId[];
    excludedProducts?: Types.ObjectId[];
    createdBy: Types.ObjectId;
}

/**
 * Payload contract for updating an existing Coupon.
 */
export interface IUpdateCoupon {
    name?: string;
    description?: string;
    discountType?: DiscountType;
    discountValue?: number;
    minimumOrderAmount?: number;
    maximumDiscountAmount?: number;
    usageLimit?: number | null;
    validFrom?: Date;
    validUntil?: Date;
    status?: CouponStatus;
    isActive?: boolean;
    applicableCategories?: Types.ObjectId[];
    applicableBrands?: Types.ObjectId[];
    applicableProducts?: Types.ObjectId[];
    excludedProducts?: Types.ObjectId[];
    updatedBy?: Types.ObjectId;
}

/**
 * Mongoose Document contract for Coupon persistence entity.
 */
export interface ICouponDocument extends Document, ICoupon {
    _id: Types.ObjectId;
}

/**
 * Mongoose Model contract for Coupon.
 */
export type ICouponModel = Model<ICouponDocument>;
