import { ICouponApplicationResult } from "./coupon-application.interface";
import { ICouponDiscountResult } from "./coupon-discount.interface";
import { ICoupon, ICouponDocument } from "./coupon.interface";

/**
 * Validation context DTO for coupon evaluation.
 */
export interface IValidateCouponContext {
    code: string;
    orderAmount?: number;
    currentDate?: Date;
}

/**
 * Enterprise Coupon Service Interface.
 * Orchestrates validation engine, application workflows, and discount calculations.
 */
export interface ICouponService {
    /**
     * Validates coupon eligibility against all business rules.
     * Throws an enterprise Error if any validation fails.
     * Returns the validated coupon document when eligible.
     */
    validateCoupon(
        code: string,
        orderAmount?: number,
        currentDate?: Date
    ): Promise<ICouponDocument>;

    /**
     * Coordinates the application of a coupon by validating it and returning metadata.
     * Does NOT calculate discounts, increment usage, or modify database records.
     */
    applyCoupon(
        code: string,
        orderAmount?: number
    ): Promise<ICouponApplicationResult>;

    /**
     * Calculates the exact discount amount for a validated coupon.
     * Does NOT validate, update usage, write to DB, or modify order totals.
     */
    calculateDiscount(
        coupon: ICouponDocument | ICoupon,
        orderAmount: number
    ): ICouponDiscountResult;

    /**
     * Retrieves coupon by code via repository.
     */
    getCouponByCode(code: string): Promise<ICouponDocument>;

    /**
     * Retrieves coupon by ID via repository.
     */
    getCouponById(id: string): Promise<ICouponDocument>;
}
