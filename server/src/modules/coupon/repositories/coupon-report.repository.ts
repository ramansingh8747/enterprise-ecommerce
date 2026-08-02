import {
    ICouponDateRangeReport,
    ICouponReportDateFilter,
    ICouponReportRepository,
    ICouponUsageSummary,
    ITopUsedCouponRow,
} from "../interfaces/coupon-report.interface";
import { ICouponDocument } from "../interfaces/coupon.interface";
import Coupon from "../models/coupon.model";
import { CouponStatus } from "../types/coupon.types";

/**
 * Enterprise Coupon Report Repository.
 * Data-access layer — contains database queries and aggregations only. Zero business logic.
 */
export class CouponReportRepository implements ICouponReportRepository {
    /**
     * Counts total non-deleted coupons.
     */
    async countTotal(): Promise<number> {
        return Coupon.countDocuments().exec();
    }

    /**
     * Counts currently active and valid coupons.
     */
    async countActive(currentDate: Date = new Date()): Promise<number> {
        return Coupon.countDocuments({
            status: CouponStatus.ACTIVE,
            isActive: true,
            validFrom: { $lte: currentDate },
            validUntil: { $gte: currentDate },
        }).exec();
    }

    /**
     * Counts inactive coupons (status = INACTIVE or isActive = false).
     */
    async countInactive(): Promise<number> {
        return Coupon.countDocuments({
            $or: [{ status: CouponStatus.INACTIVE }, { isActive: false }],
        }).exec();
    }

    /**
     * Counts expired coupons (validUntil < currentDate).
     */
    async countExpired(currentDate: Date = new Date()): Promise<number> {
        return Coupon.countDocuments({
            validUntil: { $lt: currentDate },
        }).exec();
    }

    /**
     * Counts upcoming coupons (validFrom > currentDate).
     */
    async countUpcoming(currentDate: Date = new Date()): Promise<number> {
        return Coupon.countDocuments({
            validFrom: { $gt: currentDate },
        }).exec();
    }

    /**
     * Counts coupons expiring on the current calendar day (UTC).
     */
    async countExpiringToday(currentDate: Date = new Date()): Promise<number> {
        const startOfDay = new Date(currentDate);
        startOfDay.setUTCHours(0, 0, 0, 0);

        const endOfDay = new Date(currentDate);
        endOfDay.setUTCHours(23, 59, 59, 999);

        return Coupon.countDocuments({
            validUntil: { $gte: startOfDay, $lte: endOfDay },
        }).exec();
    }

    /**
     * Aggregates usage counts across all coupons.
     */
    async getUsageSummary(): Promise<ICouponUsageSummary> {
        const result = await Coupon.aggregate<{
            totalUsageCount: number;
            usedCouponsCount: number;
            unusedCouponsCount: number;
            totalCoupons: number;
        }>([
            {
                $group: {
                    _id: null,
                    totalUsageCount: { $sum: "$usageCount" },
                    usedCouponsCount: {
                        $sum: { $cond: [{ $gt: ["$usageCount", 0] }, 1, 0] },
                    },
                    unusedCouponsCount: {
                        $sum: { $cond: [{ $eq: ["$usageCount", 0] }, 1, 0] },
                    },
                    totalCoupons: { $sum: 1 },
                },
            },
        ]).exec();

        const row = result[0];
        if (!row || row.totalCoupons === 0) {
            return {
                totalUsageCount: 0,
                usedCouponsCount: 0,
                unusedCouponsCount: 0,
                averageUsagePerCoupon: 0,
            };
        }

        const average = row.totalUsageCount / row.totalCoupons;

        return {
            totalUsageCount: row.totalUsageCount,
            usedCouponsCount: row.usedCouponsCount,
            unusedCouponsCount: row.unusedCouponsCount,
            averageUsagePerCoupon: Math.round((average + Number.EPSILON) * 100) / 100,
        };
    }

    /**
     * Retrieves top used coupons ordered by usageCount descending.
     */
    async getTopUsedCoupons(limit = 10): Promise<ITopUsedCouponRow[]> {
        const safeLimit = limit > 0 ? Math.min(limit, 100) : 10;
        const docs = await Coupon.find({ usageCount: { $gt: 0 } })
            .sort({ usageCount: -1 })
            .limit(safeLimit)
            .exec();

        return docs.map(this.mapToTopUsedRow);
    }

    /**
     * Retrieves all unused coupons (usageCount = 0).
     */
    async getUnusedCoupons(): Promise<ITopUsedCouponRow[]> {
        const docs = await Coupon.find({ usageCount: 0 })
            .sort({ createdAt: -1 })
            .exec();

        return docs.map(this.mapToTopUsedRow);
    }

    /**
     * Aggregates date range metrics for created, valid, and expiring coupons.
     */
    async getDateRangeReport(
        filter: ICouponReportDateFilter
    ): Promise<ICouponDateRangeReport> {
        const query: Record<string, unknown> = {};
        if (filter.dateFrom || filter.dateTo) {
            const dateQuery: Record<string, Date> = {};
            if (filter.dateFrom) dateQuery.$gte = filter.dateFrom;
            if (filter.dateTo) dateQuery.$lte = filter.dateTo;
            query.createdAt = dateQuery;
        }

        const [created, validInPeriod, expiringInPeriod] = await Promise.all([
            Coupon.countDocuments(query).exec(),
            Coupon.countDocuments({
                ...(filter.dateFrom ? { validFrom: { $lte: filter.dateTo || new Date() } } : {}),
                ...(filter.dateTo ? { validUntil: { $gte: filter.dateFrom || new Date(0) } } : {}),
            }).exec(),
            Coupon.countDocuments({
                ...(filter.dateFrom || filter.dateTo
                    ? {
                          validUntil: {
                              ...(filter.dateFrom ? { $gte: filter.dateFrom } : {}),
                              ...(filter.dateTo ? { $lte: filter.dateTo } : {}),
                          },
                      }
                    : {}),
            }).exec(),
        ]);

        return {
            dateFrom: filter.dateFrom?.toISOString(),
            dateTo: filter.dateTo?.toISOString(),
            couponsCreated: created,
            couponsValidInPeriod: validInPeriod,
            couponsExpiringInPeriod: expiringInPeriod,
        };
    }

    private mapToTopUsedRow(doc: ICouponDocument): ITopUsedCouponRow {
        return {
            couponId: doc._id.toString(),
            code: doc.code,
            name: doc.name,
            discountType: doc.discountType,
            discountValue: doc.discountValue,
            usageCount: doc.usageCount,
            usageLimit: doc.usageLimit,
        };
    }
}
