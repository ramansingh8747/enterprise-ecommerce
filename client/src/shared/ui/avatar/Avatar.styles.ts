import type { SxProps, Theme } from '@mui/material';
import type { AvatarSize, AvatarStatus } from './Avatar.types';

/**
 * Enterprise Avatar Style Definitions (Module 8 - Step 8.15).
 *
 * All sizing, spacing, borders, and colors are integrated with the MUI theme.
 */

export const avatarRootSx: SxProps<Theme> = {};

/** Sizing values mapping AvatarSize to dimensions. */
export const sizeStyles: Record<AvatarSize, SxProps<Theme>> = {
  xs: { width: 24, height: 24, fontSize: '0.75rem' },
  sm: { width: 32, height: 32, fontSize: '0.875rem' },
  md: { width: 40, height: 40, fontSize: '1rem' },
  lg: { width: 56, height: 56, fontSize: '1.25rem' },
  xl: { width: 72, height: 72, fontSize: '1.75rem' },
};

/** Bordered mode styling mapping sizes for thickness calibration. */
export const borderedSx: SxProps<Theme> = {
  border: (theme) => `2px solid ${theme.palette.background.paper}`,
  outline: (theme) => `2px solid ${theme.palette.primary.main}`,
};

/** Styles applied when in a loading state. */
export const avatarLoadingSx: SxProps<Theme> = {
  opacity: 0.8,
};

/** Presence color code indicators. */
const STATUS_COLORS: Record<AvatarStatus, string> = {
  online: 'success.main',
  offline: 'grey.400',
  away: 'warning.main',
  busy: 'error.main',
};

/**
 * Custom styling for the status badge dot.
 * Adjusts size, borders, and animations based on avatar status.
 */
export const getStatusBadgeSx = (status: AvatarStatus): SxProps<Theme> => ({
  '& .MuiBadge-badge': {
    backgroundColor: STATUS_COLORS[status],
    color: STATUS_COLORS[status],
    boxShadow: (theme) => `0 0 0 2px ${theme.palette.background.paper}`,
    '&::after': status === 'online' ? {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      animation: 'ripple 1.2s infinite ease-in-out',
      border: '1px solid currentColor',
      content: '""',
    } : undefined,
  },
  '@keyframes ripple': {
    '0%': {
      transform: 'scale(.8)',
      opacity: 1,
    },
    '100%': {
      transform: 'scale(2.4)',
      opacity: 0,
    },
  },
});

/** Styling applied to a standard generic badge overlay on the avatar. */
export const generalBadgeSx: SxProps<Theme> = {
  '& .MuiBadge-badge': {
    boxShadow: (theme) => `0 0 0 2px ${theme.palette.background.paper}`,
  },
};
