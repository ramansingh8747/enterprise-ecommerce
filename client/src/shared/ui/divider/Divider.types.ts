import type { DividerProps as MuiDividerProps } from '@mui/material/Divider';

/** Spacing presets applied above and below (or left and right) of the Divider. */
export type DividerSpacing = 'none' | 'small' | 'medium' | 'large';

/** Custom colored borders using theme presets. */
export type DividerColorVariant = 'default' | 'primary' | 'secondary' | 'light';

/**
 * Enterprise Divider Component Types (Module 8 - Step 8.16).
 *
 * Exposes standardized layout properties while matching Material UI Divider.
 */
export interface IDividerProps
  extends Pick<
    MuiDividerProps,
    | 'orientation'
    | 'variant'
    | 'flexItem'
    | 'light'
    | 'textAlign'
    | 'sx'
  > {
  /** Optional text content rendered inside the divider. */
  children?: React.ReactNode;
  /** Margins/padding surrounding the separator line. Defaults to 'none'. */
  spacing?: DividerSpacing;
  /** Border color variation matching brand layout. Defaults to 'default'. */
  colorVariant?: DividerColorVariant;
}
