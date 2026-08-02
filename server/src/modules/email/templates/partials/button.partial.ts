import { IButtonConfig } from '../interfaces/layout-options.interface';

/**
 * Reusable Call-To-Action (CTA) Button Component Partial.
 */
export class ButtonPartial {
  static render(config: IButtonConfig): string {
    const bg = config.backgroundColor || '#3182ce';
    const textColor = config.textColor || '#ffffff';
    const align = config.align || 'center';

    return `<table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 24px 0;">
  <tr>
    <td align="${align}">
      <table role="presentation" border="0" cellspacing="0" cellpadding="0">
        <tr>
          <td align="center" style="background-color: ${bg}; border-radius: 6px;">
            <a href="${config.url}" target="_blank" style="display: inline-block; padding: 12px 24px; font-weight: bold; color: ${textColor}; text-decoration: none; border-radius: 6px;">
              ${config.text}
            </a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;
  }
}
