/**
 * Regex Character Escaping Utility (Module 22.2).
 * Safely escapes special regular expression characters in user input strings before creating RegExp instances.
 */
export class RegexEscapeUtil {
  /**
   * Escapes special characters for safe regular expression matching.
   * @param str Raw input string
   */
  static escape(str: string): string {
    if (!str || typeof str !== 'string') return '';
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
