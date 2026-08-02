/**
 * Notification controller placeholder (Step 15.9).
 *
 * Thin HTTP adapter — no endpoints wired yet.
 */

import { Request, Response, NextFunction } from "express";
import { NotificationService } from "../services/notification.service";

/**
 * Enterprise Notification Controller (placeholder).
 */
export class NotificationController {
    constructor(private readonly notificationService: NotificationService) {}

    /**
     * Placeholder — send notification.
     */
    async send(
        _req: Request,
        _res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            void this.notificationService;
            throw new Error(
                "NotificationController.send is not implemented yet."
            );
        } catch (error: unknown) {
            next(error);
        }
    }
}
