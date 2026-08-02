import { IBrandingConfig } from '../interfaces/layout-options.interface';

/**
 * Default Email Branding Theme Constants.
 */
export const DEFAULT_BRANDING: IBrandingConfig = {
  companyName: 'Enterprise Store',
  logoUrl: '',
  primaryColor: '#1a202c',
  secondaryColor: '#3182ce',
  textColor: '#2d3748',
  backgroundColor: '#f7fafc',
  contactEmail: 'support@enterprisestore.com',
  websiteUrl: 'https://enterprisestore.com',
};

/**
 * Email-safe CSS Style Generator Helper (Module 20.5).
 */
export class StyleHelper {
  /**
   * Generates email-safe embedded CSS rules with brand theme variable injections.
   */
  static getBaseStyles(brandingConfig?: Partial<IBrandingConfig>): string {
    const branding: IBrandingConfig = { ...DEFAULT_BRANDING, ...brandingConfig };

    return `
      body { margin: 0; padding: 0; min-width: 100%; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: ${branding.backgroundColor}; color: ${branding.textColor}; -webkit-font-smoothing: antialiased; }
      table { border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
      td { padding: 0; }
      img { border: 0; line-height: 100%; outline: none; text-decoration: none; display: block; }
      a { color: ${branding.secondaryColor}; text-decoration: none; }
      .email-container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
      .header-wrapper { background-color: ${branding.primaryColor}; padding: 24px; text-align: center; }
      .content-wrapper { padding: 32px 24px; line-height: 1.6; }
      .footer-wrapper { background-color: #edf2f7; padding: 24px; text-align: center; font-size: 12px; color: #718096; }
    `;
  }
}
