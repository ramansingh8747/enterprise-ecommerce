import { ICouponDocument } from "./coupon.interface";

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
 * Orchestrates business logic and validation rules.
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
     * Retrieves coupon by code via repository.
     */
    getCouponByCode(code: string): Promise<ICouponDocument>;

    /**
     * Retrieves coupon by ID via repository.
     */
    getCouponById(id: string): Promise<ICouponDocument>;
}
