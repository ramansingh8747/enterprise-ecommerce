import { ICouponRepository } from "../interfaces/coupon-repository.interface";
import { ICouponService } from "../interfaces/coupon-service.interface";
import { ICouponDocument } from "../interfaces/coupon.interface";
import { CouponRepository } from "../repositories/coupon.repository";
import { CouponStatus } from "../types/coupon.types";

/**
 * Enterprise Coupon Validation Engine Service.
 *
 * Contains core business logic for Coupon validation.
 * Does NOT calculate discount values, apply coupons to orders, or deduct usage.
 */
export class CouponService implements ICouponService {
    constructor(
        private readonly couponRepository: ICouponRepository = new CouponRepository()
    ) {}

    /**
     * Validates a coupon code against all enterprise eligibility rules.
     *
     * @param code Unique coupon code to validate
     * @param orderAmount Optional cart / order subtotal amount
     * @param currentDate Optional reference date (defaults to system time)
     * @returns Validated ICouponDocument if all checks pass
     * @throws Enterprise Error on validation failure
     */
    async validateCoupon(
        code: string,
        orderAmount?: number,
        currentDate: Date = new Date()
    ): Promise<ICouponDocument> {
        if (!code || !code.trim()) {
            throw new Error("Coupon code is required.");
        }

        const sanitizedCode = code.trim().toUpperCase();

        // 1. Coupon exists
        const coupon = await this.couponRepository.findByCode(sanitizedCode);
        if (!coupon) {
            throw new Error("Coupon not found.");
        }

        // 2. Coupon is active (boolean flag)
        if (!coupon.isActive) {
            throw new Error("Coupon is inactive.");
        }

        // 3. Coupon status is ACTIVE (enum status)
        if (coupon.status !== CouponStatus.ACTIVE) {
            throw new Error("Coupon status is not active.");
        }

        const now = currentDate.getTime();

        // 4. Current date >= validFrom
        if (coupon.validFrom && now < new Date(coupon.validFrom).getTime()) {
            throw new Error("Coupon is not valid yet.");
        }

        // 5. Current date <= validUntil
        if (coupon.validUntil && now > new Date(coupon.validUntil).getTime()) {
            throw new Error("Coupon has expired.");
        }

        // 6. Usage limit not exceeded
        if (
            coupon.usageLimit !== null &&
            coupon.usageLimit !== undefined &&
            coupon.usageCount >= coupon.usageLimit
        ) {
            throw new Error("Coupon usage limit has been exceeded.");
        }

        // 7. Minimum order amount satisfied
        if (
            orderAmount !== undefined &&
            typeof orderAmount === "number" &&
            coupon.minimumOrderAmount !== undefined &&
            orderAmount < coupon.minimumOrderAmount
        ) {
            throw new Error(
                `Order amount does not meet the minimum requirement of ${coupon.minimumOrderAmount} for this coupon.`
            );
        }

        return coupon;
    }

    /**
     * Retrieves coupon document by code.
     */
    async getCouponByCode(code: string): Promise<ICouponDocument> {
        if (!code || !code.trim()) {
            throw new Error("Coupon code is required.");
        }

        const coupon = await this.couponRepository.findByCode(code.trim().toUpperCase());
        if (!coupon) {
            throw new Error("Coupon not found.");
        }

        return coupon;
    }

    /**
     * Retrieves coupon document by ObjectId.
     */
    async getCouponById(id: string): Promise<ICouponDocument> {
        if (!id || !id.trim()) {
            throw new Error("Coupon ID is required.");
        }

        const coupon = await this.couponRepository.findById(id);
        if (!coupon) {
            throw new Error("Coupon not found.");
        }

        return coupon;
    }
}
