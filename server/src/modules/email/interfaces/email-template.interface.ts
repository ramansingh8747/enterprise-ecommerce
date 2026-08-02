import { EmailTemplateId } from '../types/email.types';

/**
 * Rendered HTML and plain text email content output envelope.
 */
export interface IRenderedEmail {
  /**
   * Rendered HTML string body.
   */
  html: string;

  /**
   * Rendered plain text fallback body.
   */
  text: string;
}

/**
 * Enterprise Email Template Interface Contract.
 */
export interface IEmailTemplate {
  /**
   * Unique template identifier.
   */
  readonly templateId: EmailTemplateId | string;

  /**
   * Template subject line.
   */
  readonly subject: string;

  /**
   * Renders dynamic context parameters into HTML and plain text output.
   * @param context Parameter map
   */
  render(context: Record<string, unknown>): IRenderedEmail;
}
