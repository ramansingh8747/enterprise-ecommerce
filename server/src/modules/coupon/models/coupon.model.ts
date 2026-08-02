import mongoose, { Schema } from "mongoose";
import { ICouponDocument, ICouponModel } from "../interfaces/coupon.interface";
import { CouponStatus, DiscountType } from "../types/coupon.types";
import {
    COUPON_COLLECTIONS,
    COUPON_DEFAULTS,
    COUPON_LIMITS,
    COUPON_REGEX,
} from "../constants/coupon.constants";

/**
 * Enterprise Coupon Mongoose Schema.
 *
 * Persistence-level schema for Coupon entity.
 * Validation, defaults, and index definitions only.
 * Query methods and business logic belong in Repository / Service layers.
 */
const couponSchema = new Schema<ICouponDocument, ICouponModel>(
    {
        /**
         * Basic Information
         */
        code: {
            type: String,
            required: [true, "Coupon code is required."],
            unique: true,
            trim: true,
            uppercase: true,
            maxlength: [
                COUPON_LIMITS.CODE_MAX_LENGTH,
                `Coupon code cannot exceed ${COUPON_LIMITS.CODE_MAX_LENGTH} characters.`,
            ],
            match: [
                COUPON_REGEX.CODE,
                "Coupon code must contain only uppercase letters, numbers, hyphens, or underscores without spaces or special characters.",
            ],
            index: true,
        },

        name: {
            type: String,
            required: [true, "Coupon name is required."],
            trim: true,
            maxlength: [
                COUPON_LIMITS.NAME_MAX_LENGTH,
                `Coupon name cannot exceed ${COUPON_LIMITS.NAME_MAX_LENGTH} characters.`,
            ],
        },

        description: {
            type: String,
            trim: true,
            maxlength: [
                COUPON_LIMITS.DESCRIPTION_MAX_LENGTH,
                `Coupon description cannot exceed ${COUPON_LIMITS.DESCRIPTION_MAX_LENGTH} characters.`,
            ],
        },

        /**
         * Discount
         */
        discountType: {
            type: String,
            enum: {
                values: Object.values(DiscountType),
                message: `discountType must be one of: ${Object.values(DiscountType).join(", ")}.`,
            },
            required: [true, "Discount type is required."],
        },

        discountValue: {
            type: Number,
            required: [true, "Discount value is required."],
            min: [
                COUPON_LIMITS.MIN_DISCOUNT_VALUE,
                "Discount value cannot be negative.",
            ],
        },

        /**
         * Restrictions
         */
        minimumOrderAmount: {
            type: Number,
            min: [
                COUPON_LIMITS.MIN_ORDER_AMOUNT,
                "Minimum order amount cannot be negative.",
            ],
            default: COUPON_DEFAULTS.MINIMUM_ORDER_AMOUNT,
        },

        maximumDiscountAmount: {
            type: Number,
            min: [
                COUPON_LIMITS.MIN_DISCOUNT_VALUE,
                "Maximum discount amount cannot be negative.",
            ],
        },

        /**
         * Usage
         */
        usageLimit: {
            type: Number,
            min: [
                COUPON_LIMITS.MIN_USAGE_LIMIT,
                `Usage limit must be at least ${COUPON_LIMITS.MIN_USAGE_LIMIT}.`,
            ],
            default: COUPON_DEFAULTS.USAGE_LIMIT,
        },

        usageCount: {
            type: Number,
            required: [true, "Usage count is required."],
            min: [
                COUPON_LIMITS.MIN_USAGE_COUNT,
                "Usage count cannot be negative.",
            ],
            default: COUPON_DEFAULTS.USAGE_COUNT,
        },

        /**
         * Validity
         */
        validFrom: {
            type: Date,
            required: [true, "Valid from date is required."],
        },

        validUntil: {
            type: Date,
            required: [true, "Valid until date is required."],
        },

        /**
         * Status
         */
        status: {
            type: String,
            enum: {
                values: Object.values(CouponStatus),
                message: `Coupon status must be one of: ${Object.values(CouponStatus).join(", ")}.`,
            },
            default: COUPON_DEFAULTS.STATUS,
            index: true,
        },

        isActive: {
            type: Boolean,
            default: COUPON_DEFAULTS.IS_ACTIVE,
            index: true,
        },

        /**
         * Future Ready Fields (Scope Restrictions)
         */
        applicableCategories: [
            {
                type: Schema.Types.ObjectId,
                ref: "Category",
            },
        ],

        applicableBrands: [
            {
                type: Schema.Types.ObjectId,
                ref: "Brand",
            },
        ],

        applicableProducts: [
            {
                type: Schema.Types.ObjectId,
                ref: "Product",
            },
        ],

        excludedProducts: [
            {
                type: Schema.Types.ObjectId,
                ref: "Product",
            },
        ],

        /**
         * Audit
         */
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "createdBy is required."],
        },

        updatedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
    },
    {
        timestamps: true,
        versionKey: false,
        collection: COUPON_COLLECTIONS.COUPONS,
        toJSON: {
            virtuals: true,
        },
        toObject: {
            virtuals: true,
        },
    }
);

/**
 * Pre-validation middleware to sanitize code before Mongoose validation runs.
 */
couponSchema.pre("validate", function () {
    if (this.code) {
        this.code = this.code.trim().toUpperCase();
    }
});

/**
 * Optimized compound indexes for production queries.
 */
couponSchema.index({ validFrom: 1, validUntil: 1 });
couponSchema.index({ status: 1, isActive: 1 });

/**
 * Export Coupon model with hot-reload prevention.
 */
export const Coupon: ICouponModel =
    (mongoose.models.Coupon as ICouponModel) ||
    mongoose.model<ICouponDocument, ICouponModel>("Coupon", couponSchema);

export default Coupon;
