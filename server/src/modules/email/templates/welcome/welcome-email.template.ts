import { BaseEmailTemplate } from '../base/base-template';
import { EmailTemplateId } from '../../types/email.types';
import { IRenderedEmail } from '../../interfaces/email-template.interface';
import { IWelcomeEmailData } from './welcome-email.interface';
import { BaseEmailLayout } from '../layouts/base-email.layout';
import { ButtonPartial } from '../partials/button.partial';
import { DividerPartial } from '../partials/divider.partial';
import { HtmlHelper } from '../helpers/html.helper';

/**
 * Enterprise Welcome Email Template Implementation (Module 20.6).
 * 
 * Generates personalized HTML and plain text welcome emails for new user onboardings.
 * Completely provider-independent and template-engine compliant.
 */
export class WelcomeEmailTemplate extends BaseEmailTemplate {
  readonly templateId = EmailTemplateId.WELCOME;
  readonly subject = 'Welcome to {{applicationName}}, {{firstName}}!';

  /**
   * Validates required template context properties.
   */
  private validateData(data: IWelcomeEmailData): void {
    if (!data || typeof data !== 'object') {
      throw new Error('WelcomeEmailTemplate requires a valid data context object');
    }

    if (!data.firstName || typeof data.firstName !== 'string' || data.firstName.trim().length === 0) {
      throw new Error('WelcomeEmailTemplate missing required field: "firstName"');
    }
  }

  /**
   * Renders the inner HTML content body.
   */
  protected renderHtmlContent(data: IWelcomeEmailData): string {
    const firstName = HtmlHelper.escapeHtml(data.firstName.trim());
    const lastName = data.lastName ? HtmlHelper.escapeHtml(data.lastName.trim()) : '';
    const fullName = lastName ? `${firstName} ${lastName}` : firstName;

    const appName = HtmlHelper.escapeHtml(data.applicationName || 'Enterprise Store');
    const loginUrl = data.loginUrl || 'https://enterprisestore.com/login';
    const supportEmail = HtmlHelper.escapeHtml(data.supportEmail || 'support@enterprisestore.com');

    const ctaButton = ButtonPartial.render({
      text: 'Log In to Your Account',
      url: loginUrl,
      backgroundColor: '#3182ce',
      textColor: '#ffffff',
      align: 'center',
    });

    const divider = DividerPartial.render();

    return `
<h2 style="color: #2d3748; margin-top: 0; font-size: 22px;">Welcome aboard, ${fullName}! 🎉</h2>

<p style="font-size: 15px; color: #4a5568; line-height: 1.6;">
  Thank you for joining <strong>${appName}</strong>! We're thrilled to have you as part of our global shopping community.
</p>

<p style="font-size: 15px; color: #4a5568; line-height: 1.6;">
  Your account is fully activated and ready to go. Explore thousands of enterprise products, manage your orders, curate your wishlist, and enjoy exclusive member promotions.
</p>

${ctaButton}

${divider}

<p style="font-size: 14px; color: #718096; line-height: 1.5;">
  If you have any questions or need assistance, our support team is available 24/7 at 
  <a href="mailto:${supportEmail}" style="color: #3182ce; text-decoration: underline;">${supportEmail}</a>.
</p>
`;
  }

  /**
   * Renders plain-text fallback content.
   */
  protected renderTextContent(data: IWelcomeEmailData): string {
    const firstName = data.firstName.trim();
    const appName = data.applicationName || 'Enterprise Store';
    const loginUrl = data.loginUrl || 'https://enterprisestore.com/login';
    const supportEmail = data.supportEmail || 'support@enterprisestore.com';

    return `Welcome aboard, ${firstName}!

Thank you for joining ${appName}! We're thrilled to have you as part of our community.

Your account is fully activated and ready to go. Log in to explore products and manage your profile:
${loginUrl}

If you have any questions, reach out to support at: ${supportEmail}

© ${new Date().getFullYear()} ${appName}. All rights reserved.`;
  }

  /**
   * Overrides base render method to perform validation, render inner content, and assemble using BaseEmailLayout.
   */
  override render(context: IWelcomeEmailData): IRenderedEmail {
    this.validateData(context);

    const appName = context.applicationName || 'Enterprise Store';
    const companyName = context.companyName || appName;

    const interpolatedSubject = this.interpolate(this.subject, {
      ...context,
      applicationName: appName,
    });

    const innerHtml = this.renderHtmlContent(context);
    const fullHtml = BaseEmailLayout.render(innerHtml, {
      title: interpolatedSubject,
      preheader: `Welcome to ${appName}! Your account is active.`,
      branding: {
        companyName,
      },
    });

    const plainText = this.renderTextContent(context);

    return {
      html: fullHtml,
      text: plainText,
    };
  }
}
