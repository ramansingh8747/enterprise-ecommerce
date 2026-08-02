import { DiscountType } from "../types/coupon.types";

/**
 * Result contract returned by Coupon Application workflow.
 * Provides coupon metadata required for downstream discount calculation and order processing.
 */
export interface ICouponApplicationResult {
    couponId: string;
    couponCode: string;
    discountType: DiscountType;
    discountValue: number;
    minimumOrderAmount?: number;
    maximumDiscountAmount?: number;
    isValid: boolean;
    message: string;
}
