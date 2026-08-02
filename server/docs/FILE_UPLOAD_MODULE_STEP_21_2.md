# Module 21.2 — File Upload Models & Database Schema

## Executive Summary

This document details the Mongoose document model and schema design for **Module 21.2 — File Upload Models & Database Schema**. Built to store asset metadata independently of storage drivers, `FileModel` provides a generic, enterprise-grade schema supporting polymorphic owner linking across application domains (Products, Users, Brands, Categories, Orders, Reviews, Vendor Docs), specialized image/document subdocument metadata, state machine upload lifecycles, access visibility controls, and soft-delete auditability.

---

## 1. Schema & Document Architecture

Location: `src/modules/file/models/file.model.ts`

```typescript
export interface IFile extends Document {
  _id: Types.ObjectId;
  filename: string;
  originalFilename: string;
  storedFilename: string;
  extension: string;
  mimeType: string;
  size: number;
  checksum?: string;
  category: FileCategory;
  provider: StorageProviderType;
  bucket?: string;
  folder?: string;
  url?: string;
  signedUrl?: string;
  visibility: FileVisibility;
  uploadStatus: UploadStatus;
  uploadedBy?: Types.ObjectId;
  uploadedAt: Date;
  lastAccessedAt?: Date;
  owner?: IOwnerRef;
  imageMetadata?: IImageMetadata;
  documentMetadata?: IDocumentMetadata;
  metadata?: Record<string, unknown>;
  tags?: string[];
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 2. Polymorphic Ownership & Subdocuments

### 2.1 Generic Owner Reference (`IOwnerRef`)
Allows a single file document to link dynamically to any application entity (Product, User, Brand, Category, Order, Review, Return Request) without coupling:

```typescript
export interface IOwnerRef {
  entityType: OwnerEntityType | string;
  entityId: Types.ObjectId;
}
```

### 2.2 Image Metadata Subdocument (`IImageMetadata`)
```typescript
export interface IImageMetadata {
  width?: number;
  height?: number;
  aspectRatio?: number;
  dominantColor?: string;
  blurHash?: string;
  thumbnailUrls?: Map<string, string>;
}
```

### 2.3 Document Metadata Subdocument (`IDocumentMetadata`)
```typescript
export interface IDocumentMetadata {
  pageCount?: number;
  documentType?: string;
  encryptionStatus?: string;
  previewAvailable?: boolean;
}
```

---

## 3. Enums & State Lifecycles

* **`UploadStatus`:** `PENDING`, `UPLOADING`, `COMPLETED`, `FAILED`, `DELETED`.
* **`FileVisibility`:** `PUBLIC`, `PRIVATE`, `SIGNED_URL`.
* **`StorageProviderType`:** `LOCAL`, `CLOUDINARY`, `AWS_S3`, `AZURE_BLOB`, `GCP_STORAGE`, `GCS`, `MOCK`.
* **`OwnerEntityType`:** `PRODUCT`, `USER`, `BRAND`, `CATEGORY`, `ORDER`, `REVIEW`, `RETURN_REQUEST`, `VENDOR`, `SYSTEM`.

---

## 4. Database Indexing Strategy

To maintain high query performance across millions of uploaded assets, compound and single-field indexes are configured:

| Index Target | Index Type | Purpose |
| :--- | :--- | :--- |
| `{ 'owner.entityType': 1, 'owner.entityId': 1 }` | Compound | Fast retrieval of assets attached to specific entities (e.g., all images for Product ID). |
| `{ isDeleted: 1, uploadStatus: 1, createdAt: -1 }` | Compound | Filters active completed assets sorted by creation date. |
| `{ uploadedBy: 1, isDeleted: 1, createdAt: -1 }` | Compound | User media library queries. |
| `{ category: 1, isDeleted: 1, createdAt: -1 }` | Compound | Category asset queries (e.g., invoices vs avatars). |
| `{ tags: 1 }` | Single Multikey | Tag-based media searches. |
| `{ folder: 1 }` | Single | Sub-folder directory browsing. |

---

## 5. Soft Delete Architecture

* **`isDeleted` (boolean):** Defaults to `false`. Upload API deletion marks `isDeleted = true` and records `deletedAt = new Date()`.
* **Data Retention:** Physical storage provider files are pruned by background maintenance workers without corrupting database relational integrity.

---

## 6. Verification

* **TypeScript Compilation (`npx tsc --noEmit`):** ✅ Clean (0 Errors)
* **Files Delivered:**
  * `src/modules/file/types/file.types.ts`
  * `src/modules/file/models/file.model.ts`
  * `src/modules/file/index.ts`
  * `docs/FILE_UPLOAD_MODULE_STEP_21_2.md`
