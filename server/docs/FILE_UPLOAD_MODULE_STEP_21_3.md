# Module 21.3 — File Upload DTOs, Validation & Constants

## Executive Summary

This document details the validation layer, DTO interfaces, custom validation helper utilities, configuration constants, and express-validator middleware chains for **Module 21.3 — File Upload DTOs, Validation & Constants**. Built using Clean Architecture and SOLID principles, this framework provides strict payload sanitization, extension/MIME type boundary checks, and reusable custom validators across all application file operations without embedding controller or storage implementation code.

---

## 1. DTO Specifications & Utility Types

Location: `src/modules/file/dto/file.dto.ts` & `src/modules/file/types/file-utility.types.ts`

* **`UploadFileDto`:** Payload specification for uploading new asset metadata (`category`, `visibility`, `folder`, `tags`, `ownerType`, `ownerId`, `provider`, `namingStrategy`, `customPrefix`, `overwrite`, `metadata`).
* **`ReplaceFileDto`:** Payload specification for replacing an existing asset.
* **`UpdateFileMetadataDto`:** Payload specification for updating metadata (`tags`, `visibility`, `category`, `metadata`, `ownerType`, `ownerId`).
* **`MoveFileDto` & `CopyFileDto`:** Asset key manipulation specifications.
* **`GenerateSignedUrlDto`:** Time-limited private access URL parameters.
* **`ListFilesQueryDto`:** Paginated, filtered, sorted asset query specification.

---

## 2. Configuration & Extension Constants

Location: `src/modules/file/constants/file.constants.ts`

* **Extension Sets:** `IMAGE_EXTENSIONS`, `DOCUMENT_EXTENSIONS`, `VIDEO_EXTENSIONS`, `AUDIO_EXTENSIONS`, `ARCHIVE_EXTENSIONS`.
* **MIME Lists:** `ALLOWED_IMAGE_MIME_TYPES`, `ALLOWED_DOCUMENT_MIME_TYPES`, `ALLOWED_VIDEO_MIME_TYPES`, `ALLOWED_AUDIO_MIME_TYPES`, `ALLOWED_ARCHIVE_MIME_TYPES`, `ALLOWED_UPLOAD_MIME_TYPES`.
* **Size & Limit Boundaries:**
  * `maxFileSizeBytes`: 50MB
  * `maxImageSizeBytes`: 10MB
  * `maxDocumentSizeBytes`: 25MB
  * `maxVideoSizeBytes`: 100MB
  * `MAX_FILENAME_LENGTH`: 255 chars
  * `MAX_TAGS_PER_FILE`: 20 tags
* **Folder Defaults (`DEFAULT_UPLOAD_FOLDERS`):** `products`, `categories`, `brands`, `users/avatars`, `vendors/documents`, `invoices`, `orders/attachments`, `returns`, `system`.

---

## 3. Reusable Custom Validators (`CustomFileValidators`)

Location: `src/modules/file/validators/custom-file.validators.ts`

```typescript
export class CustomFileValidators {
  static isAllowedMimeType(mimeType: string): boolean;
  static isAllowedExtension(extension: string): boolean;
  static isSafeFilename(filename: string): boolean;
  static isValidFolderPath(folderPath: string): boolean;
  static isValidOwnerReference(ownerType: string, ownerId: string): boolean;
}
```

---

## 4. Express Middleware Validation Chains (`file.validation.ts`)

Location: `src/modules/file/validations/file.validation.ts`

| Validation Chain | Target Inputs | Enforced Rules |
| :--- | :--- | :--- |
| `uploadFileValidation` | `body('category')`, `body('visibility')`, `body('folder')`, `body('tags')`, `body('ownerType')`, `body('ownerId')` | `category` required enum, `folder` max 200 chars, `tags` max 20 array items, `ownerId` valid MongoId. |
| `replaceFileValidation` | `param('id')`, `body('category')` | `id` valid MongoId, `category` valid enum. |
| `getFileByIdValidation` | `param('id')` | Valid MongoId. |
| `deleteFileValidation` | `param('id')` | Valid MongoId. |
| `restoreFileValidation` | `param('id')` | Valid MongoId. |
| `updateFileMetadataValidation` | `param('id')`, `body('visibility')`, `body('tags')` | Valid MongoId, max 20 tags. |
| `moveFileValidation` & `copyFileValidation` | `body('sourceKey')`, `body('destKey')` | Non-empty string keys. |
| `generateSignedUrlValidation` | `query('expiresInSeconds')` | Integer between 1 and 604800 seconds (7 days). |
| `listFilesQueryValidation` | Query parameters | Validates pagination bounds (page $\ge 1$, limit 1–100), filter enums, and sort orders. |

---

## 5. Verification

* **TypeScript Compilation (`npx tsc --noEmit`):** ✅ Clean (0 Errors)
* **Files Delivered:**
  * `src/modules/file/constants/file.constants.ts`
  * `src/modules/file/types/file-utility.types.ts`
  * `src/modules/file/validators/custom-file.validators.ts`
  * `src/modules/file/dto/file.dto.ts`
  * `src/modules/file/validations/file.validation.ts`
  * `src/modules/file/index.ts`
  * `docs/FILE_UPLOAD_MODULE_STEP_21_3.md`
