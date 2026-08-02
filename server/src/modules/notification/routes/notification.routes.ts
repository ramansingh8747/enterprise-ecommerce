import { Router } from "express";
import { NotificationController } from "../controllers/notification.controller";
import { NotificationRepository } from "../repositories/notification.repository";
import { NotificationService } from "../services/notification.service";

/**
 * Enterprise Notification Routes — composition root (Step 15.9).
 *
 * Empty router: no HTTP endpoints yet.
 * Not mounted in app.ts (same approach as Payment Step 15.6).
 */

const notificationRepository = new NotificationRepository();
const notificationService = new NotificationService(notificationRepository);
const notificationController = new NotificationController(notificationService);

const router = Router();

// Endpoints deferred to a later Notification API step.
void notificationController;

export default router;
export {
    notificationRepository,
    notificationService,
    notificationController,
};
