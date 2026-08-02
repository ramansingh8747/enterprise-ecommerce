/**
 * Enterprise Inventory Module public barrel (Steps 14.1–14.7).
 *
 * Re-exports architecture foundations + Inventory schemas.
 * No HTTP mount yet.
 */

export * from "./types/inventory.types";
export * from "./constants/inventory.constants";
export * from "./constants/warehouse.constants";
export * from "./interfaces/inventory.interface";
export * from "./interfaces/warehouse.interface";
export * from "./interfaces/stock-movement.interface";
export * from "./interfaces/stock-adjustment.interface";
export * from "./interfaces/stock-reservation.interface";
export * from "./interfaces/low-stock-alert.interface";
export * from "./validations/inventory.validation";
export * from "./repositories/inventory.repository";
export * from "./services/inventory.service";
export * from "./controllers/inventory.controller";
export * from "./models/inventory.model";
export * from "./models/stock-movement.model";
export * from "./models/stock-reservation.model";
export * from "./models/low-stock-alert.model";

export { default as inventoryRoutes } from "./routes/inventory.routes";
export {
    inventoryRepository,
    inventoryService,
    inventoryController,
} from "./routes/inventory.routes";
