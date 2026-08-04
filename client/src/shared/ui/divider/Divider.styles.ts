import type { SxProps, Theme } from '@mui/material';
import type { DividerSpacing, DividerColorVariant } from './Divider.types';

/**
 * Enterprise Divider Style Definitions (Module 8 - Step 8.16).
 *
 * All margins and border properties are integrated with the MUI theme.
 */

export const dividerRootSx: SxProps<Theme> = {};

/** Spacing values mapped to MUI theme spacing indexes. */
const SPACING_MAP: Record<DividerSpacing, number> = {
  none: 0,
  small: 1,
  medium: 2,
  large: 3,
};

/**
 * Computes margins surrounding the Divider line based on spacing and orientation.
 */
export const getSpacingSx = (
  spacing: DividerSpacing,
  orientation: 'horizontal' | 'vertical'
): SxProps<Theme> => {
  const marginValue = SPACING_MAP[spacing];
  return orientation === 'vertical'
    ? { mx: marginValue }
    : { my: marginValue };
};

/** Color variants mapping. Adjusts border color depending on default/brand choices. */
export const colorVariantStyles: Record<DividerColorVariant, SxProps<Theme>> = {
  default: {
    borderColor: 'divider',
  },
  primary: {
    borderColor: 'primary.main',
    '&::before, &::after': {
      borderColor: 'primary.main',
    },
  },
  secondary: {
    borderColor: 'secondary.main',
    '&::before, &::after': {
      borderColor: 'secondary.main',
    },
  },
  light: {
    borderColor: 'action.hover',
    '&::before, &::after': {
      borderColor: 'action.hover',
    },
  },
};

/** Custom typography adjustments when text is rendered in the Divider. */
export const dividerTextSx: SxProps<Theme> = {
  fontSize: '0.875rem',
  color: 'text.secondary',
};
