/**
 * Enterprise Coupon Module constants.
 */

import { CouponStatus, DiscountType } from "../types/coupon.types";

/**
 * Collection names for coupon database entities.
 */
export const COUPON_COLLECTIONS = {
    COUPONS: "coupons",
} as const;

/**
 * Field length, quantity, and amount boundaries for Coupon schema.
 */
export const COUPON_LIMITS = {
    CODE_MAX_LENGTH: 30,
    NAME_MAX_LENGTH: 100,
    DESCRIPTION_MAX_LENGTH: 500,
    MIN_DISCOUNT_VALUE: 0,
    MIN_ORDER_AMOUNT: 0,
    MIN_USAGE_LIMIT: 1,
    MIN_USAGE_COUNT: 0,
} as const;

/**
 * Enterprise coupon code validation pattern.
 * Uppercase letters, numbers, hyphens, and underscores only. No spaces or special characters.
 */
export const COUPON_REGEX = {
    CODE: /^[A-Z0-9_-]+$/,
} as const;

/**
 * Default configurations for Coupon operations.
 */
export const COUPON_DEFAULTS = {
    STATUS: CouponStatus.ACTIVE,
    IS_ACTIVE: true,
    USAGE_COUNT: 0,
    MINIMUM_ORDER_AMOUNT: 0,
    USAGE_LIMIT: null,
} as const;

/**
 * Allowed status labels.
 */
export const COUPON_STATUSES = Object.values(CouponStatus);

/**
 * Allowed discount types.
 */
export const DISCOUNT_TYPES = Object.values(DiscountType);
