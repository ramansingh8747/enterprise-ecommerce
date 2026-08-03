/**
 * Enterprise Caching Engine — Module Barrel Export (Module 26.1 – 26.5).
 *
 * Re-exports all public module members following clean architecture standards.
 * Allows consumers to import from the module root:
 *   import { CacheController, CacheService, createCacheMiddleware, CacheInvalidator } from '../modules/cache';
 */

// Enums
export * from './enums/cache.enums';

// Constants
export * from './constants/cache.constants';

// Config
export * from './config/cache.config';

// Interfaces
export * from './interfaces/cache.interfaces';

// Types
export * from './types/cache.types';

// DTOs
export * from './dto/cache-query.dto';
export * from './dto/cache-set.dto';
export * from './dto/cache-invalidate.dto';
export * from './dto/cache-warmup.dto';

// Storage Engine
export * from './storage/cache.entry';
export * from './storage/eviction.policy';
export * from './storage/expiration.manager';
export * from './storage/cache.store';

// Providers
export * from './providers/cache.provider';
export * from './providers/memory-cache.provider';

// Services
export * from './services/cache.service';

// Controllers
export * from './controllers/cache.controller';

// Validators
export * from './validators/cache.validator';

// Middleware
export * from './middleware/cache.middleware';

// Decorators & Helpers
export * from './decorators/cache.decorator';

// Invalidation Framework
export * from './invalidation/invalidation.rules';
export * from './invalidation/cache-invalidator';

// Utils
export * from './utils/cache-key.util';

// Router (default export — matches pattern of other module barrels)
export { default as cacheRoutes } from './routes/cache.routes';
