/**
 * Enterprise Border Tokens (Module 3 - Step 3.1).
 *
 * Border radius and border width scales.
 */

export const BORDER_TOKENS = Object.freeze({
  radius: Object.freeze({
    none: '0px',
    xs: '0.125rem', // 2px
    sm: '0.25rem', // 4px
    md: '0.375rem', // 6px
    lg: '0.5rem', // 8px
    xl: '0.75rem', // 12px
    '2xl': '1rem', // 16px
    '3xl': '1.5rem', // 24px
    full: '9999px',
  }),

  width: Object.freeze({
    none: '0px',
    thin: '1px',
    medium: '2px',
    thick: '4px',
  }),
});
