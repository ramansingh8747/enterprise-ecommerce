import { IStorageProvider } from '../interfaces/storage-provider.interface';
import { StorageProviderType, FileVisibility, FileCategory } from '../types/file.types';
import { IFileMetadata } from '../interfaces/file-metadata.interface';
import { StorageError } from '../errors/file.errors';
import { fileStorageConfig } from '../config/file.config';
import { FsUtils } from '../utils/fs.utils';
import fs from 'fs/promises';
import path from 'path';

/**
 * Production-Ready Local Disk Storage Provider (Module 21.5).
 * 
 * Implements IStorageProvider strategy interface for local environment asset persistence.
 * Uses asynchronous Node.js fs/promises APIs with secure path normalization and directory traversal defense.
 */
export class LocalStorageProvider implements IStorageProvider {
  readonly providerType = StorageProviderType.LOCAL;
  private readonly rootUploadDir: string;

  constructor(baseUploadDir?: string) {
    this.rootUploadDir = path.resolve(
      baseUploadDir || fileStorageConfig.providers.localStoragePath || './uploads'
    );
  }

  /**
   * Helper: Resolves relative path securely to absolute path inside rootUploadDir.
   */
  private resolvePath(relativePath: string): string {
    return FsUtils.resolveSecurePath(this.rootUploadDir, relativePath);
  }

  /**
   * Helper: Generates relative key from absolute path.
   */
  private getRelativeKey(absolutePath: string): string {
    return path.relative(this.rootUploadDir, absolutePath).replace(/\\/g, '/');
  }

  /**
   * Creates directory recursively if it does not exist.
   */
  async createDirectory(folderPath: string): Promise<string> {
    const targetDir = this.resolvePath(folderPath);
    await FsUtils.ensureDirExists(targetDir);
    return this.getRelativeKey(targetDir);
  }

  /**
   * Removes directory and its contents recursively.
   */
  async deleteDirectory(folderPath: string): Promise<boolean> {
    try {
      const targetDir = this.resolvePath(folderPath);
      await fs.rm(targetDir, { recursive: true, force: true });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Uploads file buffer data to local disk storage.
   */
  async upload(
    file: Buffer | Uint8Array,
    metadata: Partial<IFileMetadata>
  ): Promise<IFileMetadata> {
    if (!file || file.length === 0) {
      throw new StorageError('Cannot upload empty file buffer');
    }

    const folder = metadata.folder || 'general';
    const filename = metadata.filename || `file-${Date.now()}.bin`;
    const relativeFilePath = path.join(folder, filename);
    const targetFilePath = this.resolvePath(relativeFilePath);
    const targetDir = path.dirname(targetFilePath);

    await FsUtils.ensureDirExists(targetDir);

    // Overwrite check
    const fileExists = await this.exists(relativeFilePath);
    if (fileExists && !metadata.overwrite && !fileStorageConfig.overwritePolicy) {
      throw new StorageError(
        `File '${relativeFilePath}' already exists and overwrite policy is disabled`
      );
    }

    const buffer = Buffer.isBuffer(file) ? file : Buffer.from(file);
    await fs.writeFile(targetFilePath, buffer);

    const checksum = FsUtils.calculateChecksum(buffer);
    const ext = path.extname(filename).replace('.', '').toLowerCase();
    const relativeKey = this.getRelativeKey(targetFilePath);

    return {
      filename,
      originalFilename: metadata.originalFilename || filename,
      storedFilename: filename,
      extension: ext,
      mimeType: metadata.mimeType || 'application/octet-stream',
      size: buffer.length,
      checksum,
      category: metadata.category || FileCategory.SYSTEM,
      uploadedBy: metadata.uploadedBy,
      uploadedAt: new Date(),
      provider: this.providerType,
      folder,
      visibility: metadata.visibility || FileVisibility.PUBLIC,
      url: `/uploads/${relativeKey}`,
    };
  }

  /**
   * Deletes an asset file from local disk.
   */
  async delete(pathOrKey: string): Promise<boolean> {
    try {
      const targetPath = this.resolvePath(pathOrKey);
      await fs.unlink(targetPath);
      return true;
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        return false;
      }
      throw new StorageError(`Failed to delete local file '${pathOrKey}': ${error.message}`);
    }
  }

  /**
   * Checks if file exists on local disk.
   */
  async exists(pathOrKey: string): Promise<boolean> {
    try {
      const targetPath = this.resolvePath(pathOrKey);
      const stat = await fs.stat(targetPath);
      return stat.isFile();
    } catch {
      return false;
    }
  }

  /**
   * Copies file from source path to destination path.
   */
  async copy(sourceKey: string, destKey: string): Promise<boolean> {
    try {
      const srcPath = this.resolvePath(sourceKey);
      const destPath = this.resolvePath(destKey);

      await FsUtils.ensureDirExists(path.dirname(destPath));
      await fs.copyFile(srcPath, destPath);
      return true;
    } catch (error: any) {
      throw new StorageError(`Failed to copy file from '${sourceKey}' to '${destKey}': ${error.message}`);
    }
  }

  /**
   * Moves/renames file from source path to destination path.
   */
  async move(sourceKey: string, destKey: string): Promise<boolean> {
    try {
      const srcPath = this.resolvePath(sourceKey);
      const destPath = this.resolvePath(destKey);

      await FsUtils.ensureDirExists(path.dirname(destPath));
      await fs.rename(srcPath, destPath);
      return true;
    } catch (error: any) {
      throw new StorageError(`Failed to move file from '${sourceKey}' to '${destKey}': ${error.message}`);
    }
  }

  /**
   * Retrieves asset file metadata from local disk.
   */
  async getMetadata(pathOrKey: string): Promise<IFileMetadata | null> {
    try {
      const targetPath = this.resolvePath(pathOrKey);
      const stat = await fs.stat(targetPath);
      if (!stat.isFile()) return null;

      const filename = path.basename(targetPath);
      const ext = path.extname(filename).replace('.', '').toLowerCase();
      const relativeKey = this.getRelativeKey(targetPath);

      return {
        filename,
        originalFilename: filename,
        storedFilename: filename,
        extension: ext,
        mimeType: 'application/octet-stream',
        size: stat.size,
        category: FileCategory.SYSTEM,
        uploadedAt: stat.birthtime || stat.mtime,
        provider: this.providerType,
        folder: path.dirname(relativeKey),
        visibility: FileVisibility.PUBLIC,
        url: `/uploads/${relativeKey}`,
      };
    } catch {
      return null;
    }
  }

  /**
   * Generates local signed URL token parameter for private asset access.
   */
  async getSignedUrl(pathOrKey: string, expiresInSeconds: number): Promise<string> {
    const expiresAt = Math.floor(Date.now() / 1000) + expiresInSeconds;
    const relativeKey = FsUtils.sanitizeRelativePath(pathOrKey);
    return `/uploads/${relativeKey}?expires=${expiresAt}&sig=local-token`;
  }
}
