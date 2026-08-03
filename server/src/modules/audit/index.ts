/**
 * Enterprise Audit Logging Engine — Module Barrel Export (Module 24.1 – 24.5).
 *
 * Re-exports all public module members following clean architecture standards.
 * Allows consumers to import from the module root:
 *   import { AuditController, AuditService, createAuditMiddleware } from '../modules/audit';
 */

// Enums
export * from './enums/audit.enums';

// Constants
export * from './constants/audit.constants';

// Config
export * from './config/audit.config';

// Interfaces
export * from './interfaces/audit.interface';

// Types
export * from './types/audit.types';

// DTOs
export * from './dto/audit-query.dto';
export * from './dto/audit-export.dto';
export * from './dto/audit-cleanup.dto';

// Models
export * from './models/audit.model';

// Repositories
export * from './repositories/audit.repository';
export * from './repositories/mongo-audit.repository';

// Providers
export * from './providers/audit.provider';

// Services
export * from './services/audit.service';

// Controllers
export * from './controllers/audit.controller';

// Validators
export * from './validators/audit.validator';

// Middleware
export * from './middleware/audit.middleware';

// Decorators & Helpers
export * from './decorators/audit.decorator';

// Utils
export * from './utils/audit-context.util';

// Router (default export — matches pattern of other module barrels)
export { default as auditRoutes } from './routes/audit.routes';
