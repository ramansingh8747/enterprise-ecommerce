import { Router, Request, Response, NextFunction } from 'express';
import { searchController } from '../../../container';
import { searchProductsValidation } from '../validators/search.validation';

/**
 * Enterprise Search Routes (Module 22.6).
 *
 * Thin route wiring layer for the Search API endpoint.
 * Responsibilities (SRP):
 *   1. Mount express-validator chains (searchProductsValidation).
 *   2. Delegate to SearchController.search() handler.
 *
 * No business logic. No direct DB access. No manual DI.
 * Mounted at: /api/v1/search
 */
const searchRouter = Router();

/**
 * GET /api/v1/search
 *
 * Public product search endpoint. Supports keyword, filters,
 * multi-value fields, price range, rating, sorting, and pagination.
 *
 * Middleware order:
 *   1. searchProductsValidation  — express-validator chains + validateRequest gate
 *   2. SearchController.search() — thin HTTP adapter, delegates to SearchService
 *
 * Note: No authentication required — product search is a public API.
 *       To restrict to authenticated users only, add `authenticate` before
 *       searchProductsValidation following the existing project convention.
 */
searchRouter.get(
  '/',
  ...searchProductsValidation,
  (req: Request, res: Response, next: NextFunction) =>
    searchController.search(req, res, next)
);

export default searchRouter;
