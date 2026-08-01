/**
 * Enterprise Product Variant Module public barrel.
 *
 * Re-exports Variant module foundations for composition roots
 * and cross-module imports without deep relative paths.
 */

export * from "./variant.interface";
export * from "./variant.constants";
export * from "./dto/create-variant.dto";
export * from "./dto/update-variant.dto";
export * from "./variant.validation";
export * from "./variant.repository";
export * from "./variant.service";
export * from "./variant.controller";
export * from "./models/variant.model";
export * from "./utils/sku-generator";
export * from "./utils/variant-pricing";
export * from "./utils/variant-inventory";

export { default as variantRoutes, productVariantRoutes } from "./variant.routes";
export {
    variantRepository,
    variantService,
    variantController,
} from "./variant.routes";
