/**
 * HTML Escaping and Layout Helper Utilities (Module 20.5).
 */
export class HtmlHelper {
  /**
   * Safely escapes special HTML characters to prevent rendering bugs and injection vulnerabilities.
   */
  static escapeHtml(str: string): string {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Wraps HTML snippet inside an email-safe presentation table container.
   */
  static renderTableWrapper(contentHtml: string, width: string = '100%'): string {
    return `<table role="presentation" width="${width}" border="0" cellspacing="0" cellpadding="0">
  <tr>
    <td>${contentHtml}</td>
  </tr>
</table>`;
  }
}
