import type { SxProps, Theme } from '@mui/material';

/**
 * Enterprise Dialog Style Definitions (Module 8 - Step 8.10).
 *
 * All values sourced from the MUI theme — no hardcoded colours or magic numbers.
 */

/** Applied to the DialogTitle root for consistent header padding. */
export const dialogHeaderSx: SxProps<Theme> = {
  pb: 1,
};

/** Applied to the icon wrapper above the title. */
export const dialogIconWrapperSx: SxProps<Theme> = {
  display: 'flex',
  justifyContent: 'center',
  pt: 2.5,
  pb: 0.5,
};

/** Applied to the severity icon itself — size driven by theme. */
export const dialogIconSx: SxProps<Theme> = {
  fontSize: '2.5rem',
};

/** Applied to the DialogContent container. */
export const dialogContentSx: SxProps<Theme> = {
  textAlign: 'center',
  pt: 0.5,
};

/** Applied to the message Typography paragraph. */
export const dialogMessageSx: SxProps<Theme> = {
  color: 'text.secondary',
};

/** Applied to the DialogActions footer. */
export const dialogActionsSx: SxProps<Theme> = {
  justifyContent: 'center',
  px: 3,
  pb: 3,
  gap: 1,
};
