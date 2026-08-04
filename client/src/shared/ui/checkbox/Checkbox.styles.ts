import type { SxProps, Theme } from '@mui/material';

/**
 * Enterprise Checkbox Style Definitions (Module 8 - Step 8.5).
 *
 * All values are sourced from the MUI theme — no hardcoded colours or magic numbers.
 */

/** Applied to the FormHelperText element when rendered below the checkbox. */
export const checkboxHelperTextSx: SxProps<Theme> = {
  ml: '30px', // aligns with the label text, clearing the checkbox + gap
  mt: 0,
};

/** Applied to the root FormControl when fullWidth is true. */
export const checkboxFullWidthSx: SxProps<Theme> = {
  width: '100%',
};
