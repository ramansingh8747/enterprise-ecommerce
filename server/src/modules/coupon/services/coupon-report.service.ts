import {
    ICouponDateRangeReport,
    ICouponReportRepository,
    ICouponReportService,
    ICouponSummaryReport,
    ITopUsedCouponRow,
} from "../interfaces/coupon-report.interface";
import { CouponReportRepository } from "../repositories/coupon-report.repository";

/**
 * Enterprise Coupon Report Service.
 * Orchestrates coupon metrics and analytics generation.
 * Independent from validation, application, and discount calculation workflows.
 */
export class CouponReportService implements ICouponReportService {
    constructor(
        private readonly couponReportRepository: ICouponReportRepository = new CouponReportRepository()
    ) {}

    /**
     * Generates a comprehensive summary report of coupon counts and usage statistics.
     */
    async getSummaryReport(
        currentDate: Date = new Date()
    ): Promise<ICouponSummaryReport> {
        const [
            totalCoupons,
            activeCoupons,
            inactiveCoupons,
            expiredCoupons,
            upcomingCoupons,
            expiringTodayCoupons,
            usageSummary,
        ] = await Promise.all([
            this.couponReportRepository.countTotal(),
            this.couponReportRepository.countActive(currentDate),
            this.couponReportRepository.countInactive(),
            this.couponReportRepository.countExpired(currentDate),
            this.couponReportRepository.countUpcoming(currentDate),
            this.couponReportRepository.countExpiringToday(currentDate),
            this.couponReportRepository.getUsageSummary(),
        ]);

        return {
            totalCoupons,
            activeCoupons,
            inactiveCoupons,
            expiredCoupons,
            upcomingCoupons,
            expiringTodayCoupons,
            usageSummary,
        };
    }

    /**
     * Retrieves top used coupons sorted by usage count descending.
     */
    async getTopUsedCoupons(limit = 10): Promise<ITopUsedCouponRow[]> {
        if (typeof limit !== "number" || limit <= 0) {
            throw new Error("Limit must be a positive number.");
        }
        return this.couponReportRepository.getTopUsedCoupons(limit);
    }

    /**
     * Retrieves all unused coupons (usageCount = 0).
     */
    async getUnusedCoupons(): Promise<ITopUsedCouponRow[]> {
        return this.couponReportRepository.getUnusedCoupons();
    }

    /**
     * Generates date range analytics for coupon creation and validity.
     */
    async getDateRangeReport(
        dateFrom?: string,
        dateTo?: string
    ): Promise<ICouponDateRangeReport> {
        let parsedFrom: Date | undefined;
        let parsedTo: Date | undefined;

        if (dateFrom) {
            parsedFrom = new Date(dateFrom);
            if (isNaN(parsedFrom.getTime())) {
                throw new Error("Invalid dateFrom format.");
            }
        }

        if (dateTo) {
            parsedTo = new Date(dateTo);
            if (isNaN(parsedTo.getTime())) {
                throw new Error("Invalid dateTo format.");
            }
        }

        if (parsedFrom && parsedTo && parsedFrom > parsedTo) {
            throw new Error("dateFrom cannot be later than dateTo.");
        }

        return this.couponReportRepository.getDateRangeReport({
            dateFrom: parsedFrom,
            dateTo: parsedTo,
        });
    }
}
