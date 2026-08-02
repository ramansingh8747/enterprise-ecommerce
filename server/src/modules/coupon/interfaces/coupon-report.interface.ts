import { DiscountType } from "../types/coupon.types";

/**
 * Date range filter for coupon reporting.
 */
export interface ICouponReportDateFilter {
    dateFrom?: Date;
    dateTo?: Date;
}

/**
 * Top used coupon summary row.
 */
export interface ITopUsedCouponRow {
    couponId: string;
    code: string;
    name: string;
    discountType: DiscountType;
    discountValue: number;
    usageCount: number;
    usageLimit?: number | null;
}

/**
 * Coupon usage summary metrics DTO.
 */
export interface ICouponUsageSummary {
    totalUsageCount: number;
    usedCouponsCount: number;
    unusedCouponsCount: number;
    averageUsagePerCoupon: number;
}

/**
 * Comprehensive Coupon Summary & Metrics DTO.
 */
export interface ICouponSummaryReport {
    totalCoupons: number;
    activeCoupons: number;
    inactiveCoupons: number;
    expiredCoupons: number;
    upcomingCoupons: number;
    expiringTodayCoupons: number;
    usageSummary: ICouponUsageSummary;
}

/**
 * Date range report DTO.
 */
export interface ICouponDateRangeReport {
    dateFrom?: string;
    dateTo?: string;
    couponsCreated: number;
    couponsValidInPeriod: number;
    couponsExpiringInPeriod: number;
}

/**
 * Repository interface contract for coupon reporting and aggregations.
 */
export interface ICouponReportRepository {
    countTotal(): Promise<number>;
    countActive(currentDate?: Date): Promise<number>;
    countInactive(): Promise<number>;
    countExpired(currentDate?: Date): Promise<number>;
    countUpcoming(currentDate?: Date): Promise<number>;
    countExpiringToday(currentDate?: Date): Promise<number>;
    getUsageSummary(): Promise<ICouponUsageSummary>;
    getTopUsedCoupons(limit?: number): Promise<ITopUsedCouponRow[]>;
    getUnusedCoupons(): Promise<ITopUsedCouponRow[]>;
    getDateRangeReport(filter: ICouponReportDateFilter): Promise<ICouponDateRangeReport>;
}

/**
 * Service interface contract for coupon report orchestration.
 */
export interface ICouponReportService {
    getSummaryReport(currentDate?: Date): Promise<ICouponSummaryReport>;
    getTopUsedCoupons(limit?: number): Promise<ITopUsedCouponRow[]>;
    getUnusedCoupons(): Promise<ITopUsedCouponRow[]>;
    getDateRangeReport(dateFrom?: string, dateTo?: string): Promise<ICouponDateRangeReport>;
}
