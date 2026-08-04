import type { SxProps, Theme } from '@mui/material';
import type { ErrorSeverity } from './ErrorState.types';

/**
 * Enterprise ErrorState Style Definitions (Module 8 - Step 8.24).
 *
 * Spacing, alignments, and branding tokens align with the MUI theme.
 */

export const errorStateRootSx: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  padding: 3,
};

/** Stack layout formatting content lines together. */
export const errorStateContainerSx: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  maxWidth: 420,
  width: '100%',
  gap: 2,
};

/** Formats the custom vector or image illustration bounds. */
export const errorStateIllustrationSx: SxProps<Theme> = {
  maxHeight: 180,
  maxWidth: '100%',
  objectFit: 'contain',
  marginBottom: 1,
};

/** Base icon style adjustments. */
export const errorStateIconSx: SxProps<Theme> = {
  marginBottom: 1,
};

/** Header title positioning. */
export const errorStateTitleSx: SxProps<Theme> = {
  fontWeight: 600,
};

/** Paragraph details width limiting. */
export const errorStateDescriptionSx: SxProps<Theme> = {
  color: 'text.secondary',
  lineHeight: 1.5,
};

/** Monospace system error code formatting. */
export const errorStateCodeSx: SxProps<Theme> = {
  fontFamily: 'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
  fontSize: '0.75rem',
  color: 'text.secondary',
  backgroundColor: 'action.hover',
  padding: '4px 8px',
  borderRadius: '4px',
  border: (theme) => `1px solid ${theme.palette.divider}`,
  letterSpacing: '0.05em',
  wordBreak: 'break-all',
};

/** Spacing below content before rendering action button. */
export const errorStateActionSx: SxProps<Theme> = {
  marginTop: 1,
};

/** Centers the layout box vertically and horizontally. */
export const errorStateCenteredSx: SxProps<Theme> = {
  alignItems: 'center',
  justifyContent: 'center',
};

/** Stretches the block height to fill the parent. */
export const errorStateFullHeightSx: SxProps<Theme> = {
  height: '100%',
  minHeight: 320,
  flex: 1,
};

/** Maps ErrorSeverity to visual accent colors inside the theme. */
export const severityColorStyles: Record<ErrorSeverity, SxProps<Theme>> = {
  info: {
    color: 'info.main',
  },
  warning: {
    color: 'warning.main',
  },
  error: {
    color: 'error.main',
  },
  critical: {
    color: 'error.dark',
    fontWeight: 'bold',
  },
};
