/**
 * Transport-agnostic attachment specification (for emails, PDFs, invoices, etc.).
 */
export interface NotificationAttachment {
  /**
   * Display filename of the attachment (e.g. invoice-1002.pdf).
   */
  filename: string;

  /**
   * Attachment payload data as raw Buffer or Base64/utf-8 string.
   */
  content?: Buffer | string;

  /**
   * MIME type of the file (e.g. application/pdf, image/png).
   */
  contentType: string;

  /**
   * Optional file system path or S3 URL if attachment is streamable.
   */
  path?: string;

  /**
   * Content-ID for inline images inside HTML templates.
   */
  cid?: string;
}
