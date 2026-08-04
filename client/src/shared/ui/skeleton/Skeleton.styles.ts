import type { SxProps, Theme } from '@mui/material';

/**
 * Enterprise Skeleton Style Definitions (Module 8 - Step 8.18).
 *
 * All properties integrate with the MUI theme.
 */

export const skeletonRootSx: SxProps<Theme> = {};

/** Base variant specific styles overriding default MUI margins where appropriate. */
export const variantStyles = {
  text: {
    transform: 'scale(1, 0.60)',
    '&:only-child': {
      transform: 'none',
    },
  },
  rectangular: {
    borderRadius: 0,
  },
  rounded: {
    borderRadius: (theme: Theme) => `${theme.shape.borderRadius}px`,
  },
  circular: {
    borderRadius: '50%',
  },
};

/** Container styles applied when repeating skeleton blocks. */
export const repeatedContainerSx: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  gap: 1.5,
};

/** Spacing/gap rules when rendering multiple lines of text rows. */
export const textRowContainerSx: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  gap: 1, // smaller gap for text lines
};

/** Standardized border radius override for rounded text/rectangular lines. */
export const forceRoundedSx: SxProps<Theme> = {
  borderRadius: (theme) => `${theme.shape.borderRadius}px`,
};

/** Enforces full width. */
export const skeletonFullWidthSx: SxProps<Theme> = {
  width: '100%',
};
