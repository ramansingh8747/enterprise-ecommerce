import { ISearchFilters } from '../interfaces/search-filters.interface';
import { StockStatus, AvailabilityStatus } from '../types/search.types';
import { RegexEscapeUtil } from '../utils/regex-escape.util';

/**
 * Enterprise Search Query Builder (Module 22.2).
 * Converts incoming application search filters into plain, immutable MongoDB filter query objects.
 * Completely independent of database drivers or repository execution.
 */
export class SearchQueryBuilder {
  /**
   * Combines all filter fragment methods into one final MongoDB filter object.
   */
  static build(filters: ISearchFilters): Record<string, any> {
    if (!filters) return { isDeleted: false };

    const queryParts: Record<string, any>[] = [
      { isDeleted: false },
      this.buildKeyword(filters.keyword),
      this.buildCategory(filters.category),
      this.buildBrand(filters.brand),
      this.buildPriceRange(filters.minPrice, filters.maxPrice),
      this.buildRating(filters.rating),
      this.buildStockStatus(filters.stockStatus),
      this.buildAvailability(filters.availability),
      this.buildTags(filters.tags),
      this.buildAttributes(filters.attributes),
    ].filter((part) => Object.keys(part).length > 0);

    if (queryParts.length === 1) {
      return queryParts[0];
    }

    return { $and: queryParts };
  }

  /**
   * Builds keyword regex search for name, slug, shortDescription, description.
   */
  static buildKeyword(keyword?: string): Record<string, any> {
    if (!keyword || typeof keyword !== 'string' || keyword.trim().length === 0) {
      return {};
    }

    const escaped = RegexEscapeUtil.escape(keyword.trim());
    const regex = { $regex: escaped, $options: 'i' };

    return {
      $or: [
        { name: regex },
        { slug: regex },
        { shortDescription: regex },
        { description: regex },
      ],
    };
  }

  /**
   * Builds single or multiple category filter using $in.
   */
  static buildCategory(category?: string | string[]): Record<string, any> {
    if (!category) return {};
    if (Array.isArray(category)) {
      const validCategories = category.filter((c) => typeof c === 'string' && c.trim().length > 0);
      if (validCategories.length === 0) return {};
      return { category: { $in: validCategories } };
    }
    if (typeof category === 'string' && category.trim().length > 0) {
      return { category: category.trim() };
    }
    return {};
  }

  /**
   * Builds single or multiple brand filter using $in.
   */
  static buildBrand(brand?: string | string[]): Record<string, any> {
    if (!brand) return {};
    if (Array.isArray(brand)) {
      const validBrands = brand.filter((b) => typeof b === 'string' && b.trim().length > 0);
      if (validBrands.length === 0) return {};
      return { brand: { $in: validBrands } };
    }
    if (typeof brand === 'string' && brand.trim().length > 0) {
      return { brand: brand.trim() };
    }
    return {};
  }

  /**
   * Builds price range filter ($gte, $lte).
   */
  static buildPriceRange(minPrice?: number, maxPrice?: number): Record<string, any> {
    const priceQuery: Record<string, number> = {};

    if (minPrice !== undefined && minPrice !== null && !isNaN(Number(minPrice)) && Number(minPrice) >= 0) {
      priceQuery.$gte = Number(minPrice);
    }

    if (maxPrice !== undefined && maxPrice !== null && !isNaN(Number(maxPrice)) && Number(maxPrice) >= 0) {
      priceQuery.$lte = Number(maxPrice);
    }

    if (Object.keys(priceQuery).length === 0) {
      return {};
    }

    return { price: priceQuery };
  }

  /**
   * Builds minimum rating filter ($gte).
   */
  static buildRating(rating?: number): Record<string, any> {
    if (rating === undefined || rating === null || isNaN(Number(rating)) || Number(rating) <= 0) {
      return {};
    }
    return { averageRating: { $gte: Number(rating) } };
  }

  /**
   * Builds stock status query fragment.
   */
  static buildStockStatus(stockStatus?: StockStatus | string): Record<string, any> {
    if (!stockStatus) return {};

    switch (stockStatus) {
      case StockStatus.IN_STOCK:
        return { stockQuantity: { $gt: 0 } };
      case StockStatus.OUT_OF_STOCK:
        return { stockQuantity: { $lte: 0 } };
      case StockStatus.LOW_STOCK:
        return { stockQuantity: { $gt: 0, $lte: 10 } };
      case StockStatus.BACKORDER:
        return { isBackorderAllowed: true };
      default:
        return {};
    }
  }

  /**
   * Builds availability status query fragment.
   */
  static buildAvailability(availability?: boolean | string | AvailabilityStatus): Record<string, any> {
    if (availability === undefined || availability === null) return {};

    if (typeof availability === 'boolean') {
      return { isAvailable: availability };
    }

    if (availability === AvailabilityStatus.AVAILABLE || availability === 'true') {
      return { isAvailable: true };
    }

    if (availability === AvailabilityStatus.DISCONTINUED || availability === 'false') {
      return { isAvailable: false };
    }

    if (availability === AvailabilityStatus.PREORDER) {
      return { isPreorder: true };
    }

    return {};
  }

  /**
   * Builds tags filter using $all.
   */
  static buildTags(tags?: string | string[]): Record<string, any> {
    if (!tags) return {};

    const tagList = Array.isArray(tags)
      ? tags.filter((t) => typeof t === 'string' && t.trim().length > 0)
      : [tags].filter((t) => typeof t === 'string' && t.trim().length > 0);

    if (tagList.length === 0) return {};

    return { tags: { $all: tagList.map((t) => t.trim().toLowerCase()) } };
  }

  /**
   * Builds dynamic product attributes query fragments.
   */
  static buildAttributes(attributes?: Record<string, string | string[]>): Record<string, any> {
    if (!attributes || typeof attributes !== 'object' || Object.keys(attributes).length === 0) {
      return {};
    }

    const attributeFilters: Record<string, any>[] = [];

    for (const [key, value] of Object.entries(attributes)) {
      if (!key || value === undefined || value === null) continue;

      const sanitizedKey = key.trim();
      if (!sanitizedKey) continue;

      if (Array.isArray(value)) {
        const validValues = value.filter((v) => typeof v === 'string' && v.trim().length > 0);
        if (validValues.length > 0) {
          attributeFilters.push({
            attributes: {
              $elemMatch: {
                name: sanitizedKey,
                value: { $in: validValues },
              },
            },
          });
        }
      } else if (typeof value === 'string' && value.trim().length > 0) {
        attributeFilters.push({
          attributes: {
            $elemMatch: {
              name: sanitizedKey,
              value: value.trim(),
            },
          },
        });
      }
    }

    if (attributeFilters.length === 0) return {};

    if (attributeFilters.length === 1) {
      return attributeFilters[0];
    }

    return { $and: attributeFilters };
  }
}
