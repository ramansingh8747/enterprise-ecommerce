import { SearchRequestDto } from '../dto/search-request.dto';
import { SortField, SortDirection, StockStatus, AvailabilityStatus } from '../types/search.types';

/**
 * Express Query String Parameter Transformation Helper (Module 22.5).
 * Safely parses and typecasts raw HTTP req.query parameters into strongly typed SearchRequestDto.
 */
export class QueryTransformerUtil {
  /**
   * Transforms raw Express query parameters into a strongly typed SearchRequestDto.
   */
  static transform(rawQuery: Record<string, any>): SearchRequestDto {
    const dto: SearchRequestDto = {};

    if (rawQuery.keyword && typeof rawQuery.keyword === 'string') {
      const trimmed = rawQuery.keyword.trim();
      if (trimmed.length > 0) {
        dto.keyword = trimmed;
      }
    }

    if (rawQuery.category) {
      dto.category = this.parseStringOrArray(rawQuery.category) as any;
    }

    if (rawQuery.brand) {
      dto.brand = this.parseStringOrArray(rawQuery.brand) as any;
    }

    if (rawQuery.minPrice !== undefined && rawQuery.minPrice !== null && rawQuery.minPrice !== '') {
      const parsed = parseFloat(rawQuery.minPrice);
      if (!isNaN(parsed) && parsed >= 0) {
        dto.minPrice = parsed;
      }
    }

    if (rawQuery.maxPrice !== undefined && rawQuery.maxPrice !== null && rawQuery.maxPrice !== '') {
      const parsed = parseFloat(rawQuery.maxPrice);
      if (!isNaN(parsed) && parsed >= 0) {
        dto.maxPrice = parsed;
      }
    }

    if (rawQuery.rating !== undefined && rawQuery.rating !== null && rawQuery.rating !== '') {
      const parsed = parseFloat(rawQuery.rating);
      if (!isNaN(parsed) && parsed >= 0 && parsed <= 5) {
        dto.rating = parsed;
      }
    }

    if (rawQuery.stockStatus && typeof rawQuery.stockStatus === 'string') {
      const upper = rawQuery.stockStatus.toUpperCase();
      if (Object.values(StockStatus).includes(upper as StockStatus)) {
        dto.stockStatus = upper as StockStatus;
      }
    }

    if (rawQuery.availability !== undefined && rawQuery.availability !== null) {
      if (typeof rawQuery.availability === 'boolean') {
        dto.availability = rawQuery.availability ? AvailabilityStatus.AVAILABLE : AvailabilityStatus.DISCONTINUED;
      } else if (typeof rawQuery.availability === 'string') {
        const val = rawQuery.availability.trim().toLowerCase();
        if (val === 'true') {
          dto.availability = AvailabilityStatus.AVAILABLE;
        } else if (val === 'false') {
          dto.availability = AvailabilityStatus.DISCONTINUED;
        } else {
          const upper = rawQuery.availability.toUpperCase();
          if (Object.values(AvailabilityStatus).includes(upper as AvailabilityStatus)) {
            dto.availability = upper as AvailabilityStatus;
          }
        }
      }
    }

    if (rawQuery.tags) {
      dto.tags = this.parseStringOrArray(rawQuery.tags);
    }

    if (rawQuery.page !== undefined && rawQuery.page !== null && rawQuery.page !== '') {
      const parsed = parseInt(rawQuery.page, 10);
      if (!isNaN(parsed) && parsed >= 1) {
        dto.page = parsed;
      }
    }

    if (rawQuery.limit !== undefined && rawQuery.limit !== null && rawQuery.limit !== '') {
      const parsed = parseInt(rawQuery.limit, 10);
      if (!isNaN(parsed) && parsed >= 1) {
        dto.limit = parsed;
      }
    }

    if (rawQuery.sortBy && typeof rawQuery.sortBy === 'string') {
      const field = rawQuery.sortBy.trim();
      if (['price', 'createdAt', 'updatedAt', 'rating', 'popularity', 'name'].includes(field)) {
        dto.sortBy = field as SortField;
      }
    }

    if (rawQuery.sortOrder && typeof rawQuery.sortOrder === 'string') {
      const order = rawQuery.sortOrder.trim().toUpperCase();
      if (order === 'ASC' || order === 'DESC') {
        dto.sortOrder = order as SortDirection;
      }
    }

    // Dynamic attributes parsing (e.g., attr[color]=red or attributes[size]=large,medium)
    const attributes = this.extractAttributes(rawQuery);
    if (Object.keys(attributes).length > 0) {
      dto.attributes = attributes;
    }

    return dto;
  }

  /**
   * Parses string, comma-separated string, or array into string array.
   */
  private static parseStringOrArray(value: any): string[] {
    if (Array.isArray(value)) {
      return value.map((v) => String(v).trim()).filter((v) => v.length > 0);
    }

    if (typeof value === 'string') {
      if (value.includes(',')) {
        return value.split(',').map((v) => v.trim()).filter((v) => v.length > 0);
      }
      const trimmed = value.trim();
      return trimmed.length > 0 ? [trimmed] : [];
    }

    return [];
  }

  /**
   * Extracts dynamic attribute object parameters from raw HTTP query.
   */
  private static extractAttributes(rawQuery: Record<string, any>): Record<string, string | string[]> {
    const attributes: Record<string, string | string[]> = {};

    if (rawQuery.attributes && typeof rawQuery.attributes === 'object' && !Array.isArray(rawQuery.attributes)) {
      for (const [attrKey, attrVal] of Object.entries(rawQuery.attributes)) {
        const parsed = this.parseStringOrArray(attrVal);
        if (parsed.length === 1) {
          attributes[attrKey] = parsed[0];
        } else if (parsed.length > 1) {
          attributes[attrKey] = parsed;
        }
      }
    }

    if (rawQuery.attr && typeof rawQuery.attr === 'object' && !Array.isArray(rawQuery.attr)) {
      for (const [attrKey, attrVal] of Object.entries(rawQuery.attr)) {
        const parsed = this.parseStringOrArray(attrVal);
        if (parsed.length === 1) {
          attributes[attrKey] = parsed[0];
        } else if (parsed.length > 1) {
          attributes[attrKey] = parsed;
        }
      }
    }

    return attributes;
  }
}
