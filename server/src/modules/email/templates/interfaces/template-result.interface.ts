/**
 * Standardized template rendering output result envelope.
 */
export interface IEmailTemplateResult {
  /**
   * Rendered subject line.
   */
  subject: string;

  /**
   * Rendered HTML body string.
   */
  html: string;

  /**
   * Rendered plain text fallback body string.
   */
  text: string;
}
