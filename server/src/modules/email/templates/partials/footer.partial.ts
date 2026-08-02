import { IBrandingConfig } from '../interfaces/layout-options.interface';
import { CopyrightPartial } from './copyright.partial';
import { SocialLinksPartial } from './social-links.partial';

/**
 * Reusable Footer Email Component Partial.
 */
export class FooterPartial {
  static render(
    branding: IBrandingConfig,
    unsubscribeUrl?: string,
    showSocialLinks: boolean = true
  ): string {
    const socialHtml = showSocialLinks ? SocialLinksPartial.render() : '';
    const unsubscribeHtml = unsubscribeUrl
      ? `<p style="margin: 8px 0 0 0; font-size: 11px;">
          <a href="${unsubscribeUrl}" target="_blank" style="color: #a0aec0; text-decoration: underline;">Unsubscribe from these emails</a>
        </p>`
      : '';

    return `<table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
  <tr>
    <td class="footer-wrapper">
      <p style="margin: 0 0 8px 0; font-weight: bold; color: #4a5568;">${branding.companyName}</p>
      ${socialHtml}
      ${unsubscribeHtml}
      ${CopyrightPartial.render(branding.companyName)}
    </td>
  </tr>
</table>`;
  }
}
