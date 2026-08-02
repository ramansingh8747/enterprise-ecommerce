import { DiscountType } from "../types/coupon.types";

/**
 * Result contract returned by Discount Calculation Engine.
 * Represents the calculated discount metrics without modifying order totals.
 */
export interface ICouponDiscountResult {
    discountAmount: number;
    discountType: DiscountType;
    discountValue: number;
    shippingDiscountEligible: boolean;
    finalDiscount: number;
    message: string;
}
