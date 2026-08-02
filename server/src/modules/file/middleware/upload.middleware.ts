import { Request, Response, NextFunction, RequestHandler } from 'express';
import multer from 'multer';
import { MulterConfigBuilder, IUploadMiddlewareOptions } from '../config/multer.config';
import { FileValidationError } from '../errors/file.errors';
import { ApiResponse } from '../../../interfaces/api-response.interface';

/**
 * Enterprise Upload Error Interceptor Middleware (Module 21.4).
 * Intercepts Multer limits, validation errors, and formats clean API responses.
 */
export function handleUploadError(
  err: any,
  _req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!err) {
    return next();
  }

  if (err instanceof multer.MulterError) {
    let message = 'File upload error';

    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        message = 'Uploaded file size exceeds maximum allowed threshold';
        break;
      case 'LIMIT_FILE_COUNT':
        message = 'Exceeded maximum allowed number of upload files';
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        message = `Unexpected upload field name '${err.field}' in request payload`;
        break;
      default:
        message = err.message || 'File upload processing failed';
        break;
    }

    const response: ApiResponse = {
      success: false,
      message,
    };
    res.status(400).json(response);
    return;
  }

  if (err instanceof FileValidationError) {
    const response: ApiResponse = {
      success: false,
      message: err.message,
    };
    res.status(400).json(response);
    return;
  }

  next(err);
}

/**
 * Reusable Upload Middleware Builder Helpers (Module 21.4).
 */
export class UploadMiddleware {
  /**
   * Single file upload middleware.
   */
  static single(fieldName: string, options: IUploadMiddlewareOptions = {}): RequestHandler {
    const multerEngine = MulterConfigBuilder.build(options);
    const multerSingle = multerEngine.single(fieldName);

    return (req: Request, res: Response, next: NextFunction) => {
      multerSingle(req, res, (err: any) => {
        if (err) {
          return handleUploadError(err, req, res, next);
        }
        if (!req.file) {
          const response: ApiResponse = {
            success: false,
            message: `Required upload file field '${fieldName}' is missing from request`,
          };
          res.status(400).json(response);
          return;
        }
        next();
      });
    };
  }

  /**
   * Array upload middleware for multiple files in a single field.
   */
  static array(
    fieldName: string,
    maxCount: number = 10,
    options: IUploadMiddlewareOptions = {}
  ): RequestHandler {
    const multerEngine = MulterConfigBuilder.build({ ...options, maxFileCount: maxCount });
    const multerArray = multerEngine.array(fieldName, maxCount);

    return (req: Request, res: Response, next: NextFunction) => {
      multerArray(req, res, (err: any) => {
        if (err) {
          return handleUploadError(err, req, res, next);
        }
        if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
          const response: ApiResponse = {
            success: false,
            message: `Required upload file list '${fieldName}' is empty`,
          };
          res.status(400).json(response);
          return;
        }
        next();
      });
    };
  }

  /**
   * Fields upload middleware for named multi-field files.
   */
  static fields(fields: multer.Field[], options: IUploadMiddlewareOptions = {}): RequestHandler {
    const multerEngine = MulterConfigBuilder.build(options);
    const multerFields = multerEngine.fields(fields);

    return (req: Request, res: Response, next: NextFunction) => {
      multerFields(req, res, (err: any) => {
        if (err) {
          return handleUploadError(err, req, res, next);
        }
        next();
      });
    };
  }
}
