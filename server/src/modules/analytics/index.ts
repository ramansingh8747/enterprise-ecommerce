/**
 * Analytics & Reporting Engine — Module Barrel Export (Module 23.1 / 23.2).
 *
 * Re-exports all public module members in the same pattern as:
 * notification/index.ts, review/index.ts, and wishlist/index.ts.
 *
 * Consumers can import from the module root:
 *   import { AnalyticsController, IAnalyticsRequest } from '../modules/analytics';
 */

// Types & Enums
export * from './types/analytics.types';

// Constants
export * from './constants/analytics.constants';

// Interfaces
export * from './interfaces/analytics.interface';
export * from './interfaces/analytics-service.interface';
export * from './interfaces/analytics-repository.interface';

// DTOs
export * from './dto/analytics-request.dto';
export * from './dto/analytics-response.dto';

// Repository
export * from './repositories/analytics.repository';

// Service
export * from './services/analytics.service';

// Controller
export * from './controllers/analytics.controller';

// Validators
export * from './validators/analytics.validator';

// Utils
export * from './utils/analytics-query-transformer.util';

// Router (default export — matches the pattern of other module barrels)
export { default as analyticsRoutes } from './routes/analytics.routes';
