/**
 * Reusable Horizontal Divider Component Partial.
 */
export class DividerPartial {
  static render(color: string = '#e2e8f0'): string {
    return `<table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 20px 0;">
  <tr>
    <td style="border-bottom: 1px solid ${color}; line-height: 0; font-size: 0;">&nbsp;</td>
  </tr>
</table>`;
  }
}
