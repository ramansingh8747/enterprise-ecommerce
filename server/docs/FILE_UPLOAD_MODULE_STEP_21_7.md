# Module 21.7 — File Upload Controller, Routes & End-to-End Testing

## Executive Summary

This document details the REST controller handlers, route mounts, authentication/RBAC authorization, validation middleware chains, and End-to-End spec test verification for **Module 21.7 — File Upload Controller, Routes & End-to-End Testing**. Mounted under `/api/v1/files`, the API exposes asset dispatches, batch uploads, replacements, metadata updates, key movements, soft/permanent deletions, and signed URL generation completely decoupled from vendor cloud SDKs.

---

## 1. REST Route Endpoint Mapping

Base URL: `/api/v1/files`

| Method | Route | Access Control | Purpose |
| :--- | :--- | :--- | :--- |
| `POST` | `/upload` | JWT, Roles (`SUPER_ADMIN`, `ADMIN`, `VENDOR`, `CUSTOMER`) | Upload single file asset. |
| `POST` | `/upload/multiple` | JWT, Roles (`SUPER_ADMIN`, `ADMIN`, `VENDOR`, `CUSTOMER`) | Batch upload multiple files. |
| `PUT` | `/:id/replace` | JWT, Roles (`SUPER_ADMIN`, `ADMIN`, `VENDOR`, `CUSTOMER`) | Replace existing file asset. |
| `PATCH` | `/:id/metadata` | JWT, Roles (`SUPER_ADMIN`, `ADMIN`, `VENDOR`, `CUSTOMER`) | Update tags, visibility, category, metadata. |
| `PATCH` | `/:id/move` | JWT, Roles (`SUPER_ADMIN`, `ADMIN`) | Move file asset to new key directory. |
| `POST` | `/:id/copy` | JWT, Roles (`SUPER_ADMIN`, `ADMIN`) | Copy file asset to new destination key. |
| `DELETE`| `/:id` | JWT, Roles (`SUPER_ADMIN`, `ADMIN`, `VENDOR`, `CUSTOMER`) | Soft delete or permanent delete (`?permanent=true`). |
| `PATCH` | `/:id/restore` | JWT, Roles (`SUPER_ADMIN`, `ADMIN`) | Restore soft-deleted asset. |
| `GET` | `/:id/public-url` | JWT | Resolve public URL. |
| `GET` | `/:id/signed-url` | JWT | Generate time-limited signed access URL. |
| `GET` | `/:id` | JWT | Retrieve metadata for single file by ID. |
| `GET` | `/` | JWT | List files with pagination, filtering, and sorting. |

---

## 2. Controller Architecture (`FileController`)

Location: `src/modules/file/controllers/file.controller.ts`

```typescript
export class FileController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  uploadSingleFile = async (req: Request, res: Response, next: NextFunction): Promise<void>;
  uploadMultipleFiles = async (req: Request, res: Response, next: NextFunction): Promise<void>;
  replaceFile = async (req: Request, res: Response, next: NextFunction): Promise<void>;
  getFileById = async (req: Request, res: Response, next: NextFunction): Promise<void>;
  listFiles = async (req: Request, res: Response, next: NextFunction): Promise<void>;
  updateFileMetadata = async (req: Request, res: Response, next: NextFunction): Promise<void>;
  moveFile = async (req: Request, res: Response, next: NextFunction): Promise<void>;
  copyFile = async (req: Request, res: Response, next: NextFunction): Promise<void>;
  deleteFile = async (req: Request, res: Response, next: NextFunction): Promise<void>;
  restoreFile = async (req: Request, res: Response, next: NextFunction): Promise<void>;
  generateSignedUrl = async (req: Request, res: Response, next: NextFunction): Promise<void>;
  getPublicUrl = async (req: Request, res: Response, next: NextFunction): Promise<void>;
}
```

---

## 3. End-to-End Spec Testing Script

Location: `src/modules/file/test/file-upload.e2e.spec.ts`

Tests the full upload pipeline:
1. **Single File Upload:** Uploads dummy buffer to `products/banners` folder via `FileUploadService`.
2. **Metadata Lookup:** Verifies database document creation and ID retrieval.
3. **Public & Signed URLs:** Resolves CDN public path and 30-minute signed token URL.
4. **Metadata Updates:** Updates tags and visibility level to `PRIVATE`.
5. **Soft Delete & Restoration:** Executes soft deletion and restores asset document state.

---

## 4. Verification & Production Checklist

* **TypeScript Compilation (`npx tsc --noEmit`):** ✅ Clean (0 Errors)
* **Express App Mounting:** `app.use('/api/v1/files', fileRoutes)` & `app.use('/uploads', express.static(...))` configured in `src/app.ts`.
* **Central Container Singletons:** `fileController` and `fileUploadService` registered in `src/container/index.ts`.
* **Files Delivered:**
  * `src/modules/file/controllers/file.controller.ts`
  * `src/modules/file/routes/file.routes.ts`
  * `src/container/index.ts`
  * `src/app.ts`
  * `src/modules/file/test/file-upload.e2e.spec.ts`
  * `src/modules/file/index.ts`
  * `docs/FILE_UPLOAD_MODULE_STEP_21_7.md`
