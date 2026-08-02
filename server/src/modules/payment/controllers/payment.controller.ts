/**
 * Payment controller placeholder (Step 15.6).
 *
 * Thin HTTP adapter — no endpoints wired yet.
 */

import { Request, Response, NextFunction } from "express";
import { PaymentService } from "../services/payment.service";

/**
 * Enterprise Payment Controller (placeholder).
 */
export class PaymentController {
    constructor(private readonly paymentService: PaymentService) {}

    /**
     * Placeholder — initiate payment.
     */
    async createPayment(
        _req: Request,
        _res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            void this.paymentService;
            throw new Error(
                "PaymentController.createPayment is not implemented yet."
            );
        } catch (error: unknown) {
            next(error);
        }
    }

    /**
     * Placeholder — verify payment.
     */
    async verifyPayment(
        _req: Request,
        _res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            throw new Error(
                "PaymentController.verifyPayment is not implemented yet."
            );
        } catch (error: unknown) {
            next(error);
        }
    }

    /**
     * Placeholder — refund payment.
     */
    async refundPayment(
        _req: Request,
        _res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            throw new Error(
                "PaymentController.refundPayment is not implemented yet."
            );
        } catch (error: unknown) {
            next(error);
        }
    }
}
