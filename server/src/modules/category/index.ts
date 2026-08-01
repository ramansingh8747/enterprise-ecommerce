/**
 * Enterprise Category Module public barrel.
 *
 * Re-exports Category module foundations for composition roots
 * and cross-module imports without deep relative paths.
 */

export * from "./interfaces/category.interface";
export * from "./dto/create-category.dto";
export * from "./dto/update-category.dto";
export * from "./constants/category.constants";
export * from "./helpers/category.helper";
export * from "./category.validation";
export * from "./category.repository";
export * from "./category.service";
export * from "./category.controller";

export { default as categoryRoutes } from "./category.routes";
