/**
 * Reusable Copyright Notice Component Partial.
 */
export class CopyrightPartial {
  static render(companyName: string = 'Enterprise Store'): string {
    const year = new Date().getFullYear();
    return `<p style="margin: 8px 0 0 0; font-size: 12px; color: #a0aec0;">
  &copy; ${year} ${companyName}. All rights reserved.
</p>`;
  }
}
