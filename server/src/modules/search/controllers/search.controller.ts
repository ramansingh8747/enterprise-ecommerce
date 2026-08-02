import { Request, Response, NextFunction } from 'express';
import { SearchService } from '../services/search.service';
import { QueryTransformerUtil } from '../utils/query-transformer.util';
import { ISearchResponse } from '../interfaces/search-response.interface';
import { ApiResponse } from '../../../interfaces/api-response.interface';

/**
 * Enterprise Search REST Controller (Module 22.5).
 *
 * Thin HTTP adapter for the Search API endpoint (SRP).
 * Responsibilities:
 * 1. Extract raw query parameters from the Express Request.
 * 2. Transform them into a strongly-typed SearchRequestDto via QueryTransformerUtil.
 * 3. Delegate to SearchService.searchProducts().
 * 4. Return the standardized ApiResponse envelope.
 * 5. Forward unexpected errors to the global error middleware via next().
 *
 * Contains zero business logic, zero persistence, zero query construction.
 */
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  /**
   * GET /api/v1/search
   *
   * Orchestrates the search request lifecycle:
   *   parse → transform → delegate → respond → (or) forward error.
   */
  search = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Step 1: Read raw query parameters from Express Request.
      const rawQuery = req.query as Record<string, unknown>;

      // Step 2: Transform query string values into a strongly typed SearchRequestDto.
      //         QueryTransformerUtil handles all casting ("true"→true, "25"→25, etc.)
      //         and comma-separated arrays. No transformation logic belongs here.
      const dto = QueryTransformerUtil.transform(rawQuery);

      // Step 3: Invoke SearchService with the normalized filter object.
      const result: ISearchResponse = await this.searchService.searchProducts(dto);

      // Step 4: Return standardized success response envelope.
      const response: ApiResponse<ISearchResponse> = {
        success: true,
        message: 'Products fetched successfully.',
        data: result,
      };

      res.status(200).json(response);
    } catch (error: unknown) {
      // Step 5: Forward unexpected errors to the global error handler.
      //         Internal error details must never be exposed in the response body.
      next(error);
    }
  };
}
