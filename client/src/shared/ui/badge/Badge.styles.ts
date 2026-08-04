import type { SxProps, Theme } from '@mui/material';
import type { BadgeStatus } from './Badge.types';

/**
 * Enterprise Badge Style Definitions (Module 8 - Step 8.13).
 *
 * All values are integrated with the MUI theme.
 */

export const badgeRootSx: SxProps<Theme> = {};

/** Maps BadgeStatus to background and text colors from the theme. */
export const statusStyles: Record<BadgeStatus, SxProps<Theme>> = {
  success: {
    '& .MuiBadge-badge': {
      backgroundColor: 'success.main',
      color: 'success.contrastText',
    },
  },
  warning: {
    '& .MuiBadge-badge': {
      backgroundColor: 'warning.main',
      color: 'warning.contrastText',
    },
  },
  error: {
    '& .MuiBadge-badge': {
      backgroundColor: 'error.main',
      color: 'error.contrastText',
    },
  },
  info: {
    '& .MuiBadge-badge': {
      backgroundColor: 'info.main',
      color: 'info.contrastText',
    },
  },
  neutral: {
    '& .MuiBadge-badge': {
      backgroundColor: 'grey.500',
      color: '#fff',
    },
  },
};

/** Styles applied for smaller sized badges. */
export const badgeSmallSx: SxProps<Theme> = {
  '& .MuiBadge-badge': {
    height: 16,
    minWidth: 16,
    fontSize: '0.625rem',
    padding: '0 4px',
  },
};

/** Styles to enforce standard circular/rounded shape for pill-style badges. */
export const badgeRoundedSx: SxProps<Theme> = {
  '& .MuiBadge-badge': {
    borderRadius: '10px',
  },
};
