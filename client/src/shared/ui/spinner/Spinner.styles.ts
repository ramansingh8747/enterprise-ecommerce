import type { SxProps, Theme } from '@mui/material';

/**
 * Enterprise Spinner Style Definitions (Module 8 - Step 8.17).
 *
 * All layouts, margins, colors, and overlays are integrated with the MUI theme.
 */

export const spinnerRootSx: SxProps<Theme> = {};

/** Centers the spinner inside its relative block. */
export const spinnerCenteredSx: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  height: '100%',
  minHeight: 150,
};

/** Dark/light translucent backdrop container overlay. */
export const spinnerOverlaySx: SxProps<Theme> = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: (theme) =>
    theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.7)',
  zIndex: 10,
};

/** Full viewport fixed modal backdrop indicator. */
export const spinnerFullScreenSx: SxProps<Theme> = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: (theme) =>
    theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.75)' : 'rgba(255, 255, 255, 0.85)',
  zIndex: 1400, // higher than app bars and modal overlays
};

/** Stacked layout to bundle spinner and description text together. */
export const spinnerContainerSx: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 1.5,
};

/** Subtext message displayed below the loading spinner. */
export const spinnerMessageSx: SxProps<Theme> = {
  color: 'text.secondary',
  fontWeight: 500,
  textAlign: 'center',
};
