import type { SxProps, Theme } from '@mui/material';

/**
 * Enterprise Snackbar Style Definitions (Module 8 - Step 8.22).
 *
 * Spacing, typography, and shadow properties align with the MUI theme.
 */

export const snackbarRootSx: SxProps<Theme> = {};

/** Stylings applied directly to the internal Alert component inside the Snackbar. */
export const snackbarAlertSx: SxProps<Theme> = {
  width: '100%',
  alignItems: 'center',
  boxShadow: (theme) => theme.shadows[3],
  '& .MuiAlert-message': {
    fontSize: '0.875rem',
    fontWeight: 500,
  },
  '& .MuiAlert-icon': {
    fontSize: '1.25rem',
  },
};

/** Styles applied to the action slot inside the alert. */
export const snackbarActionSx: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  gap: 1,
};

/** Adjustments when in loading state. */
export const snackbarLoadingSx: SxProps<Theme> = {
  opacity: 0.85,
  pointerEvents: 'none',
};
