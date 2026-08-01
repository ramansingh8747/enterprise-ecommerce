/**
 * Enterprise Brand Module public barrel.
 *
 * Re-exports Brand module foundations for composition roots
 * and cross-module imports without deep relative paths.
 */

export * from "./brand.interface";
export * from "./brand.constants";
export * from "./brand.validation";
export * from "./brand.repository";
export * from "./brand.service";
export * from "./brand.controller";
export * from "./models/brand.model";

export { default as brandRoutes } from "./brand.routes";
export {
    brandRepository,
    brandService,
    brandController,
} from "./brand.routes";
