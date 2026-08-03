import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../../../middleware/auth.middleware';
import { authorize, ROLES } from '../../../middleware/role.middleware';
import { paymentController } from '../../../container';
import {
  createPaymentValidation,
  capturePaymentValidation,
  refundPaymentValidation,
  cancelPaymentValidation,
  getPaymentsValidation,
  paymentIdParamValidation,
} from '../validators/payment.validator';

/**
 * Enterprise Payment Gateway REST Router (Module 27.5).
 *
 * Route wiring layer for protected Payment endpoints.
 * All endpoints require JWT authentication and role authorization.
 *
 * Mounted at: /api/v1/payments
 */
const paymentRouter = Router();

/**
 * POST /api/v1/payments
 * Initiates a new payment transaction.
 */
paymentRouter.post(
  '/',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.CUSTOMER),
  ...createPaymentValidation,
  (req: Request, res: Response, next: NextFunction): void => {
    paymentController.createPayment(req, res, next);
  }
);

/**
 * POST /api/v1/payments/capture
 * Captures an authorized payment transaction.
 */
paymentRouter.post(
  '/capture',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  ...capturePaymentValidation,
  (req: Request, res: Response, next: NextFunction): void => {
    paymentController.capturePayment(req, res, next);
  }
);

/**
 * POST /api/v1/payments/refund
 * Processes a full or partial payment refund.
 */
paymentRouter.post(
  '/refund',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  ...refundPaymentValidation,
  (req: Request, res: Response, next: NextFunction): void => {
    paymentController.refundPayment(req, res, next);
  }
);

/**
 * POST /api/v1/payments/cancel
 * Cancels a pending or authorized payment transaction.
 */
paymentRouter.post(
  '/cancel',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.CUSTOMER),
  ...cancelPaymentValidation,
  (req: Request, res: Response, next: NextFunction): void => {
    paymentController.cancelPayment(req, res, next);
  }
);

/**
 * GET /api/v1/payments
 * Retrieves paginated payment transactions matching filters.
 */
paymentRouter.get(
  '/',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  ...getPaymentsValidation,
  (req: Request, res: Response, next: NextFunction): void => {
    paymentController.getPayments(req, res, next);
  }
);

/**
 * GET /api/v1/payments/statistics
 * Returns aggregate payment statistics metrics.
 */
paymentRouter.get(
  '/statistics',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  (req: Request, res: Response, next: NextFunction): void => {
    paymentController.getStatistics(req, res, next);
  }
);

/**
 * GET /api/v1/payments/:id
 * Retrieves a single payment record by system paymentId or ID.
 */
paymentRouter.get(
  '/:id',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.CUSTOMER),
  ...paymentIdParamValidation,
  (req: Request, res: Response, next: NextFunction): void => {
    paymentController.getPaymentById(req, res, next);
  }
);

export default paymentRouter;
