import type { SxProps, Theme } from '@mui/material';
import type { CardPaddingSize } from './Card.types';

/**
 * Enterprise Card Style Definitions (Module 8 - Step 8.11).
 *
 * All values sourced from the MUI theme spacing scale — no hardcoded values.
 */

/** Maps CardPaddingSize token to a theme spacing value for CardContent. */
const PADDING_MAP: Record<CardPaddingSize, number> = {
  none: 0,
  small: 1,
  medium: 2,
  large: 3,
};

/** Returns the sx for CardContent based on the active padding token. */
export const getCardContentSx = (padding: CardPaddingSize): SxProps<Theme> => ({
  p: PADDING_MAP[padding],
  '&:last-child': { pb: PADDING_MAP[padding] },
});

/** Applied to the root MUI Card when fullHeight is true. */
export const cardFullHeightSx: SxProps<Theme> = {
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
};

/** Applied to the root MUI Card when fullWidth is true. */
export const cardFullWidthSx: SxProps<Theme> = {
  width: '100%',
};

/** Applied to the root MUI Card when clickable is true. */
export const cardClickableSx: SxProps<Theme> = {
  cursor: 'pointer',
  transition: (theme) =>
    theme.transitions.create(['box-shadow', 'border-color'], {
      duration: theme.transitions.duration.short,
    }),
  '&:hover': {
    boxShadow: (theme) => theme.shadows[4],
  },
  '&:focus-visible': {
    outline: (theme) => `2px solid ${theme.palette.primary.main}`,
    outlineOffset: '2px',
  },
};

/** Applied to the CardHeader root for consistent density. */
export const cardHeaderSx: SxProps<Theme> = {
  pb: 0,
};

/** Applied to the CardContent when loading to indicate disabled state. */
export const cardLoadingSx: SxProps<Theme> = {
  opacity: 0.5,
  pointerEvents: 'none',
};

/** Applied to the CardActions footer. */
export const cardFooterSx: SxProps<Theme> = {
  px: 2,
  pb: 2,
};
