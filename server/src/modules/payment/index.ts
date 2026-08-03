/**
 * Enterprise Payment Gateway Module — Barrel Export (Module 27.1 – 27.5).
 *
 * Re-exports all public module members following clean architecture standards.
 * Allows consumers to import from the module root:
 *   import { PaymentController, WebhookController, PaymentService, WebhookService } from '../modules/payment';
 */

// Enums
export * from './enums/payment.enums';

// Constants
export * from './constants/payment.constants';

// Config
export * from './config/payment.config';

// Interfaces
export * from './interfaces/payment.interfaces';

// Types
export * from './types/payment.types';

// DTOs
export * from './dto/payment-create.dto';
export * from './dto/payment-capture.dto';
export * from './dto/payment-refund.dto';
export * from './dto/payment-query.dto';
export * from './dto/webhook.dto';

// Models
export * from './models/payment.model';

// Repositories
export * from './repositories/payment.repository';
export * from './repositories/mongo-payment.repository';

// Providers
export * from './providers/payment.provider';
export * from './providers/mock-payment.provider';
export * from './providers/provider.registry';
export * from './providers/payment.factory';

// Services
export * from './services/payment.service';

// Controllers
export * from './controllers/payment.controller';
export * from './controllers/webhook.controller';

// Validators
export * from './validators/payment.validator';
export * from './validators/webhook.validator';

// Webhooks
export * from './webhooks/webhook.validator';
export * from './webhooks/webhook.processor';
export * from './webhooks/webhook.service';

// Callbacks
export * from './callbacks/callback.handler';

// Utils
export * from './utils/payment.util';

// Routers (default exports — matches pattern of other module barrels)
export { default as paymentRoutes } from './routes/payment.routes';
export { default as webhookRoutes } from './routes/webhook.routes';
