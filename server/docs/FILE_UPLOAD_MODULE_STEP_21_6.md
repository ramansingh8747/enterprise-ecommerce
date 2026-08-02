# Module 21.6 — File Upload Service & Business Logic

## Executive Summary

This document details the application business service implementation for **Module 21.6 — File Upload Service & Business Logic**. Built following Clean Architecture and SOLID principles, `FileUploadService` acts as a provider-independent orchestrator handling file uploads, batch operations, safe file replacements, soft/permanent deletions, metadata updates, polymorphic owner reassignments, asset copying/moving, and signed URL generation completely decoupled from cloud storage SDKs (Cloudinary, AWS S3, Azure Blob, Google Cloud Storage).

---

## 1. Service & Repository Architecture

Location: `src/modules/file/services/file-upload.service.ts` & `src/modules/file/repositories/file.repository.ts`

```typescript
export class FileUploadService {
  constructor(
    private readonly providerFactory: IStorageProviderFactory,
    private readonly namingStrategy: INamingStrategy,
    private readonly fileRepository: IFileRepository
  ) {}

  async uploadFile(file: Express.Multer.File, dto: UploadFileDto, userId?: string): Promise<IFile>;
  async uploadMultipleFiles(files: Express.Multer.File[], dto: UploadFileDto, userId?: string): Promise<{ success: IFile[]; failed: { filename: string; error: string }[] }>;
  async replaceFile(fileId: string, newFile: Express.Multer.File, dto?: Partial<UploadFileDto>, userId?: string): Promise<IFile>;
  async deleteFile(fileId: string, permanent?: boolean, userId?: string): Promise<boolean>;
  async restoreFile(fileId: string, userId?: string): Promise<IFile>;
  async getFileById(fileId: string): Promise<IFile>;
  async listFiles(query: ListFilesQueryDto): Promise<{ files: IFile[]; total: number; page: number; limit: number; totalPages: number }>;
  async moveFile(fileId: string, dto: MoveFileDto): Promise<IFile>;
  async copyFile(fileId: string, dto: CopyFileDto): Promise<IFile>;
  async updateMetadata(fileId: string, dto: UpdateFileMetadataDto): Promise<IFile>;
  async generateSignedUrl(fileId: string, expiresInSeconds?: number): Promise<string>;
  async getPublicUrl(fileId: string): Promise<string>;
}
```

---

## 2. Upload Lifecycle & Rollback Strategy

```
1. Receive Request Payload & Validate Preconditions (Multer file buffer check)
   ↓
2. Resolve Storage Provider Strategy via Abstract Factory (IStorageProviderFactory)
   ↓
3. Generate Unique Filename Key via Naming Strategy (INamingStrategy)
   ↓
4. Physical Upload Execution via Storage Strategy (IStorageProvider.upload)
   ↓
5. Metadata Document Persistence (FileModel via FileRepository)
   └── [ROLLBACK TRIGGER]: If DB creation throws an exception after physical upload, 
       FileUploadService catches error and invokes provider.delete(storedFilename) 
       to prevent orphan physical files!
```

---

## 3. Advanced Asset Operations

1. **Batch Uploads & Partial Success (`uploadMultipleFiles`):** Processes multiple upload items concurrently/sequentially, catching individual item errors and returning `{ success: IFile[], failed: [...] }`.
2. **Safe Asset Replacement (`replaceFile`):** Uploads new replacement asset, updates database metadata, soft-deletes old record, and cleans up old physical file safely.
3. **Soft vs Permanent Delete (`deleteFile`):**
   * **Soft Delete (default):** Sets `isDeleted = true`, `deletedAt = new Date()`, `uploadStatus = UploadStatus.DELETED`.
   * **Permanent Delete (`permanent = true`):** Calls `provider.delete(storedFilename)` and hard-deletes MongoDB document.
4. **Polymorphic Metadata Updates (`updateMetadata`):** Reassigns owner entity references (`OwnerEntityType` + `entityId`), updates tags, category, and visibility levels.

---

## 4. Verification

* **TypeScript Compilation (`npx tsc --noEmit`):** ✅ Clean (0 Errors)
* **Files Delivered:**
  * `src/modules/file/interfaces/file-repository.interface.ts`
  * `src/modules/file/repositories/file.repository.ts`
  * `src/modules/file/services/file-upload.service.ts`
  * `src/container/index.ts`
  * `src/modules/file/index.ts`
  * `docs/FILE_UPLOAD_MODULE_STEP_21_6.md`
