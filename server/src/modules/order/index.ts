/**
 * Enterprise Order Module public barrel (Steps 15.1–15.3).
 *
 * Re-exports architecture foundations + Order schema + Order Item contracts.
 * No HTTP mount yet.
 */

export * from "./types/order.types";
export * from "./types/order-item.types";
export * from "./constants/order.constants";
export * from "./interfaces/order.interface";
export * from "./interfaces/order-item.interface";
export * from "./interfaces/order-repository.interface";
export * from "./interfaces/order-service.interface";
export * from "./dto/create-order.dto";
export * from "./dto/update-order.dto";
export * from "./dto/list-orders.dto";
export * from "./dto/order-report.dto";
export * from "./validations/order.validation";
export * from "./repositories/order.repository";
export * from "./services/order.service";
export * from "./controllers/order.controller";
export * from "./models/order.model";

export { default as orderRoutes } from "./routes/order.routes";
export {
    orderRepository,
    orderService,
    orderController,
} from "./routes/order.routes";
