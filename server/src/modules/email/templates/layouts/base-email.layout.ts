import { IEmailLayoutOptions, IBrandingConfig } from '../interfaces/layout-options.interface';
import { StyleHelper, DEFAULT_BRANDING } from '../helpers/style.helper';
import { HeaderPartial } from '../partials/header.partial';
import { FooterPartial } from '../partials/footer.partial';

/**
 * Enterprise Base Email Layout Assembler (Module 20.5).
 * Assembles HTML head, email-safe styles, header partial, main content section, footer partial, and responsive viewports.
 */
export class BaseEmailLayout {
  /**
   * Assembles complete responsive HTML email wrapper around child template content.
   */
  static render(contentHtml: string, options: IEmailLayoutOptions = {}): string {
    const branding: IBrandingConfig = { ...DEFAULT_BRANDING, ...options.branding };
    const title = options.title || branding.companyName;
    const preheader = options.preheader
      ? `<span style="display:none;font-size:1px;color:#333333;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${options.preheader}</span>`
      : '';

    const embeddedStyles = StyleHelper.getBaseStyles(branding);
    const headerHtml = HeaderPartial.render(branding);
    const footerHtml = FooterPartial.render(branding, options.unsubscribeUrl, options.showSocialLinks ?? true);

    return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${title}</title>
  <style type="text/css">
    ${embeddedStyles}
  </style>
</head>
<body>
  ${preheader}
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: ${branding.backgroundColor}; padding: 24px 0;">
    <tr>
      <td align="center">
        <div class="email-container">
          ${headerHtml}
          <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
            <tr>
              <td class="content-wrapper">
                ${contentHtml}
              </td>
            </tr>
          </table>
          ${footerHtml}
        </div>
      </td>
    </tr>
  </table>
</body>
</html>`;
  }
}
