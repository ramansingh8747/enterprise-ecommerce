/**
 * Enterprise API Versioning & Backward Compatibility Module — Barrel Export (Module 29.1 – 29.5).
 *
 * Re-exports all public module members following clean architecture standards.
 * Allows consumers to import from the module root:
 *   import { createApiVersionMiddleware, ApiVersionController, ApiVersionService, DefaultVersionProvider, VersionRegistry } from '../modules/api-versioning';
 */

// Enums
export * from './enums/api-version.enums';

// Constants
export * from './constants/api-version.constants';

// Config
export * from './config/api-version.config';

// Interfaces
export * from './interfaces/api-version.interfaces';

// Types
export * from './types/api-version.types';

// DTOs
export * from './dto/version-query.dto';
export * from './dto/version-lifecycle.dto';
export * from './dto/compatibility.dto';

// Storage
export * from './storage/version.store';

// Registry
export * from './registry/version.registry';

// Resolvers
export * from './resolver/strategy.resolver';
export * from './resolver/version.resolver';

// Providers
export * from './providers/api-version.provider';
export * from './providers/default-version.provider';

// Routing
export * from './routing/version.matcher';
export * from './routing/version.router';

// Middleware
export * from './middleware/api-version.middleware';

// Decorators
export * from './decorators/api-version.decorator';

// Services
export * from './services/api-version.service';

// Controllers
export * from './controllers/api-version.controller';

// Validators
export * from './validators/api-version.validator';

// Utils
export * from './utils/api-version.util';

// Router
export { default as apiVersionRoutes } from './routes/api-version.routes';
