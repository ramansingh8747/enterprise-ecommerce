import { Types, PipelineStage } from 'mongoose';
import { IAnalyticsRepository } from '../interfaces/analytics-repository.interface';
import {
  IAnalyticsRequest,
  ISummaryCard,
  IChartDataPoint,
  IMetricResult,
} from '../interfaces/analytics.interface';
import { AnalyticsMetric, AnalyticsGroupBy } from '../types/analytics.types';
import Order from '../../../modules/order/models/order.model';
import Product from '../../../models/product.model';
import User from '../../../models/user.model';
import { Inventory } from '../../../modules/inventory/models/inventory.model';
import ReviewModel from '../../../modules/review/models/review.model';
import Category from '../../../models/category.model';
import { OrderStatus, PaymentStatus } from '../../order/types/order.types';

/**
 * Analytics Repository Implementation (Module 23.3).
 *
 * Executes all database-level aggregation pipelines for the Analytics &
 * Reporting Engine. Implements IAnalyticsRepository (DIP).
 *
 * Design decisions:
 * — All $match stages are pushed to the first pipeline stage to exploit indexes.
 * — Private builder helpers produce reusable sub-pipeline fragments.
 * — Models are imported directly; no N+1 query patterns.
 * — No response DTO construction — raw numeric results only.
 * — Strict TypeScript with explicit aggregate type parameters.
 */
export class AnalyticsRepository implements IAnalyticsRepository {

  /* ========================================================================
     PRIVATE PIPELINE BUILDER HELPERS
     ====================================================================== */

  /**
   * Builds a $match stage filter object for Order documents within the
   * requested date range, optional order/payment status, and optional IDs.
   */
  private buildOrderMatchFilter(request: IAnalyticsRequest): Record<string, unknown> {
    const filter: Record<string, unknown> = {
      placedAt: {
        $gte: request.dateRange.from,
        $lte: request.dateRange.to,
      },
    };

    if (request.status) {
      // status may be OrderStatus or PaymentStatus — match both fields
      const isPaymentStatus = Object.values(PaymentStatus).includes(
        request.status as PaymentStatus
      );
      if (isPaymentStatus) {
        filter['paymentStatus'] = request.status;
      } else {
        filter['orderStatus'] = request.status;
      }
    }

    return filter;
  }

  /**
   * Builds the $dateToString format string for the requested AnalyticsGroupBy
   * granularity. The timezone is injected into the $dateToString expression.
   */
  private buildDateGroupExpression(
    groupBy: AnalyticsGroupBy,
    dateField: string,
    timezone: string
  ): Record<string, unknown> {
    const formatMap: Partial<Record<AnalyticsGroupBy, string>> = {
      [AnalyticsGroupBy.HOUR]:    '%Y-%m-%dT%H:00',
      [AnalyticsGroupBy.DAY]:     '%Y-%m-%d',
      [AnalyticsGroupBy.WEEK]:    '%G-W%V',
      [AnalyticsGroupBy.MONTH]:   '%Y-%m',
      [AnalyticsGroupBy.QUARTER]: '%Y-Q',
      [AnalyticsGroupBy.YEAR]:    '%Y',
    };

    const format = formatMap[groupBy] ?? '%Y-%m-%d';

    // Quarter bucketing requires a custom expression
    if (groupBy === AnalyticsGroupBy.QUARTER) {
      return {
        $concat: [
          { $dateToString: { format: '%Y', date: `$${dateField}`, timezone } },
          '-Q',
          {
            $toString: {
              $ceil: {
                $divide: [
                  { $add: [{ $month: { date: `$${dateField}`, timezone } }, 0] },
                  3,
                ],
              },
            },
          },
        ],
      };
    }

    return {
      $dateToString: {
        format,
        date: `$${dateField}`,
        timezone,
      },
    };
  }

  /**
   * Constructs a typed ISummaryCard from raw aggregation output values.
   */
  private buildSummaryCard(
    metric: AnalyticsMetric,
    label: string,
    value: number
  ): ISummaryCard {
    return {
      metric,
      label,
      value,
      formatted: value.toLocaleString('en-IN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }),
    };
  }

  /**
   * Resolves a MongoDB ObjectId from a string, returning undefined on failure.
   * Used to safely cast optional filter IDs.
   */
  private toObjectId(id: string | undefined): Types.ObjectId | undefined {
    if (!id) return undefined;
    return Types.ObjectId.isValid(id) ? new Types.ObjectId(id) : undefined;
  }

  /* ========================================================================
     PUBLIC REPOSITORY METHODS
     ====================================================================== */

  /**
   * Aggregates sales KPI summary cards:
   * — TOTAL_REVENUE, TOTAL_ORDERS, AVERAGE_ORDER_VALUE,
   *   GROSS_PROFIT, NET_REVENUE, UNITS_SOLD, REFUND_RATE.
   *
   * Source: Order collection (placedAt index).
   */
  async aggregateSalesMetrics(request: IAnalyticsRequest): Promise<ISummaryCard[]> {
    const matchFilter = this.buildOrderMatchFilter(request);

    const pipeline: PipelineStage[] = [
      { $match: matchFilter },
      {
        $group: {
          _id:          null,
          totalRevenue: { $sum: '$grandTotal' },
          totalOrders:  { $sum: 1 },
          totalUnits:   { $sum: { $sum: '$items.quantity' } },
          totalDiscount:{ $sum: '$discount' },
          totalTax:     { $sum: '$tax' },
          totalRefunds: {
            $sum: {
              $cond: [
                { $eq: ['$orderStatus', OrderStatus.REFUNDED] },
                '$grandTotal',
                0,
              ],
            },
          },
          refundedCount: {
            $sum: {
              $cond: [
                { $eq: ['$orderStatus', OrderStatus.REFUNDED] },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $project: {
          _id:           0,
          totalRevenue:  1,
          totalOrders:   1,
          totalUnits:    1,
          totalDiscount: 1,
          totalTax:      1,
          totalRefunds:  1,
          refundedCount: 1,
          avgOrderValue: {
            $cond: [
              { $gt: ['$totalOrders', 0] },
              { $divide: ['$totalRevenue', '$totalOrders'] },
              0,
            ],
          },
          refundRate: {
            $cond: [
              { $gt: ['$totalOrders', 0] },
              { $multiply: [{ $divide: ['$refundedCount', '$totalOrders'] }, 100] },
              0,
            ],
          },
          netRevenue: {
            $subtract: ['$totalRevenue', { $add: ['$totalDiscount', '$totalRefunds'] }],
          },
        },
      },
    ];

    type SalesAgg = {
      totalRevenue:  number;
      totalOrders:   number;
      totalUnits:    number;
      totalDiscount: number;
      totalTax:      number;
      totalRefunds:  number;
      refundedCount: number;
      avgOrderValue: number;
      refundRate:    number;
      netRevenue:    number;
    };

    const results = await Order.aggregate<SalesAgg>(pipeline).exec();
    const row     = results[0];

    if (!row) {
      return [
        this.buildSummaryCard(AnalyticsMetric.TOTAL_REVENUE,  'Total Revenue',   0),
        this.buildSummaryCard(AnalyticsMetric.TOTAL_ORDERS,   'Total Orders',    0),
        this.buildSummaryCard(AnalyticsMetric.UNITS_SOLD,     'Units Sold',      0),
        this.buildSummaryCard(AnalyticsMetric.NET_REVENUE,    'Net Revenue',     0),
        this.buildSummaryCard(AnalyticsMetric.REFUND_RATE,    'Refund Rate (%)', 0),
      ];
    }

    return [
      this.buildSummaryCard(AnalyticsMetric.TOTAL_REVENUE,  'Total Revenue',   row.totalRevenue),
      this.buildSummaryCard(AnalyticsMetric.TOTAL_ORDERS,   'Total Orders',    row.totalOrders),
      this.buildSummaryCard(AnalyticsMetric.UNITS_SOLD,     'Units Sold',      row.totalUnits),
      this.buildSummaryCard(AnalyticsMetric.NET_REVENUE,    'Net Revenue',     row.netRevenue),
      this.buildSummaryCard(AnalyticsMetric.REFUND_RATE,    'Refund Rate (%)', row.refundRate),
    ];
  }

  /**
   * Aggregates time-series revenue trend grouped by the requested granularity.
   *
   * Source: Order collection (placedAt index).
   * Returns one IChartDataPoint per time bucket, ordered chronologically.
   */
  async aggregateRevenueTrend(request: IAnalyticsRequest): Promise<IChartDataPoint[]> {
    const matchFilter = this.buildOrderMatchFilter(request);
    const dateBucket  = this.buildDateGroupExpression(
      request.groupBy,
      'placedAt',
      request.timezone
    );

    const pipeline: PipelineStage[] = [
      { $match: matchFilter },
      {
        $group: {
          _id:        dateBucket,
          revenue:    { $sum: '$grandTotal' },
          orders:     { $sum: 1 },
          units:      { $sum: { $sum: '$items.quantity' } },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id:     0,
          label:   '$_id',
          value:   '$revenue',
          metadata: {
            orders: '$orders',
            units:  '$units',
          },
        },
      },
    ];

    type TrendRow = { label: string; value: number; metadata: { orders: number; units: number } };
    const results = await Order.aggregate<TrendRow>(pipeline).exec();

    return results.map((row) => ({
      label:    row.label,
      value:    row.value,
      metadata: row.metadata,
    }));
  }

  /**
   * Ranks products by total units sold (default) or total revenue,
   * filtered by optional categoryId / brandId / productId.
   *
   * Source: Order collection → $unwind items → $group by productId → $sort.
   * Returns a paginated slice with a separate count pipeline.
   */
  async aggregateTopProducts(
    request: IAnalyticsRequest
  ): Promise<{ items: IMetricResult[]; total: number }> {
    const matchFilter = this.buildOrderMatchFilter(request);

    // Optional item-level filters applied after $unwind
    const itemFilter: Record<string, unknown> = {};
    const productOid  = this.toObjectId(request.productId);
    const categoryOid = this.toObjectId(request.categoryId);
    const brandOid    = this.toObjectId(request.brandId);

    if (productOid) {
      itemFilter['items.productId'] = productOid;
    }

    const skip  = (request.page - 1) * request.limit;

    const pipeline: PipelineStage[] = [
      { $match: matchFilter },
      { $unwind: '$items' },
      ...(Object.keys(itemFilter).length > 0 ? [{ $match: itemFilter } as PipelineStage] : []),
      {
        $group: {
          _id:         '$items.productId',
          productName: { $first: '$items.productName' },
          unitsSold:   { $sum: '$items.quantity' },
          revenue:     { $sum: '$items.lineTotal' },
          orderCount:  { $sum: 1 },
        },
      },
    ];

    // Optional category / brand join-filter — project only required fields
    if (categoryOid || brandOid) {
      pipeline.push({
        $lookup: {
          from:         'products',
          localField:   '_id',
          foreignField: '_id',
          as:           'productDoc',
          pipeline: [
            { $project: { category: 1, brand: 1 } },
          ],
        },
      });
      pipeline.push({ $unwind: '$productDoc' });

      const productDocFilter: Record<string, unknown> = {};
      if (categoryOid) productDocFilter['productDoc.category'] = categoryOid;
      if (brandOid)    productDocFilter['productDoc.brand']    = brandOid;
      pipeline.push({ $match: productDocFilter });
    }

    const sortField = request.sortBy === 'revenue' ? 'revenue' : 'unitsSold';
    const sortDir   = request.sortOrder === 'ASC' ? 1 : -1;

    pipeline.push({ $sort: { [sortField]: sortDir } as Record<string, 1 | -1> });

    // Count pipeline (before skip/limit)
    const countPipeline: PipelineStage[] = [
      ...pipeline,
      { $count: 'total' },
    ];

    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: request.limit });
    pipeline.push({
      $project: {
        _id:         0,
        entityId:    { $toString: '$_id' },
        entityName:  '$productName',
        unitsSold:   1,
        revenue:     1,
        orderCount:  1,
      },
    });

    type ProductRow = {
      entityId:   string;
      entityName: string;
      unitsSold:  number;
      revenue:    number;
      orderCount: number;
    };

    const [rows, countResult] = await Promise.all([
      Order.aggregate<ProductRow>(pipeline).exec(),
      Order.aggregate<{ total: number }>(countPipeline).exec(),
    ]);

    const total = countResult[0]?.total ?? 0;

    const items: IMetricResult[] = rows.map((row, idx) => ({
      rank:       skip + idx + 1,
      entityId:   row.entityId,
      entityName: row.entityName,
      metrics:    {
        [AnalyticsMetric.UNITS_SOLD]:    row.unitsSold,
        [AnalyticsMetric.TOTAL_REVENUE]: row.revenue,
        [AnalyticsMetric.TOTAL_ORDERS]:  row.orderCount,
      },
    }));

    return { items, total };
  }

  /**
   * Aggregates customer KPIs:
   * — TOTAL_CUSTOMERS, NEW_CUSTOMERS, RETURNING_CUSTOMERS.
   *
   * Source: User collection (createdAt) + Order collection (customer field).
   */
  async aggregateCustomerMetrics(request: IAnalyticsRequest): Promise<ISummaryCard[]> {
    const { from, to } = request.dateRange;

    // All three queries run in parallel — no sequential round trips.
    const [newCustomersResult, orderCustomerResult, totalCustomers] = await Promise.all([
      // New customers registered within the date range
      User.aggregate<{ count: number }>([
        { $match: { createdAt: { $gte: from, $lte: to } } },
        { $count: 'count' },
      ]).exec(),

      // Unique + returning customers derived from orders in date range
      Order.aggregate<{ uniqueCustomers: number; returningCustomers: number }>([
        {
          $match: {
            placedAt: { $gte: from, $lte: to },
          },
        },
        {
          $group: {
            _id:        '$customer',
            orderCount: { $sum: 1 },
          },
        },
        {
          $group: {
            _id:                null,
            uniqueCustomers:    { $sum: 1 },
            returningCustomers: {
              $sum: { $cond: [{ $gt: ['$orderCount', 1] }, 1, 0] },
            },
          },
        },
        {
          $project: {
            _id:                0,
            uniqueCustomers:    1,
            returningCustomers: 1,
          },
        },
      ]).exec(),

      // Total registered users (all-time snapshot)
      User.countDocuments({}).exec(),
    ]);

    const newCustomers       = newCustomersResult[0]?.count ?? 0;
    const returningCustomers = orderCustomerResult[0]?.returningCustomers ?? 0;

    return [
      this.buildSummaryCard(AnalyticsMetric.TOTAL_CUSTOMERS,     'Total Customers',     totalCustomers),
      this.buildSummaryCard(AnalyticsMetric.NEW_CUSTOMERS,        'New Customers',       newCustomers),
      this.buildSummaryCard(AnalyticsMetric.RETURNING_CUSTOMERS,  'Returning Customers', returningCustomers),
    ];
  }

  /**
   * Aggregates inventory health KPIs:
   * — TOTAL_PRODUCTS, LOW_STOCK_PRODUCTS, OUT_OF_STOCK_PRODUCTS.
   *
   * Source: Product catalog + Inventory collection.
   * Optional categoryId / brandId filter applied to Product collection.
   */
  async aggregateInventoryMetrics(request: IAnalyticsRequest): Promise<ISummaryCard[]> {
    const categoryOid = this.toObjectId(request.categoryId);
    const brandOid    = this.toObjectId(request.brandId);

    // Build the optional product-level $match for the $lookup filter
    const productMatchFilter: Record<string, unknown> = {};
    if (categoryOid) productMatchFilter['category'] = categoryOid;
    if (brandOid)    productMatchFilter['brand']     = brandOid;
    const hasProductFilter = Object.keys(productMatchFilter).length > 0;

    // Single Inventory pipeline — folds optional Product filter via $lookup
    // to avoid a separate Product.aggregate round trip.
    const pipeline: PipelineStage[] = [
      { $match: { isActive: true } },
    ];

    if (hasProductFilter) {
      pipeline.push({
        $lookup: {
          from:         'products',
          localField:   'product',
          foreignField: '_id',
          as:           'productDoc',
          pipeline: [
            { $project: { category: 1, brand: 1 } },
          ],
        },
      });
      pipeline.push({ $unwind: '$productDoc' });
      pipeline.push({ $match: productMatchFilter.category
        ? productMatchFilter.brand
          ? { 'productDoc.category': productMatchFilter['category'], 'productDoc.brand': productMatchFilter['brand'] }
          : { 'productDoc.category': productMatchFilter['category'] }
        : { 'productDoc.brand': productMatchFilter['brand'] }
      });
    }

    pipeline.push(
      {
        $group: {
          _id:            '$product',
          availableStock: { $sum: '$availableStock' },
          reorderLevel:   { $first: '$reorderLevel' },
        },
      },
      {
        $group: {
          _id:           null,
          totalProducts: { $sum: 1 },
          lowStockProducts: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gt: ['$availableStock', 0] },
                    { $lte: ['$availableStock', '$reorderLevel'] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          outOfStockProducts: {
            $sum: { $cond: [{ $eq: ['$availableStock', 0] }, 1, 0] },
          },
        },
      },
      {
        $project: {
          _id:                0,
          totalProducts:      1,
          lowStockProducts:   1,
          outOfStockProducts: 1,
        },
      }
    );

    const inventoryResult = await Inventory.aggregate<{
      totalProducts:      number;
      lowStockProducts:   number;
      outOfStockProducts: number;
    }>(pipeline).exec();

    const row = inventoryResult[0];

    return [
      this.buildSummaryCard(AnalyticsMetric.TOTAL_PRODUCTS,        'Total Products',        row?.totalProducts      ?? 0),
      this.buildSummaryCard(AnalyticsMetric.LOW_STOCK_PRODUCTS,    'Low Stock Products',    row?.lowStockProducts   ?? 0),
      this.buildSummaryCard(AnalyticsMetric.OUT_OF_STOCK_PRODUCTS, 'Out of Stock Products', row?.outOfStockProducts ?? 0),
    ];
  }

  /**
   * Aggregates category-level revenue breakdown within the date range.
   *
   * Source: Order collection → $unwind items → $lookup products → $group by category.
   * Returns one IChartDataPoint per category, ordered by revenue descending.
   */
  async aggregateCategoryBreakdown(request: IAnalyticsRequest): Promise<IChartDataPoint[]> {
    const matchFilter = this.buildOrderMatchFilter(request);

    const pipeline: PipelineStage[] = [
      { $match: matchFilter },
      { $unwind: '$items' },
      {
        $lookup: {
          from:         'products',
          localField:   'items.productId',
          foreignField: '_id',
          as:           'product',
          pipeline: [
            { $project: { category: 1 } },
          ],
        },
      },
      { $unwind: { path: '$product', preserveNullAndEmptyArrays: false } },
      {
        $lookup: {
          from:         'categories',
          localField:   'product.category',
          foreignField: '_id',
          as:           'category',
          pipeline: [
            { $project: { name: 1 } },
          ],
        },
      },
      { $unwind: { path: '$category', preserveNullAndEmptyArrays: false } },
      {
        $group: {
          _id:     '$category._id',
          label:   { $first: '$category.name' },
          value:   { $sum: '$items.lineTotal' },
          orders:  { $sum: 1 },
          units:   { $sum: '$items.quantity' },
        },
      },
      { $sort: { value: -1 } },
      {
        $project: {
          _id:     0,
          label:   1,
          value:   1,
          metadata: {
            categoryId: { $toString: '$_id' },
            orders:     '$orders',
            units:      '$units',
          },
        },
      },
    ];

    type CatRow = { label: string; value: number; metadata: Record<string, unknown> };
    const results = await Order.aggregate<CatRow>(pipeline).exec();

    return results.map((row) => ({
      label:    row.label,
      value:    row.value,
      metadata: row.metadata,
    }));
  }

  /**
   * Aggregates coupon usage and discount impact KPIs.
   *
   * Source: Order collection — uses discount field and order count.
   * Note: coupon code is not stored on Order in the current schema;
   * metrics are derived from the discount and grandTotal fields.
   */
  async aggregateCouponMetrics(request: IAnalyticsRequest): Promise<ISummaryCard[]> {
    const matchFilter = this.buildOrderMatchFilter(request);

    const pipeline: PipelineStage[] = [
      { $match: matchFilter },
      {
        $group: {
          _id:              null,
          totalOrders:      { $sum: 1 },
          ordersWithDiscount: {
            $sum: { $cond: [{ $gt: ['$discount', 0] }, 1, 0] },
          },
          totalDiscount:    { $sum: '$discount' },
          totalRevenue:     { $sum: '$grandTotal' },
        },
      },
      {
        $project: {
          _id:              0,
          totalOrders:      1,
          ordersWithDiscount: 1,
          totalDiscount:    1,
          couponUsageRate: {
            $cond: [
              { $gt: ['$totalOrders', 0] },
              { $multiply: [{ $divide: ['$ordersWithDiscount', '$totalOrders'] }, 100] },
              0,
            ],
          },
        },
      },
    ];

    type CouponAgg = {
      totalOrders:       number;
      ordersWithDiscount: number;
      totalDiscount:     number;
      couponUsageRate:   number;
    };

    const results = await Order.aggregate<CouponAgg>(pipeline).exec();
    const row     = results[0];

    return [
      this.buildSummaryCard(AnalyticsMetric.COUPON_USAGE_RATE, 'Coupon Usage Rate (%)', row?.couponUsageRate   ?? 0),
      this.buildSummaryCard(AnalyticsMetric.GROSS_PROFIT,       'Total Discount Given',  row?.totalDiscount     ?? 0),
    ];
  }

  /**
   * Aggregates review volume and average rating KPIs.
   *
   * Source: Review collection (createdAt index).
   * Optional productId filter.
   */
  async aggregateReviewMetrics(request: IAnalyticsRequest): Promise<ISummaryCard[]> {
    const { from, to } = request.dateRange;

    const matchFilter: Record<string, unknown> = {
      createdAt: { $gte: from, $lte: to },
      status:    'APPROVED',
    };

    const productOid = this.toObjectId(request.productId);
    if (productOid) matchFilter['productId'] = productOid;

    const pipeline: PipelineStage[] = [
      { $match: matchFilter },
      {
        $group: {
          _id:           null,
          totalReviews:  { $sum: 1 },
          averageRating: { $avg: '$rating' },
        },
      },
      {
        $project: {
          _id:           0,
          totalReviews:  1,
          averageRating: { $round: ['$averageRating', 2] },
        },
      },
    ];

    type ReviewAgg = { totalReviews: number; averageRating: number };
    const results = await ReviewModel.aggregate<ReviewAgg>(pipeline).exec();
    const row     = results[0];

    return [
      this.buildSummaryCard(AnalyticsMetric.TOTAL_REVIEWS,  'Total Reviews',  row?.totalReviews  ?? 0),
      this.buildSummaryCard(AnalyticsMetric.AVERAGE_RATING, 'Average Rating', row?.averageRating ?? 0),
    ];
  }
}
