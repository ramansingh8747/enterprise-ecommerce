# Module 21.4 — Multer Configuration & Upload Pipeline Foundation

## Executive Summary

This document details the Multer engine configuration, reusable upload middleware builder, pre-validation filters, error interceptors, and 7-step upload pipeline orchestrator for **Module 21.4 — Multer Configuration & Upload Pipeline Foundation**. Built following Clean Architecture and SOLID principles, this framework provides a provider-independent upload foundation supporting single, array, and multi-field file dispatches with dangerous extension blacklisting, reserved filename protection, and telemetry logging hooks.

---

## 1. Upload Middleware & Pipeline Architecture

Location: `src/modules/file/`

```
server/src/modules/file/
├── config/
│   └── multer.config.ts            # MulterConfigBuilder (memory/disk storage, security filters)
├── middleware/
│   └── upload.middleware.ts        # UploadMiddleware (single, array, fields) & handleUploadError
├── pipeline/
│   └── upload.pipeline.ts          # UploadPipeline 7-step orchestrator & telemetry hooks
└── index.ts                        # Barrel exports
```

---

## 2. Multer Engine Builder (`MulterConfigBuilder`)

Location: `src/modules/file/config/multer.config.ts`

* **Storage Modes:** Supports `memoryStorage()` (default, for streaming directly to storage providers like AWS S3 or Cloudinary) and configurable `diskStorage()` (for temporary disk staging).
* **Security Pre-validation Filters:**
  1. **Dangerous Extension Check:** Rejects `.exe`, `.bat`, `.cmd`, `.sh`, `.php`, `.js`, `.vbs`, `.dll`, `.ps1`, `.scr`, `.jar`, `.py`.
  2. **Reserved Filename Check:** Rejects Windows reserved names (`CON`, `PRN`, `AUX`, `NUL`, `COM1`, `LPT1`, `CLOCK$`).
  3. **MIME & Extension Whitelists:** Validates against `ALLOWED_UPLOAD_MIME_TYPES`, `IMAGE_EXTENSIONS`, `DOCUMENT_EXTENSIONS`.

---

## 3. Reusable Middleware Builders (`UploadMiddleware`)

Location: `src/modules/file/middleware/upload.middleware.ts`

```typescript
export class UploadMiddleware {
  static single(fieldName: string, options?: IUploadMiddlewareOptions): RequestHandler;
  static array(fieldName: string, maxCount?: number, options?: IUploadMiddlewareOptions): RequestHandler;
  static fields(fields: multer.Field[], options?: IUploadMiddlewareOptions): RequestHandler;
}
```

### Error Interceptor (`handleUploadError`)
Intercepts `multer.MulterError` (`LIMIT_FILE_SIZE`, `LIMIT_FILE_COUNT`, `LIMIT_UNEXPECTED_FILE`) and `FileValidationError` instances, formatting clean 400 Bad Request `ApiResponse` payloads.

---

## 4. 7-Step Upload Pipeline Orchestration (`UploadPipeline`)

Location: `src/modules/file/pipeline/upload.pipeline.ts`

```
1. Receive Request Payload (onUploadStarted Hook)
   ↓
2. Multer Body Parsing
   ↓
3. Pre-validation Checks (onValidationCompleted Hook)
   ↓
4. Metadata Extraction (filename, ext, mimeType, size)
   ↓
5. Naming Strategy Key Generation (INamingStrategy)
   ↓
6. Storage Provider Handoff (IStorageProvider Handoff)
   ↓
7. Response Preparation (onUploadCompleted Hook)
```

---

## 5. Verification

* **TypeScript Compilation (`npx tsc --noEmit`):** ✅ Clean (0 Errors)
* **Files Delivered:**
  * `src/modules/file/config/multer.config.ts`
  * `src/modules/file/middleware/upload.middleware.ts`
  * `src/modules/file/pipeline/upload.pipeline.ts`
  * `src/modules/file/index.ts`
  * `docs/FILE_UPLOAD_MODULE_STEP_21_4.md`
