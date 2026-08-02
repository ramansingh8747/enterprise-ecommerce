import { ALLOWED_UPLOAD_MIME_TYPES, MAX_FILENAME_LENGTH, MAX_FOLDER_PATH_LENGTH } from '../constants/file.constants';
import { OwnerEntityType } from '../types/file.types';
import path from 'path';

/**
 * Reusable Custom File Validator Utilities (Module 21.3).
 * Transport-independent and reusable across modules.
 */
export class CustomFileValidators {
  /**
   * Validates if a MIME type string is in the system allowed list.
   */
  static isAllowedMimeType(mimeType: string): boolean {
    if (!mimeType || typeof mimeType !== 'string') return false;
    return ALLOWED_UPLOAD_MIME_TYPES.includes(mimeType.toLowerCase().trim());
  }

  /**
   * Validates if an extension is allowed (e.g. '.png', '.pdf').
   */
  static isAllowedExtension(extension: string): boolean {
    if (!extension || typeof extension !== 'string') return false;
    const formattedExt = extension.startsWith('.') ? extension.toLowerCase() : `.${extension.toLowerCase()}`;
    return [
      '.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg',
      '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.csv', '.txt',
      '.mp4', '.webm', '.mov', '.avi', '.mp3', '.wav', '.ogg', '.zip'
    ].includes(formattedExt);
  }

  /**
   * Asserts filename is safe and does not contain directory traversal attempts.
   */
  static isSafeFilename(filename: string): boolean {
    if (!filename || typeof filename !== 'string') return false;
    if (filename.length > MAX_FILENAME_LENGTH) return false;
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) return false;
    return /^[a-zA-Z0-9._-]+$/.test(filename);
  }

  /**
   * Validates folder path formatting and length.
   */
  static isValidFolderPath(folderPath: string): boolean {
    if (!folderPath || typeof folderPath !== 'string') return false;
    if (folderPath.length > MAX_FOLDER_PATH_LENGTH) return false;
    if (folderPath.includes('..')) return false;
    return /^[a-zA-Z0-9/_-]+$/.test(folderPath);
  }

  /**
   * Validates polymorphic entity owner reference parameters.
   */
  static isValidOwnerReference(ownerType: string, ownerId: string): boolean {
    if (!ownerType || !ownerId) return false;
    const isValidType = Object.values(OwnerEntityType).includes(ownerType as OwnerEntityType);
    const isValidMongoId = /^[0-9a-fA-F]{24}$/.test(ownerId);
    return isValidType && isValidMongoId;
  }
}
