import { IBrandingConfig } from '../interfaces/layout-options.interface';

/**
 * Reusable Header Email Component Partial.
 */
export class HeaderPartial {
  static render(branding: IBrandingConfig): string {
    const logoHtml = branding.logoUrl
      ? `<img src="${branding.logoUrl}" alt="${branding.companyName}" style="max-height: 40px; margin: 0 auto;" />`
      : `<span style="font-size: 20px; font-weight: bold; color: #ffffff; text-transform: uppercase; letter-spacing: 1px;">${branding.companyName}</span>`;

    return `<table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
  <tr>
    <td class="header-wrapper">
      <a href="${branding.websiteUrl || '#'}" target="_blank" style="text-decoration: none;">
        ${logoHtml}
      </a>
    </td>
  </tr>
</table>`;
  }
}
