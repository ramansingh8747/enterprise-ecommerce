# Module 21.1 — File Upload & Document Management Architecture

## Executive Summary

This document details the provider-agnostic architecture, interfaces, strategy abstractions, and configuration structure for **Module 21.1 — File Upload & Document Management Architecture**. Built using Clean Architecture and SOLID principles, this infrastructure serves as a universal file and document management framework supporting every application upload domain (Product Images, Brand Logos, Category Media, User Avatars, Vendor Documents, Return Attachments, Invoices) across multiple storage backends (Local Disk, Cloudinary, AWS S3, Azure Blob, Google Cloud Storage, Mock) without leaking vendor drivers into domain business services.

---

## 1. Folder Structure & Responsibilities

Location: `src/modules/file/`

```
server/src/modules/file/
├── types/
│   └── file.types.ts                # StorageProviderType, FileVisibility, NamingStrategyType, FileCategory
├── constants/
│   └── file.constants.ts            # ALLOWED_IMAGE_MIME_TYPES, ALLOWED_DOCUMENT_MIME_TYPES, FILE_LIMITS
├── config/
│   └── file.config.ts               # IFileStorageConfig, IProviderConfig
├── errors/
│   └── file.errors.ts               # StorageError, UploadError, DeleteError, FileValidationError, ProviderUnavailableError
├── interfaces/
│   ├── file-metadata.interface.ts   # IFileMetadata model
│   ├── storage-provider.interface.ts# IStorageProvider Strategy contract
│   ├── storage-factory.interface.ts # IStorageProviderFactory Abstract Factory contract
│   ├── naming-strategy.interface.ts # INamingStrategy contract
│   └── file-service.interface.ts    # IFileService application boundary contract
├── strategies/
│   └── naming.strategy.ts           # NamingStrategy implementation (UUID, Timestamp, Hash, Original, Custom)
├── factories/
│   └── storage.factory.ts           # StorageProviderFactory runtime strategy resolver
├── providers/
│   ├── local.provider.ts            # LocalStorageProvider placeholder
│   ├── cloudinary.provider.ts       # CloudinaryStorageProvider placeholder
│   ├── s3.provider.ts               # AwsS3StorageProvider placeholder
│   ├── azure.provider.ts            # AzureBlobStorageProvider placeholder
│   ├── gcs.provider.ts              # GcsStorageProvider placeholder
│   └── mock.provider.ts             # MockStorageProvider test implementation
├── services/
│   └── file.service.ts              # FileService orchestrator
└── index.ts                         # Barrel exports
```

---

## 2. Storage Provider Abstraction (`IStorageProvider`)

Location: `src/modules/file/interfaces/storage-provider.interface.ts`

```typescript
export interface IStorageProvider {
  readonly providerType: StorageProviderType;
  upload(file: Buffer | Uint8Array, metadata: Partial<IFileMetadata>): Promise<IFileMetadata>;
  delete(pathOrKey: string): Promise<boolean>;
  exists(pathOrKey: string): Promise<boolean>;
  copy(sourceKey: string, destKey: string): Promise<boolean>;
  move(sourceKey: string, destKey: string): Promise<boolean>;
  getMetadata(pathOrKey: string): Promise<IFileMetadata | null>;
  getSignedUrl(pathOrKey: string, expiresInSeconds: number): Promise<string>;
}
```

---

## 3. Universal File Metadata Model (`IFileMetadata`)

Location: `src/modules/file/interfaces/file-metadata.interface.ts`

```typescript
export interface IFileMetadata {
  filename: string;
  originalFilename: string;
  mimeType: string;
  extension: string;
  size: number;
  checksum?: string;
  width?: number;
  height?: number;
  category: FileCategory;
  uploadedBy?: string;
  uploadedAt: Date;
  provider: StorageProviderType;
  bucket?: string;
  folder?: string;
  visibility: FileVisibility;
  url?: string;
}
```

---

## 4. File Service Architecture (`FileService`)

Location: `src/modules/file/services/file.service.ts`

```typescript
export class FileService implements IFileService {
  constructor(
    private readonly providerFactory: IStorageProviderFactory,
    private readonly namingStrategy: INamingStrategy
  ) {}

  async uploadFile(file: Buffer, options: IFileUploadOptions): Promise<IFileMetadata>;
  async deleteFile(pathOrKey: string, providerType?: StorageProviderType): Promise<boolean>;
  async replaceFile(oldPathOrKey: string, newFile: Buffer, options: IFileUploadOptions): Promise<IFileMetadata>;
  async getSignedUrl(pathOrKey: string, expiresInSeconds?: number, providerType?: StorageProviderType): Promise<string>;
  async fileExists(pathOrKey: string, providerType?: StorageProviderType): Promise<boolean>;
}
```

---

## 5. Dependency Graph & DI Flow

```mermaid
graph TD
    DomainCaller[Product / User / Order Modules] -->|Invokes| FileService[FileService Orchestrator]
    FileService -->|Uses| NamingStrategy[INamingStrategy / NamingStrategy]
    FileService -->|Resolves Provider via| StorageFactory[IStorageProviderFactory / StorageProviderFactory]
    StorageFactory -->|Returns Strategy| StrategyContract[IStorageProvider]
    StrategyContract <|.. LocalProvider[LocalStorageProvider]
    StrategyContract <|.. CloudinaryProvider[CloudinaryStorageProvider]
    StrategyContract <|.. S3Provider[AwsS3StorageProvider]
    StrategyContract <|.. AzureProvider[AzureBlobStorageProvider]
    StrategyContract <|.. GcsProvider[GcsStorageProvider]
    StrategyContract <|.. MockProvider[MockStorageProvider]
```

---

## 6. SOLID Principles & Enterprise Design

1. **Single Responsibility Principle (SRP):**
   * `NamingStrategy` handles filename key generation and sanitization.
   * `StorageProviderFactory` manages runtime strategy lookups.
   * Concrete `IStorageProvider` classes handle vendor-specific storage APIs.
   * `FileService` orchestrates validation, naming, replacement, and provider delegation.
2. **Open/Closed Principle (OCP):** Adding support for new storage vendors (e.g. Backblaze B2, MinIO) involves creating a class implementing `IStorageProvider` and registering it in `StorageProviderFactory` without modifying `FileService` or business callers.
3. **Dependency Inversion Principle (DIP):** High-level application modules depend on interfaces (`IFileService`, `IStorageProvider`, `INamingStrategy`), never concrete storage classes.

---

## 7. Verification

* **TypeScript Compilation (`npx tsc --noEmit`):** ✅ Clean (0 Errors)
* **Files Delivered:**
  * `src/modules/file/types/file.types.ts`
  * `src/modules/file/constants/file.constants.ts`
  * `src/modules/file/config/file.config.ts`
  * `src/modules/file/errors/file.errors.ts`
  * `src/modules/file/interfaces/file-metadata.interface.ts`
  * `src/modules/file/interfaces/storage-provider.interface.ts`
  * `src/modules/file/interfaces/storage-factory.interface.ts`
  * `src/modules/file/interfaces/naming-strategy.interface.ts`
  * `src/modules/file/interfaces/file-service.interface.ts`
  * `src/modules/file/strategies/naming.strategy.ts`
  * `src/modules/file/factories/storage.factory.ts`
  * `src/modules/file/providers/local.provider.ts`
  * `src/modules/file/providers/cloudinary.provider.ts`
  * `src/modules/file/providers/s3.provider.ts`
  * `src/modules/file/providers/azure.provider.ts`
  * `src/modules/file/providers/gcs.provider.ts`
  * `src/modules/file/providers/mock.provider.ts`
  * `src/modules/file/services/file.service.ts`
  * `src/modules/file/index.ts`
  * `docs/FILE_UPLOAD_MODULE_STEP_21_1.md`
