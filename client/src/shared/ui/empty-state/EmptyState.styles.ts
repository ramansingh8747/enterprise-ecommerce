import type { SxProps, Theme } from '@mui/material';

/**
 * Enterprise EmptyState Style Definitions (Module 8 - Step 8.23).
 *
 * Spacing, alignments, and branding tokens align with the MUI theme.
 */

export const emptyStateRootSx: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  padding: 3,
};

/** Stack layout formatting content lines together. */
export const emptyStateContainerSx: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  maxWidth: 420,
  width: '100%',
  gap: 2,
};

/** Formats the custom vector or image illustration bounds. */
export const emptyStateIllustrationSx: SxProps<Theme> = {
  maxHeight: 180,
  maxWidth: '100%',
  objectFit: 'contain',
  marginBottom: 1,
};

/** Icon style presets. */
export const emptyStateIconSx: SxProps<Theme> = {
  color: 'text.disabled',
  marginBottom: 1,
};

/** Header title positioning. */
export const emptyStateTitleSx: SxProps<Theme> = {
  fontWeight: 600,
};

/** Paragraph details width limiting. */
export const emptyStateDescriptionSx: SxProps<Theme> = {
  color: 'text.secondary',
  lineHeight: 1.5,
};

/** Spacing below content before rendering action button. */
export const emptyStateActionSx: SxProps<Theme> = {
  marginTop: 1,
};

/** Centers the layout box vertically and horizontally. */
export const emptyStateCenteredSx: SxProps<Theme> = {
  alignItems: 'center',
  justifyContent: 'center',
};

/** Stretches the block height to fill the parent. */
export const emptyStateFullHeightSx: SxProps<Theme> = {
  height: '100%',
  minHeight: 320,
  flex: 1,
};
