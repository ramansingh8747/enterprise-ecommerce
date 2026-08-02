import { ICouponApplicationResult } from "../interfaces/coupon-application.interface";
import { ICouponDiscountResult } from "../interfaces/coupon-discount.interface";
import { ICouponRepository } from "../interfaces/coupon-repository.interface";
import { ICouponService } from "../interfaces/coupon-service.interface";
import { ICoupon, ICouponDocument } from "../interfaces/coupon.interface";
import { CouponRepository } from "../repositories/coupon.repository";
import { CouponStatus, DiscountType } from "../types/coupon.types";

/**
 * Enterprise Coupon Service.
 *
 * Orchestrates Coupon validation engine, application workflow, and discount calculation.
 * Does NOT update database records, increment usage, or modify order totals.
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
     * Coordinates the application of a coupon by validating it and returning metadata.
     * Does NOT calculate discounts, increment usage, or modify database records.
     *
     * @param code Unique coupon code
     * @param orderAmount Subtotal order amount
     * @returns ICouponApplicationResult containing coupon parameters for downstream engines
     */
    async applyCoupon(
        code: string,
        orderAmount?: number
    ): Promise<ICouponApplicationResult> {
        const validatedCoupon = await this.validateCoupon(code, orderAmount);

        return {
            couponId: validatedCoupon._id.toString(),
            couponCode: validatedCoupon.code,
            discountType: validatedCoupon.discountType,
            discountValue: validatedCoupon.discountValue,
            minimumOrderAmount: validatedCoupon.minimumOrderAmount,
            maximumDiscountAmount: validatedCoupon.maximumDiscountAmount,
            isValid: true,
            message: "Coupon applied successfully.",
        };
    }

    /**
     * Calculates the exact discount amount for a validated coupon.
     *
     * 1. PERCENTAGE: (orderAmount * discountValue) / 100, capped at maximumDiscountAmount (if set > 0) and orderAmount.
     * 2. FIXED: min(discountValue, orderAmount).
     * 3. FREE_SHIPPING: sets shippingDiscountEligible = true with 0 monetary discount.
     *
     * Does NOT perform coupon validation, update usage counts, write to DB, or modify order totals.
     *
     * @param coupon Validated Coupon document or ICoupon domain object
     * @param orderAmount Subtotal order amount
     * @returns ICouponDiscountResult containing exact calculated discount metrics
     */
    calculateDiscount(
        coupon: ICouponDocument | ICoupon,
        orderAmount: number
    ): ICouponDiscountResult {
        if (typeof orderAmount !== "number" || isNaN(orderAmount) || orderAmount < 0) {
            throw new Error("Order amount must be a non-negative number.");
        }

        let calculatedAmount = 0;
        let shippingDiscountEligible = false;

        switch (coupon.discountType) {
            case DiscountType.PERCENTAGE: {
                const rawDiscount = (orderAmount * coupon.discountValue) / 100;
                let capped = rawDiscount;

                if (
                    coupon.maximumDiscountAmount !== undefined &&
                    coupon.maximumDiscountAmount !== null &&
                    coupon.maximumDiscountAmount > 0
                ) {
                    capped = Math.min(capped, coupon.maximumDiscountAmount);
                }

                calculatedAmount = Math.min(capped, orderAmount);
                break;
            }

            case DiscountType.FIXED: {
                calculatedAmount = Math.min(coupon.discountValue, orderAmount);
                break;
            }

            case DiscountType.FREE_SHIPPING: {
                calculatedAmount = 0;
                shippingDiscountEligible = true;
                break;
            }

            default: {
                throw new Error(`Unsupported discount type: ${coupon.discountType}`);
            }
        }

        const finalDiscount = Math.round((calculatedAmount + Number.EPSILON) * 100) / 100;

        return {
            discountAmount: finalDiscount,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
            shippingDiscountEligible,
            finalDiscount,
            message: "Discount calculated successfully.",
        };
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
