import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';
import { StorageError } from '../errors/file.errors';

/**
 * Filesystem Security & Helper Utilities (Module 21.5).
 */
export class FsUtils {
  /**
   * Sanitizes relative folder or file path to prevent directory traversal attacks.
   */
  static sanitizeRelativePath(relativePath: string): string {
    if (!relativePath) return '';
    const normalized = path.normalize(relativePath).replace(/^(\.\.[\/\\])+/, '');
    if (normalized.includes('..')) {
      throw new StorageError(`Security Warning: Invalid path containing '..' traversal sequence: '${relativePath}'`);
    }
    return normalized.replace(/\\/g, '/').replace(/^\/+/, '');
  }

  /**
   * Resolves absolute path and verifies it remains strictly inside base upload directory.
   */
  static resolveSecurePath(baseDir: string, relativePath: string): string {
    const rootDir = path.resolve(baseDir);
    const sanitized = this.sanitizeRelativePath(relativePath);
    const resolved = path.resolve(rootDir, sanitized);

    if (!resolved.startsWith(rootDir)) {
      throw new StorageError(`Security Warning: Attempted path traversal out of storage root '${resolved}'`);
    }
    return resolved;
  }

  /**
   * Calculates SHA-256 checksum hex string for a buffer.
   */
  static calculateChecksum(buffer: Buffer | Uint8Array): string {
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }

  /**
   * Ensures target directory exists recursively.
   */
  static async ensureDirExists(dirPath: string): Promise<void> {
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch (error: any) {
      throw new StorageError(`Failed to create directory '${dirPath}': ${error.message}`);
    }
  }
}
