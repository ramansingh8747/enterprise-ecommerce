/**
 * Branding and company identity configuration for email templates.
 */
export interface IBrandingConfig {
  companyName: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  textColor?: string;
  backgroundColor?: string;
  contactEmail?: string;
  websiteUrl?: string;
}

/**
 * Call-to-action button component configuration.
 */
export interface IButtonConfig {
  text: string;
  url: string;
  backgroundColor?: string;
  textColor?: string;
  align?: 'left' | 'center' | 'right';
}

/**
 * Base Email Layout Configuration Options.
 */
export interface IEmailLayoutOptions {
  title?: string;
  preheader?: string;
  branding?: Partial<IBrandingConfig>;
  unsubscribeUrl?: string;
  showSocialLinks?: boolean;
}
