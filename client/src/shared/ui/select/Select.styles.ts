import type { SxProps, Theme } from '@mui/material';

/**
 * Enterprise Select Style Definitions (Module 8 - Step 8.4).
 *
 * All values sourced from the MUI theme — no hardcoded colours or magic numbers.
 */

/** Applied to the placeholder MenuItem so it appears visually distinct (muted). */
export const selectPlaceholderMenuItemSx: SxProps<Theme> = {
  color: 'text.disabled',
  fontStyle: 'italic',
};

/** Applied to the CircularProgress spinner rendered inside the Select input. */
export const selectLoadingSpinnerSx: SxProps<Theme> = {
  color: 'action.disabled',
  mr: 2,
  flexShrink: 0,
};
