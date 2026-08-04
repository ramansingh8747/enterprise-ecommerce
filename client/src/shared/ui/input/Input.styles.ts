import type { SxProps, Theme } from '@mui/material';

/**
 * Enterprise Input Style Definitions (Module 8 - Step 8.3).
 *
 * All layout and spacing values are sourced from the MUI theme.
 * No hardcoded colours, no magic numbers.
 */

/** Applied to the CircularProgress spinner rendered inside the loading end adornment. */
export const inputLoadingSpinnerSx: SxProps<Theme> = {
  color: 'action.disabled',
  flexShrink: 0,
};

/** Applied to the InputAdornment wrapper that hosts the loading spinner. */
export const inputLoadingAdornmentSx: SxProps<Theme> = {
  mr: 1,
};
