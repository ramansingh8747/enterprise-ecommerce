/**
 * Enterprise Media Module public barrel.
 *
 * Re-exports Media foundations + upload infrastructure (Step 13.2).
 * No HTTP mount yet — routes remain unregistered in app.ts.
 */

export * from "./types/media.types";
export * from "./media.constants";
export * from "./interfaces/media.interface";
export * from "./interfaces/storage-provider.interface";
export * from "./interfaces/upload-request.interface";
export * from "./interfaces/media-upload-result.interface";
export * from "./interfaces/media-validation-result.interface";
export * from "./interfaces/product-media-summary.interface";
export * from "./dtos/create-media.dto";
export * from "./dtos/update-media.dto";
export * from "./validators/media.validation";
export * from "./validators/upload.validator";
export * from "./media.upload-limits";
export * from "./repositories/media.repository";
export * from "./services/media.service";
export * from "./services/cloudinary.service";
export * from "./controllers/media.controller";
export * from "./models/media.model";
export * from "./providers/storage.provider";
export * from "./providers/cloudinary.provider";
export * from "./middleware/multer.middleware";

export { default as mediaRoutes } from "./routes/media.routes";
export {
    mediaRepository,
    mediaService,
    mediaController,
    productMediaRoutes,
} from "./routes/media.routes";
