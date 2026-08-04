/**
 * Enterprise Typography Tokens (Module 3 - Step 3.1).
 *
 * Font families, scale, font weights, line heights, and letter spacing.
 */

export const TYPOGRAPHY_TOKENS = Object.freeze({
  fontFamily: Object.freeze({
    sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  }),

  fontSize: Object.freeze({
    xs: '0.75rem', // 12px
    sm: '0.875rem', // 14px
    md: '1rem', // 16px
    lg: '1.125rem', // 18px
    xl: '1.25rem', // 20px
    '2xl': '1.5rem', // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem', // 48px
  }),

  fontWeight: Object.freeze({
    light: 300,
    regular: 400,
    medium: 500,
    semiBold: 600,
    bold: 700,
  }),

  lineHeight: Object.freeze({
    none: 1,
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  }),

  letterSpacing: Object.freeze({
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
  }),
});
