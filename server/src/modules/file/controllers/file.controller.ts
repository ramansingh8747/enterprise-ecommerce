import { Request, Response, NextFunction } from 'express';
import { FileUploadService } from '../services/file-upload.service';
import { ApiResponse } from '../../../interfaces/api-response.interface';
import { UploadFileDto, ListFilesQueryDto, UpdateFileMetadataDto, MoveFileDto, CopyFileDto } from '../dto/file.dto';

/**
 * Enterprise File Upload REST Controller (Module 21.7).
 * Handles HTTP requests, delegates payload to FileUploadService, and returns standardized API responses.
 */
export class FileController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  /**
   * POST /api/v1/files/upload
   * Single file upload endpoint.
   */
  uploadSingleFile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const file = req.file;
      if (!file) {
        const response: ApiResponse = {
          success: false,
          message: "Upload file payload missing in 'file' multipart field",
        };
        res.status(400).json(response);
        return;
      }

      const dto: UploadFileDto = {
        category: req.body.category,
        visibility: req.body.visibility,
        folder: req.body.folder,
        tags: req.body.tags ? (Array.isArray(req.body.tags) ? req.body.tags : [req.body.tags]) : undefined,
        ownerType: req.body.ownerType,
        ownerId: req.body.ownerId,
        provider: req.body.provider,
        namingStrategy: req.body.namingStrategy,
        customPrefix: req.body.customPrefix,
        overwrite: req.body.overwrite === 'true' || req.body.overwrite === true,
        metadata: req.body.metadata,
      };

      const userId = (req as any).user?.userId || (req as any).user?._id;
      const uploadedFile = await this.fileUploadService.uploadFile(file, dto, userId);

      const response: ApiResponse = {
        success: true,
        message: 'File uploaded successfully',
        data: uploadedFile,
      };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/v1/files/upload/multiple
   * Batch multiple file upload endpoint.
   */
  uploadMultipleFiles = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        const response: ApiResponse = {
          success: false,
          message: "Upload file payload missing in 'files' multipart field",
        };
        res.status(400).json(response);
        return;
      }

      const dto: UploadFileDto = {
        category: req.body.category,
        visibility: req.body.visibility,
        folder: req.body.folder,
        tags: req.body.tags ? (Array.isArray(req.body.tags) ? req.body.tags : [req.body.tags]) : undefined,
        ownerType: req.body.ownerType,
        ownerId: req.body.ownerId,
        provider: req.body.provider,
      };

      const userId = (req as any).user?.userId || (req as any).user?._id;
      const result = await this.fileUploadService.uploadMultipleFiles(files, dto, userId);

      const response: ApiResponse = {
        success: true,
        message: `Batch upload processed: ${result.success.length} succeeded, ${result.failed.length} failed`,
        data: result,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/v1/files/:id/replace
   * Replaces an existing file asset.
   */
  replaceFile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const fileId = req.params.id as string;
      const file = req.file;
      if (!file) {
        const response: ApiResponse = {
          success: false,
          message: "Replacement file payload missing in 'file' multipart field",
        };
        res.status(400).json(response);
        return;
      }

      const userId = (req as any).user?.userId || (req as any).user?._id;
      const replaced = await this.fileUploadService.replaceFile(fileId, file, req.body, userId);

      const response: ApiResponse = {
        success: true,
        message: 'File replaced successfully',
        data: replaced,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/files/:id
   * Retrieves single file metadata by ID.
   */
  getFileById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const fileId = req.params.id as string;
      const file = await this.fileUploadService.getFileById(fileId);

      const response: ApiResponse = {
        success: true,
        message: 'File metadata retrieved successfully',
        data: file,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/files
   * Lists files with pagination, filtering, and sorting.
   */
  listFiles = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query: ListFilesQueryDto = {
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 10,
        provider: req.query.provider as any,
        uploadStatus: req.query.uploadStatus as any,
        visibility: req.query.visibility as any,
        category: req.query.category as any,
        uploadedBy: req.query.uploadedBy as string,
        ownerType: req.query.ownerType as string,
        ownerId: req.query.ownerId as string,
        folder: req.query.folder as string,
        mimeType: req.query.mimeType as string,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as any,
      };

      const result = await this.fileUploadService.listFiles(query);

      const response: ApiResponse = {
        success: true,
        message: 'Files retrieved successfully',
        data: {
          files: result.files,
          pagination: {
            page: result.page,
            limit: result.limit,
            total: result.total,
            totalPages: result.totalPages,
          },
        },
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /api/v1/files/:id/metadata
   * Updates file metadata.
   */
  updateFileMetadata = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const fileId = req.params.id as string;
      const dto: UpdateFileMetadataDto = req.body;
      const updated = await this.fileUploadService.updateMetadata(fileId, dto);

      const response: ApiResponse = {
        success: true,
        message: 'File metadata updated successfully',
        data: updated,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /api/v1/files/:id/move
   * Moves a file asset to a new path key.
   */
  moveFile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const fileId = req.params.id as string;
      const dto: MoveFileDto = req.body;
      const moved = await this.fileUploadService.moveFile(fileId, dto);

      const response: ApiResponse = {
        success: true,
        message: 'File moved successfully',
        data: moved,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/v1/files/:id/copy
   * Copies a file asset to a new destination key.
   */
  copyFile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const fileId = req.params.id as string;
      const dto: CopyFileDto = req.body;
      const copied = await this.fileUploadService.copyFile(fileId, dto);

      const response: ApiResponse = {
        success: true,
        message: 'File copied successfully',
        data: copied,
      };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/v1/files/:id
   * Soft or permanent file deletion endpoint.
   */
  deleteFile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const fileId = req.params.id as string;
      const permanent = req.query.permanent === 'true';
      const userId = (req as any).user?.userId || (req as any).user?._id;

      const deleted = await this.fileUploadService.deleteFile(fileId, permanent, userId);
      if (!deleted) {
        const response: ApiResponse = {
          success: false,
          message: `File with ID '${fileId}' not found`,
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse = {
        success: true,
        message: permanent ? 'File permanently deleted' : 'File soft deleted successfully',
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /api/v1/files/:id/restore
   * Restores a soft-deleted file.
   */
  restoreFile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const fileId = req.params.id as string;
      const userId = (req as any).user?.userId || (req as any).user?._id;
      const restored = await this.fileUploadService.restoreFile(fileId, userId);

      const response: ApiResponse = {
        success: true,
        message: 'File restored successfully',
        data: restored,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/files/:id/signed-url
   * Generates time-limited signed URL for private assets.
   */
  generateSignedUrl = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const fileId = req.params.id as string;
      const expiresInSeconds = req.query.expiresInSeconds
        ? parseInt(req.query.expiresInSeconds as string, 10)
        : 3600;

      const url = await this.fileUploadService.generateSignedUrl(fileId, expiresInSeconds);

      const response: ApiResponse = {
        success: true,
        message: 'Signed URL generated successfully',
        data: { signedUrl: url, expiresInSeconds },
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/files/:id/public-url
   * Gets public URL of an asset.
   */
  getPublicUrl = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const fileId = req.params.id as string;
      const url = await this.fileUploadService.getPublicUrl(fileId);

      const response: ApiResponse = {
        success: true,
        message: 'Public URL retrieved successfully',
        data: { publicUrl: url },
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}
