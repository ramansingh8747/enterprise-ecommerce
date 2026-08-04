import type { SxProps, Theme } from '@mui/material';
import type { IconSize, IconColor } from './Icon.types';

/**
 * Enterprise Icon Style Definitions (Module 8 - Step 8.20).
 *
 * All values are integrated with the MUI theme.
 */

export const iconRootSx: SxProps<Theme> = {
  display: 'inline-block',
  flexShrink: 0,
};

/** Sizing mapping IconSize to font size values. */
export const sizeStyles: Record<IconSize, SxProps<Theme>> = {
  xs: { fontSize: '1rem' }, // 16px
  sm: { fontSize: '1.25rem' }, // 20px
  md: { fontSize: '1.5rem' }, // 24px
  lg: { fontSize: '2rem' }, // 32px
  xl: { fontSize: '2.5rem' }, // 40px
};

/** Color mapping IconColor to theme color variables. */
export const colorStyles: Record<IconColor, SxProps<Theme>> = {
  primary: { color: 'primary.main' },
  secondary: { color: 'secondary.main' },
  success: { color: 'success.main' },
  warning: { color: 'warning.main' },
  error: { color: 'error.main' },
  info: { color: 'info.main' },
  inherit: { color: 'inherit' },
  disabled: { color: 'action.disabled' },
};

/** Clickable styles with hover and scale tap response. */
export const iconClickableSx: SxProps<Theme> = {
  cursor: 'pointer',
  transition: (theme) =>
    theme.transitions.create(['transform', 'opacity'], {
      duration: theme.transitions.duration.shortest,
    }),
  '&:hover': {
    opacity: 0.85,
  },
  '&:active': {
    transform: 'scale(0.92)',
  },
};

/** Disabled styles blocking actions. */
export const iconDisabledSx: SxProps<Theme> = {
  opacity: 0.4,
  pointerEvents: 'none',
};

/** Continuous 360-degree spinning animation. */
export const iconSpinSx: SxProps<Theme> = {
  animation: 'spin-kf 2s linear infinite',
  '@keyframes spin-kf': {
    '0%': {
      transform: 'rotate(0deg)',
    },
    '100%': {
      transform: 'rotate(360deg)',
    },
  },
};
