/**
 * Transport-independent email attachment specification.
 */
export interface IEmailAttachment {
  /**
   * Attachment filename (e.g. invoice-1002.pdf).
   */
  filename: string;

  /**
   * Raw attachment buffer or UTF-8/Base64 string.
   */
  content?: Buffer | string;

  /**
   * MIME content type (e.g. application/pdf, image/png).
   */
  contentType: string;

  /**
   * File path or remote S3 URL if attachment is streamed.
   */
  path?: string;

  /**
   * Content-ID for embedded inline HTML images.
   */
  cid?: string;
}
