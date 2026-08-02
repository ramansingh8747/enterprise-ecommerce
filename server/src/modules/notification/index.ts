// Barrel export for Notification Module (Interfaces, Models, Repositories, Services, Controllers, Validations, Routes, Types)
export * from './types/notification.types';
export * from './interfaces/notification-recipient.interface';
export * from './interfaces/notification-attachment.interface';
export * from './interfaces/notification-metadata.interface';
export * from './interfaces/notification-context.interface';
export * from './interfaces/notification-payload.interface';
export * from './interfaces/notification-result.interface';
export * from './interfaces/notification-provider.interface';
export * from './interfaces/notification-service.interface';
export * from './interfaces/notification.interface';
export * from './interfaces/notification-repository.interface';
export * from './models/notification.model';
export * from './repositories/notification.repository';
export * from './services/notification.service';
export * from './controllers/notification.controller';
export * from './validations/notification.validation';
export * from './dto/notification.dto';
export { default as notificationRoutes } from './routes/notification.routes';
