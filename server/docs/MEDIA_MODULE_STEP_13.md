# Enterprise E-commerce — Media Module Architecture (Step 13.1)

**Module:** Product Images / Media Management  
**Status:** 13.1–13.9 ✅ · 13.10 E2E testing ✅ · **Production-ready**  
**Stack:** Node.js · Express · TypeScript · MongoDB · Mongoose · Repository → Service → Controller

---

## 1. Goals

- Support multiple product images with **display order** and **primary** selection.
- Remain storage-agnostic (Cloudinary now; AWS S3 / local later).
- Allow future resource types: **IMAGE**, **VIDEO**, **DOCUMENT**.
- Keep Product APIs backward compatible (`images: string[]`, `thumbnail?: string`).

---

## 2. Integration with Product (non-breaking)

| Layer | Approach |
|-------|----------|
| Today | Product continues to store Cloudinary URL strings |
| Media module | Owns rich media records (`productId`, order, primary, metadata) |
| Future sync | Service layer can keep Product URL fields in sync or migrate gradually |
| HTTP | Media routes **not mounted** in Step 13.1 |

Product / Category / Brand / Variant modules are **not modified** in 13.1.

---

## 3. Folder structure

```
src/modules/media/
  interfaces/          # IMedia, IStorageProvider
  types/               # enums (owner, resource, storage)
  dtos/                # create/update transport shapes
  providers/           # StorageProvider + CloudinaryProvider
  middleware/          # Multer memory storage
  repositories/        # MediaRepository (stub)
  services/            # MediaService (stub) + CloudinaryService
  controllers/         # MediaController (stub)
  routes/              # empty router + DI composition root
  validators/          # placeholder (no chains yet)
  models/              # schema placeholder
  media.constants.ts
  index.ts
```

---

## 4. Layer responsibilities

| Layer | Responsibility |
|-------|----------------|
| Repository | Persist media documents only |
| Service | Ownership rules, primary/order, storage orchestration |
| Storage port (`IStorageProvider`) | Upload/delete against Cloudinary/S3/Local |
| Controller | HTTP adapt only |
| Routes | Auth / RBAC / validation / controller wiring (later) |

---

## 5. Planned entity fields

- `ownerType`, `ownerId`
- `url`, `publicId`
- `resourceType`, `storageProvider`
- `isPrimary`, `displayOrder`
- `mimeType`, `metadata`
- audit fields + optional soft delete (`deletedAt`)

---

## 6. Step 13.2 — Upload strategy (infrastructure only)

| Piece | Location | Role |
|-------|----------|------|
| Shared Cloudinary config | `src/config/cloudinary.ts` | Env-based singleton (reused, unchanged) |
| CloudinaryService | `services/cloudinary.service.ts` | Buffer upload_stream + destroy |
| StorageProvider | `providers/storage.provider.ts` | Abstract base |
| CloudinaryProvider | `providers/cloudinary.provider.ts` | Concrete adapter |
| Multer middleware | `middleware/multer.middleware.ts` | **Memory storage only** |

Flow (future API steps): `Multer (memory)` → `MediaService` → `CloudinaryProvider` → persist Media record.

S3 / Local providers can extend `StorageProvider` without changing controllers.

### Explicitly still out of scope

- Upload API / routes mounted in `app.ts`
- Product integration / Media service persistence wiring
- Validation chains / image processing
- Delete/replace/multi-upload business flows in controllers

---

## 7. Step 13.3 — Media schema

Collection: `media` · Model: `Media`

| Field | Notes |
|-------|--------|
| `productId` | ObjectId → Product (indexed) |
| `publicId`, `url`, `secureUrl` | Storage identifiers / URLs |
| `storageProvider` | `cloudinary` \| `s3` \| `local` |
| `mediaType` | `image` \| `video` \| `document` |
| file meta | `mimeType`, `fileName`, `originalName`, `extension`, `size`, `width`, `height` |
| presentation | `altText`, `displayOrder`, `isPrimary` |
| `metadata` | Mixed |
| audit | `createdBy`, `updatedBy`, timestamps |

Indexes: `productId`, `isPrimary`, `displayOrder`, `mediaType`, `storageProvider`, plus compounds `{productId, displayOrder}`, `{productId, isPrimary}`, `{productId, mediaType}`.

---

## 8. Step 13.4 — Upload service

Flow: `Multer memory file` → `MediaService` → `IStorageProvider.upload` → map → `MediaRepository.create` → `IMediaUploadResult`.

- `uploadMedia` / `uploadManyMedia` (no primary/order business rules)
- Repository: `create`, `createMany`, `findById`, `findByProduct`, `deleteById`
- Composition root injects `cloudinaryProvider` as `IStorageProvider`

---

## 9. Step 13.5 — Image validation

Reusable validators under `validators/` (MIME, extension, size, filename, image, upload orchestrator).

- Env: `MAX_IMAGE_SIZE_MB`, `MAX_PRODUCT_IMAGES`
- Result shape: `{ success, code: MEDIA_VALIDATION_FAILED, message, details }`
- Throws `MediaValidationError` (maps to HTTP 400 via existing error middleware message rules)
- Wired into `MediaService` before `StorageProvider.upload`

---

## 10. Step 13.6 — Product ↔ Media integration

- Product schema adds `media: ObjectId[]` (ref `Media`); legacy `images` / `thumbnail` kept.
- Reads attach selective summaries via `MediaRepository.findSummariesByProduct(Ids)` (batch, no N+1).
- Response `media: [{ id, url, secureUrl, isPrimary, displayOrder, mediaType? }]`.
- Media remains asset owner (`productId`); no upload/delete APIs in this step.

---

## 11. Step 13.7 — Multiple image upload

`POST /api/v1/products/:productId/media` (JWT + ADMIN/SUPER_ADMIN)

- multipart field: `images` (1 → `MAX_PRODUCT_IMAGES`)
- Validates Product + files; uploads via `MediaService.uploadProductImages`
- `displayOrder` continues from max+1; first image is primary only if none exists
- Associates via `Product.media` `$addToSet` (no duplicate refs)
- Best-effort rollback of Media docs + storage on failure

---

## 12. Step 13.8 — Primary image management

`PATCH /api/v1/products/:productId/media/:mediaId/primary`

- Validates Product + Media ownership
- Unsets existing primary (`updateMany`), then sets target (`findByIdAndUpdate`)
- Uses a Mongo transaction when supported; sequential fallback otherwise
- Upload behavior unchanged (new uploads do not steal primary)

---

## 13. Step 13.9 — Image delete & replace

- `DELETE /api/v1/products/:productId/media/:mediaId` — storage → Media → Product `$pull` → reassign primary → resequence
- `PUT /api/v1/products/:productId/media/:mediaId` — field `image`; preserves mediaId / displayOrder / isPrimary; deletes old storage after success

---

## 14. Step 13.10 — End-to-end testing

| Artifact | Path |
|----------|------|
| API docs | `docs/MEDIA_API.md` |
| Postman | `postman/Product_Media_Module.postman_collection.json` |
| Validators E2E | `scripts/e2e-media.validators.ts` |
| Service E2E (mock storage) | `scripts/e2e-media.service.ts` |
| HTTP smoke | `scripts/e2e-media.smoke.ts` |
| Seeded runner | `scripts/run-media-e2e.ts` → `npm test` |

**Module 13 complete (13.1–13.10).**
