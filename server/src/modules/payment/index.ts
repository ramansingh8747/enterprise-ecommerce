/**
 * Enterprise Payment Module public barrel (Step 15.6).
 *
 * Re-exports architecture foundations only.
 * Routes are not mounted in app.ts yet.
 */

export * from "./types/payment.types";
export * from "./constants/payment.constants";
export * from "./interfaces/payment.interface";
export * from "./interfaces/payment-provider.interface";
export * from "./interfaces/payment-repository.interface";
export * from "./interfaces/payment-service.interface";
export * from "./dto/payment.dto";
export * from "./factory/payment-provider.factory";
export * from "./providers/mock.provider";
export * from "./providers/razorpay.provider";
export * from "./providers/stripe.provider";
export * from "./providers/cashfree.provider";
export * from "./validations/payment.validation";
export * from "./repositories/payment.repository";
export * from "./services/payment.service";
export * from "./controllers/payment.controller";
export * from "./models/payment.model";

export { default as paymentRoutes } from "./routes/payment.routes";
export {
    paymentRepository,
    paymentService,
    paymentController,
} from "./routes/payment.routes";
