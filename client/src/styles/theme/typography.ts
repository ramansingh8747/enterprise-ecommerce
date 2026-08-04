import type { TypographyOptions } from '@mui/material/styles/createTypography';
import { TYPOGRAPHY_TOKENS } from '../tokens/typography.tokens';

/**
 * Enterprise Material UI Typography Configuration (Module 3 - Step 3.2).
 *
 * Driven exclusively by TYPOGRAPHY_TOKENS.
 */
export const typographyOptions: TypographyOptions = {
  fontFamily: TYPOGRAPHY_TOKENS.fontFamily.sans,
  fontSize: 14,
  fontWeightLight: TYPOGRAPHY_TOKENS.fontWeight.light,
  fontWeightRegular: TYPOGRAPHY_TOKENS.fontWeight.regular,
  fontWeightMedium: TYPOGRAPHY_TOKENS.fontWeight.medium,
  fontWeightBold: TYPOGRAPHY_TOKENS.fontWeight.bold,
  h1: {
    fontFamily: TYPOGRAPHY_TOKENS.fontFamily.sans,
    fontSize: TYPOGRAPHY_TOKENS.fontSize['5xl'],
    fontWeight: TYPOGRAPHY_TOKENS.fontWeight.bold,
    lineHeight: TYPOGRAPHY_TOKENS.lineHeight.tight,
    letterSpacing: TYPOGRAPHY_TOKENS.letterSpacing.tight,
  },
  h2: {
    fontFamily: TYPOGRAPHY_TOKENS.fontFamily.sans,
    fontSize: TYPOGRAPHY_TOKENS.fontSize['4xl'],
    fontWeight: TYPOGRAPHY_TOKENS.fontWeight.bold,
    lineHeight: TYPOGRAPHY_TOKENS.lineHeight.tight,
    letterSpacing: TYPOGRAPHY_TOKENS.letterSpacing.tight,
  },
  h3: {
    fontFamily: TYPOGRAPHY_TOKENS.fontFamily.sans,
    fontSize: TYPOGRAPHY_TOKENS.fontSize['3xl'],
    fontWeight: TYPOGRAPHY_TOKENS.fontWeight.semiBold,
    lineHeight: TYPOGRAPHY_TOKENS.lineHeight.tight,
  },
  h4: {
    fontFamily: TYPOGRAPHY_TOKENS.fontFamily.sans,
    fontSize: TYPOGRAPHY_TOKENS.fontSize['2xl'],
    fontWeight: TYPOGRAPHY_TOKENS.fontWeight.semiBold,
    lineHeight: TYPOGRAPHY_TOKENS.lineHeight.normal,
  },
  h5: {
    fontFamily: TYPOGRAPHY_TOKENS.fontFamily.sans,
    fontSize: TYPOGRAPHY_TOKENS.fontSize.xl,
    fontWeight: TYPOGRAPHY_TOKENS.fontWeight.medium,
    lineHeight: TYPOGRAPHY_TOKENS.lineHeight.normal,
  },
  h6: {
    fontFamily: TYPOGRAPHY_TOKENS.fontFamily.sans,
    fontSize: TYPOGRAPHY_TOKENS.fontSize.lg,
    fontWeight: TYPOGRAPHY_TOKENS.fontWeight.medium,
    lineHeight: TYPOGRAPHY_TOKENS.lineHeight.normal,
  },
  subtitle1: {
    fontSize: TYPOGRAPHY_TOKENS.fontSize.md,
    fontWeight: TYPOGRAPHY_TOKENS.fontWeight.medium,
    lineHeight: TYPOGRAPHY_TOKENS.lineHeight.relaxed,
  },
  subtitle2: {
    fontSize: TYPOGRAPHY_TOKENS.fontSize.sm,
    fontWeight: TYPOGRAPHY_TOKENS.fontWeight.medium,
    lineHeight: TYPOGRAPHY_TOKENS.lineHeight.relaxed,
  },
  body1: {
    fontSize: TYPOGRAPHY_TOKENS.fontSize.md,
    fontWeight: TYPOGRAPHY_TOKENS.fontWeight.regular,
    lineHeight: TYPOGRAPHY_TOKENS.lineHeight.normal,
  },
  body2: {
    fontSize: TYPOGRAPHY_TOKENS.fontSize.sm,
    fontWeight: TYPOGRAPHY_TOKENS.fontWeight.regular,
    lineHeight: TYPOGRAPHY_TOKENS.lineHeight.normal,
  },
  button: {
    fontSize: TYPOGRAPHY_TOKENS.fontSize.sm,
    fontWeight: TYPOGRAPHY_TOKENS.fontWeight.semiBold,
    lineHeight: TYPOGRAPHY_TOKENS.lineHeight.none,
    textTransform: 'none',
  },
  caption: {
    fontSize: TYPOGRAPHY_TOKENS.fontSize.xs,
    fontWeight: TYPOGRAPHY_TOKENS.fontWeight.regular,
    lineHeight: TYPOGRAPHY_TOKENS.lineHeight.normal,
  },
  overline: {
    fontSize: TYPOGRAPHY_TOKENS.fontSize.xs,
    fontWeight: TYPOGRAPHY_TOKENS.fontWeight.semiBold,
    letterSpacing: TYPOGRAPHY_TOKENS.letterSpacing.wider,
    textTransform: 'uppercase',
  },
};
