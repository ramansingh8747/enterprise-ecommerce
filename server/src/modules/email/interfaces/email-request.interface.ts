import { EmailCategory, EmailPriority, EmailTemplateId } from '../types/email.types';
import { IEmailRecipient } from './email-recipient.interface';
import { IEmailAttachment } from './email-attachment.interface';

/**
 * Enterprise, transport-independent email request specification (Module 20.2).
 */
export interface IEmailRequest {
  /**
   * Primary target recipient(s). Can be a single recipient object, email string, or array.
   */
  to: IEmailRecipient | IEmailRecipient[] | string | string[];

  /**
   * Optional Carbon Copy (CC) recipient(s).
   */
  cc?: IEmailRecipient | IEmailRecipient[] | string | string[];

  /**
   * Optional Blind Carbon Copy (BCC) recipient(s).
   */
  bcc?: IEmailRecipient | IEmailRecipient[] | string | string[];

  /**
   * Optional sender details. Defaults to DEFAULT_SENDER.
   */
  from?: IEmailRecipient | string;

  /**
   * Optional Reply-To destination address.
   */
  replyTo?: IEmailRecipient | string;

  /**
   * Email subject line.
   */
  subject: string;

  /**
   * Identifier of template to be rendered.
   */
  templateId?: EmailTemplateId | string;

  /**
   * Dynamic context parameter payload for template rendering.
   */
  context?: Record<string, unknown>;

  /**
   * Pre-rendered HTML body content.
   */
  html?: string;

  /**
   * Plain text fallback body content.
   */
  text?: string;

  /**
   * Optional list of file attachments.
   */
  attachments?: IEmailAttachment[];

  /**
   * Functional category for rate limiting and routing.
   */
  category: EmailCategory;

  /**
   * Delivery priority level.
   */
  priority: EmailPriority;

  /**
   * Optional custom SMTP headers map.
   */
  headers?: Record<string, string>;

  /**
   * Audit telemetry and tracking metadata.
   */
  metadata?: Record<string, unknown>;
}
