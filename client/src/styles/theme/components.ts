import type { Components, Theme } from '@mui/material/styles';
import { BORDER_TOKENS } from '../tokens/border.tokens';
import { SHADOW_TOKENS } from '../tokens/shadows.tokens';
import { TRANSITION_TOKENS } from '../tokens/transitions.tokens';

/**
 * Enterprise Material UI Component Overrides (Module 3 - Step 3.2).
 *
 * Configures default props and global style overrides for core MUI components.
 */
export const componentsOptions: Components<Omit<Theme, 'components'>> = {
  MuiButton: {
    defaultProps: {
      disableElevation: true,
      size: 'medium',
    },
    styleOverrides: {
      root: {
        borderRadius: BORDER_TOKENS.radius.lg,
        padding: '8px 16px',
        transition: `all ${TRANSITION_TOKENS.duration.fast} ${TRANSITION_TOKENS.easing.easeInOut}`,
      },
    },
  },
  MuiTextField: {
    defaultProps: {
      variant: 'outlined',
      size: 'medium',
      fullWidth: true,
    },
  },
  MuiCard: {
    defaultProps: {
      elevation: 0,
    },
    styleOverrides: {
      root: {
        borderRadius: BORDER_TOKENS.radius.xl,
        boxShadow: SHADOW_TOKENS.sm,
        border: `1px solid ${BORDER_TOKENS.width.thin} #e2e8f0`,
      },
    },
  },
  MuiPaper: {
    defaultProps: {
      elevation: 0,
    },
    styleOverrides: {
      rounded: {
        borderRadius: BORDER_TOKENS.radius.xl,
      },
    },
  },
  MuiDialog: {
    styleOverrides: {
      paper: {
        borderRadius: BORDER_TOKENS.radius['2xl'],
        boxShadow: SHADOW_TOKENS.xl,
      },
    },
  },
  MuiTooltip: {
    defaultProps: {
      arrow: true,
    },
    styleOverrides: {
      tooltip: {
        borderRadius: BORDER_TOKENS.radius.md,
        fontSize: '0.75rem',
      },
    },
  },
  MuiSnackbar: {
    defaultProps: {
      autoHideDuration: 5000,
    },
  },
};
