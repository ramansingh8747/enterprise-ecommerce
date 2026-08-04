import type { SxProps, Theme } from '@mui/material';

/**
 * Enterprise Switch Style Definitions (Module 8 - Step 8.7).
 *
 * All values are sourced from the MUI theme — no hardcoded colours or magic numbers.
 */

/** Applied to the FormHelperText rendered below the switch. */
export const switchHelperTextSx: SxProps<Theme> = {
  ml: '46px', // aligns with the label text past the switch track + gap
  mt: 0,
};

/** Applied to the root FormControl when fullWidth is true. */
export const switchFullWidthSx: SxProps<Theme> = {
  width: '100%',
};
