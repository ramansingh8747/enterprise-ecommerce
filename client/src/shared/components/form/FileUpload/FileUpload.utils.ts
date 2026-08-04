/**
 * Enterprise FileUpload Utilities (Module 9 - Step 9.11).
 *
 * Provides file size formatting and strict validation helpers.
 */

/** Format raw bytes into a human-readable size string (e.g. 1.25 MB). */
export const formatFileSize = (bytes: number): string => {
  if (bytes <= 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/** Validate a file against maximum size constraints. */
export const validateFileSize = (file: File, maxBytes: number): boolean => {
  return file.size <= maxBytes;
};

/** Validate a file's mime-type or extension against a standard MUI/HTML "accept" pattern. */
export const validateFileType = (file: File, accept: string): boolean => {
  if (!accept) return true;
  const acceptedTypes = accept.split(',').map((t) => t.trim().toLowerCase());
  const fileType = file.type.toLowerCase();
  const fileName = file.name.toLowerCase();

  return acceptedTypes.some((type) => {
    if (type.startsWith('.')) {
      return fileName.endsWith(type);
    }
    if (type.endsWith('/*')) {
      const category = type.split('/')[0];
      return fileType.startsWith(`${category}/`);
    }
    return fileType === type;
  });
};
