import { IEmailTemplateData } from '../interfaces/template-data.interface';

/**
 * Strongly typed dynamic context parameters for Welcome Email Template (Module 20.6).
 */
export interface IWelcomeEmailData extends IEmailTemplateData {
  /**
   * Recipient's first name (required).
   */
  firstName: string;

  /**
   * Optional recipient's last name.
   */
  lastName?: string;

  /**
   * Application or portal name (defaults to 'Enterprise Store').
   */
  applicationName?: string;

  /**
   * Account login URL for CTA button (defaults to portal login).
   */
  loginUrl?: string;

  /**
   * Customer support email address.
   */
  supportEmail?: string;

  /**
   * Company name for branding and footer.
   */
  companyName?: string;

  /**
   * Current year for copyright notice.
   */
  currentYear?: number;
}
