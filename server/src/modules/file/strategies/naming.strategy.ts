import { INamingStrategy } from '../interfaces/naming-strategy.interface';
import { NamingStrategyType } from '../types/file.types';
import crypto from 'crypto';
import path from 'path';

/**
 * Enterprise Filename Generation Strategy Implementation (Module 21.1).
 */
export class NamingStrategy implements INamingStrategy {
  /**
   * Sanitizes raw filename removing unsafe characters.
   */
  private sanitize(filename: string): string {
    return filename
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .replace(/_{2,}/g, '_')
      .toLowerCase();
  }

  /**
   * Generates a unique, sanitized filename key using the requested strategy.
   */
  generateName(
    originalFilename: string,
    strategyType: NamingStrategyType = NamingStrategyType.UUID,
    customPrefix?: string
  ): string {
    const ext = path.extname(originalFilename).toLowerCase();
    const nameWithoutExt = path.basename(originalFilename, ext);
    const prefix = customPrefix ? `${this.sanitize(customPrefix)}_` : '';

    let generatedKey = '';

    switch (strategyType) {
      case NamingStrategyType.UUID:
        generatedKey = `${prefix}${crypto.randomUUID()}${ext}`;
        break;

      case NamingStrategyType.TIMESTAMP:
        generatedKey = `${prefix}${Date.now()}_${this.sanitize(nameWithoutExt)}${ext}`;
        break;

      case NamingStrategyType.RANDOM_HASH:
        const randomHash = crypto.randomBytes(12).toString('hex');
        generatedKey = `${prefix}${randomHash}${ext}`;
        break;

      case NamingStrategyType.ORIGINAL:
        generatedKey = `${prefix}${this.sanitize(nameWithoutExt)}_${Date.now()}${ext}`;
        break;

      case NamingStrategyType.CUSTOM:
        generatedKey = `${prefix}${Date.now()}_${crypto.randomBytes(6).toString('hex')}${ext}`;
        break;

      default:
        generatedKey = `${prefix}${crypto.randomUUID()}${ext}`;
        break;
    }

    return generatedKey;
  }
}
