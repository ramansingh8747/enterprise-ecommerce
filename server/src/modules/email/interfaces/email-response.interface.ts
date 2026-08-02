/**
 * Standardized email delivery response envelope (Module 20.2).
 */
export interface IEmailResponse {
  /**
   * Boolean flag indicating whether provider accepted dispatch.
   */
  success: boolean;

  /**
   * External vendor provider message/transaction ID (e.g. SendGrid message ID, SES MessageId).
   */
  messageId?: string;

  /**
   * Name of vendor provider adapter executing the send (e.g., 'MockEmailProvider', 'AmazonSesProvider').
   */
  provider: string;

  /**
   * List of recipient email addresses accepted by vendor server.
   */
  acceptedRecipients?: string[];

  /**
   * List of recipient email addresses rejected by vendor server.
   */
  rejectedRecipients?: string[];

  /**
   * Diagnostic error message if delivery failed.
   */
  errorMessage?: string;

  /**
   * Backward compatibility error field string.
   */
  error?: string;

  /**
   * UTC timestamp when vendor accepted the message.
   */
  sentAt?: Date;

  /**
   * HTTP or SMTP status code returned by vendor.
   */
  statusCode?: number;
}
