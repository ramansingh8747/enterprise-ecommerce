import type { SxProps, Theme } from '@mui/material';

/**
 * Enterprise Modal Style Definitions (Module 8 - Step 8.9).
 *
 * All values sourced from the MUI theme — no hardcoded colours or magic numbers.
 */

/** Applied to the DialogTitle root to align the title and close button. */
export const modalHeaderSx: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  pr: 1,
};

/** Applied to the DialogContent to ensure comfortable inner padding. */
export const modalBodySx: SxProps<Theme> = {
  pt: 1,
};

/** Applied to the DialogActions footer row. */
export const modalFooterSx: SxProps<Theme> = {
  px: 3,
  pb: 2,
  gap: 1,
};

/** Applied to the close IconButton in the header. */
export const modalCloseButtonSx: SxProps<Theme> = {
  color: 'text.secondary',
  flexShrink: 0,
};
