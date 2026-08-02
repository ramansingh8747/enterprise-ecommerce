import { INamingStrategy } from '../interfaces/naming-strategy.interface';
import { IFileUploadOptions } from '../interfaces/file-service.interface';
import { IFileMetadata } from '../interfaces/file-metadata.interface';
import { FileValidationError } from '../errors/file.errors';
import path from 'path';

/**
 * Upload Pipeline Telemetry Hooks Interface (Module 21.4).
 */
export interface IUploadPipelineHooks {
  onUploadStarted?: (file: Express.Multer.File) => void;
  onValidationCompleted?: (file: Express.Multer.File) => void;
  onUploadCompleted?: (file: Express.Multer.File, metadata: Partial<IFileMetadata>) => void;
  onUploadFailed?: (file: Express.Multer.File, error: Error) => void;
}

/**
 * 7-Step Reusable Upload Pipeline Foundation (Module 21.4).
 * 
 * Pipeline Phases:
 * 1. Receive Request Payload
 * 2. Multer Pre-parsing
 * 3. File & MIME Pre-validation
 * 4. Metadata Extraction
 * 5. Naming Strategy Key Generation
 * 6. Storage Provider Handoff (Placeholder Contract)
 * 7. Standardized Response Envelope Preparation
 */
export class UploadPipeline {
  constructor(
    private readonly namingStrategy: INamingStrategy,
    private readonly hooks?: IUploadPipelineHooks
  ) {}

  /**
   * Phase 3: Validates file buffer and size.
   */
  private validatePreconditions(file: Express.Multer.File): void {
    if (!file || !file.buffer || file.buffer.length === 0) {
      throw new FileValidationError('Upload file buffer is empty or corrupted');
    }
  }

  /**
   * Phase 4: Extracts metadata properties from Multer file object.
   */
  private extractMetadata(file: Express.Multer.File): {
    originalFilename: string;
    extension: string;
    mimeType: string;
    size: number;
  } {
    const ext = path.extname(file.originalname).replace('.', '').toLowerCase();
    return {
      originalFilename: file.originalname,
      extension: ext,
      mimeType: file.mimetype.toLowerCase(),
      size: file.buffer.length,
    };
  }

  /**
   * Phase 5: Generates unique stored filename using Naming Strategy.
   */
  private applyNamingStrategy(file: Express.Multer.File, options: IFileUploadOptions): string {
    return this.namingStrategy.generateName(
      file.originalname,
      options.namingStrategy,
      options.customPrefix
    );
  }

  /**
   * Executes complete 7-step pipeline up to Provider Handoff.
   */
  async process(
    file: Express.Multer.File,
    options: IFileUploadOptions
  ): Promise<{
    storedFilename: string;
    metadata: Partial<IFileMetadata>;
    buffer: Buffer;
  }> {
    try {
      // Step 1: Receive Request
      this.hooks?.onUploadStarted?.(file);

      // Step 3: Validate Preconditions
      this.validatePreconditions(file);
      this.hooks?.onValidationCompleted?.(file);

      // Step 4: Extract Metadata
      const extracted = this.extractMetadata(file);

      // Step 5: Naming Strategy
      const storedFilename = this.applyNamingStrategy(file, options);

      // Step 6 & 7: Prepare Handoff Metadata Payload
      const partialMetadata: Partial<IFileMetadata> = {
        filename: storedFilename,
        originalFilename: extracted.originalFilename,
        extension: extracted.extension,
        mimeType: extracted.mimeType,
        size: extracted.size,
        category: options.category,
        uploadedBy: options.uploadedBy,
        folder: options.folder || options.category.toLowerCase(),
        visibility: options.visibility,
      };

      this.hooks?.onUploadCompleted?.(file, partialMetadata);

      return {
        storedFilename,
        metadata: partialMetadata,
        buffer: file.buffer,
      };
    } catch (error: any) {
      this.hooks?.onUploadFailed?.(file, error);
      throw error;
    }
  }
}
