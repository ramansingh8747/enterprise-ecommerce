import { Router } from "express";
import { PaymentController } from "../controllers/payment.controller";
import { PaymentRepository } from "../repositories/payment.repository";
import { PaymentService } from "../services/payment.service";

/**
 * Enterprise Payment Routes — composition root (Step 15.6).
 *
 * Empty router: no HTTP endpoints yet.
 * Not mounted in app.ts (same approach as Order Step 15.1).
 */

const paymentRepository = new PaymentRepository();
const paymentService = new PaymentService(paymentRepository);
const paymentController = new PaymentController(paymentService);

const router = Router();

// Endpoints deferred to a later Payment API step.
void paymentController;

export default router;
export { paymentRepository, paymentService, paymentController };
