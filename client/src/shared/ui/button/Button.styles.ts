import type { SxProps, Theme } from '@mui/material';

/**
 * Enterprise Button Style Definitions (Module 8 - Step 8.2).
 *
 * All values are sourced from the MUI theme — no hardcoded colors or magic numbers.
 */

export const buttonLoadingContainerSx: SxProps<Theme> = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: (theme) => theme.spacing(1),
};

export const buttonSpinnerSx: SxProps<Theme> = {
  color: 'inherit',
};
