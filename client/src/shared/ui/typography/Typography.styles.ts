import type { SxProps, Theme } from '@mui/material';

/**
 * Enterprise Typography Style Definitions (Module 8 - Step 8.19).
 *
 * All values are integrated with the MUI theme.
 */

export const typographyRootSx: SxProps<Theme> = {};

/** Truncates text line with ellipsis when single line overflows container. */
export const typographyTruncateSx: SxProps<Theme> = {
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  display: 'block',
};

/** Disables cursor highlighting and text selection. */
export const typographyUnselectableSx: SxProps<Theme> = {
  userSelect: 'none',
  WebkitUserSelect: 'none',
  msUserSelect: 'none',
  MozUserSelect: 'none',
};

/** Styles applied when skeleton loader is rendering. */
export const typographyLoadingSx: SxProps<Theme> = {
  display: 'inline-block',
  verticalAlign: 'middle',
};
