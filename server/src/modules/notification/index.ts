/**
 * Enterprise Notification Module public barrel (Step 15.9).
 *
 * Re-exports architecture foundations only.
 * Routes are not mounted in app.ts yet.
 * Order module is not coupled in this step.
 */

export * from "./types/notification.types";
export * from "./constants/notification.constants";
export * from "./interfaces/notification.interface";
export * from "./interfaces/notification-provider.interface";
export * from "./interfaces/notification-repository.interface";
export * from "./interfaces/notification-service.interface";
export * from "./dto/notification.dto";
export * from "./factory/notification-provider.factory";
export * from "./providers/mock.provider";
export * from "./providers/email.provider";
export * from "./providers/sms.provider";
export * from "./providers/push.provider";
export * from "./validations/notification.validation";
export * from "./repositories/notification.repository";
export * from "./services/notification.service";
export * from "./controllers/notification.controller";

export { default as notificationRoutes } from "./routes/notification.routes";
export {
    notificationRepository,
    notificationService,
    notificationController,
} from "./routes/notification.routes";
