/**
 * Enterprise Coupon Module — shared enums and types.
 */

/**
 * Coupon status lifecycle.
 */
export enum CouponStatus {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
}

/**
 * Supported coupon discount calculation strategies.
 */
export enum DiscountType {
    PERCENTAGE = "PERCENTAGE",
    FIXED = "FIXED",
    FREE_SHIPPING = "FREE_SHIPPING",
}
