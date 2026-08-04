import type { SxProps, Theme } from '@mui/material';

/**
 * Enterprise Radio Style Definitions (Module 8 - Step 8.6).
 *
 * All values are sourced from the MUI theme — no hardcoded colours or magic numbers.
 */

/** Applied to the FormLabel rendering the group label. */
export const radioGroupLabelSx: SxProps<Theme> = {
  mb: 0.5,
};

/** Applied to the FormHelperText rendered below the group. */
export const radioHelperTextSx: SxProps<Theme> = {
  ml: 0,
  mt: 0.5,
};
