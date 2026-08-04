import type { ChipProps as MuiChipProps } from '@mui/material/Chip';

/** Strongly typed status categories for status tags/badges. */
export type ChipStatus = 'success' | 'warning' | 'error' | 'info' | 'neutral';

/**
 * Enterprise Chip Component Types (Module 8 - Step 8.14).
 *
 * Safe subset of Material UI ChipProps is inherited to avoid exactOptionalPropertyTypes
 * conflicts with optional/required properties.
 */
export interface IChipProps
  extends Pick<
    MuiChipProps,
    | 'avatar'
    | 'icon'
    | 'deleteIcon'
    | 'clickable'
    | 'disabled'
    | 'sx'
    | 'onClick'
    | 'onDelete'
  > {
  /** The text/content rendered inside the Chip. */
  label: React.ReactNode;
  /** Primary MUI theme color. Overridden if 'status' is specified. */
  color?: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  /** Styling variant of the Chip. Defaults to 'filled'. */
  variant?: 'filled' | 'outlined';
  /** Size token. Defaults to 'medium'. */
  size?: 'small' | 'medium';
  /** Enterprise status category. Overrides color with preset theme styles. */
  status?: ChipStatus;
  /** Enforces fully rounded circle/pill shape. Defaults to true. */
  rounded?: boolean;
  /** Disables click actions and displays a miniature loading circular progress. */
  loading?: boolean;
}
