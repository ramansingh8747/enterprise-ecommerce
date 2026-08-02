# Module 21.5 — Local Storage Provider Implementation

## Executive Summary

This document details the concrete implementation of **Module 21.5 — Local Storage Provider Implementation**. Implemented as `LocalStorageProvider`, this strategy adapter satisfies the `IStorageProvider` interface using asynchronous Node.js filesystem APIs (`fs/promises`, `path`, `crypto`). It features secure path resolution, directory traversal defenses, SHA-256 checksum generation, automatic subfolder provisioning, and central DI registration in `src/container/index.ts`.

---

## 1. Local Storage Provider Architecture

Location: `src/modules/file/providers/local.provider.ts`

```typescript
export class LocalStorageProvider implements IStorageProvider {
  readonly providerType = StorageProviderType.LOCAL;

  constructor(baseUploadDir?: string) {}

  async upload(file: Buffer | Uint8Array, metadata: Partial<IFileMetadata>): Promise<IFileMetadata>;
  async delete(pathOrKey: string): Promise<boolean>;
  async exists(pathOrKey: string): Promise<boolean>;
  async copy(sourceKey: string, destKey: string): Promise<boolean>;
  async move(sourceKey: string, destKey: string): Promise<boolean>;
  async getMetadata(pathOrKey: string): Promise<IFileMetadata | null>;
  async getSignedUrl(pathOrKey: string, expiresInSeconds: number): Promise<string>;
  async createDirectory(folderPath: string): Promise<string>;
  async deleteDirectory(folderPath: string): Promise<boolean>;
}
```

---

## 2. Filesystem Security & Traversal Defenses

Location: `src/modules/file/utils/fs.utils.ts`

* **Path Normalization:** Sanitizes incoming relative keys, replacing `\` separators and rejecting `..` traversal sequences (`FsUtils.sanitizeRelativePath`).
* **Root Lockout:** Resolves absolute target paths and verifies `resolvedPath.startsWith(rootUploadDir)` prior to read, write, copy, move, or delete operations (`FsUtils.resolveSecurePath`).
* **SHA-256 Checksum:** Computes hex hashes (`crypto.createHash('sha256')`) for stored file verification.
* **Recursive Provisioning:** Creates missing sub-directories (`uploads/products`, `uploads/brands`, `uploads/users`, `uploads/invoices`) automatically.

---

## 3. Central DI Container Registration

Location: `src/container/index.ts`

```typescript
export const localStorageProvider = new LocalStorageProvider();
export const storageProviderFactory = new StorageProviderFactory(StorageProviderType.LOCAL);
export const namingStrategy = new NamingStrategy();

// Register LocalStorageProvider strategy in Abstract Storage Factory
storageProviderFactory.registerProvider(localStorageProvider);

export const fileService = new FileService(storageProviderFactory, namingStrategy);
```

---

## 4. Verification

* **TypeScript Compilation (`npx tsc --noEmit`):** ✅ Clean (0 Errors)
* **Files Delivered:**
  * `src/modules/file/utils/fs.utils.ts`
  * `src/modules/file/providers/local.provider.ts`
  * `src/container/index.ts`
  * `src/modules/file/index.ts`
  * `docs/FILE_UPLOAD_MODULE_STEP_21_5.md`
