import type { BadgeProps as MuiBadgeProps } from '@mui/material/Badge';

/**
 * Strongly typed status union for status-based indicator badges.
 */
export type BadgeStatus = 'success' | 'warning' | 'error' | 'info' | 'neutral';

/**
 * Enterprise Badge Component Types (Module 8 - Step 8.13).
 *
 * Props are defined to map cleanly to Material UI Badge while supporting
 * custom enterprise additions like status indicator modes.
 */
export interface IBadgeProps
  extends Pick<
    MuiBadgeProps,
    | 'invisible'
    | 'max'
    | 'showZero'
    | 'overlap'
    | 'anchorOrigin'
    | 'sx'
  > {
  /** The element wrapping the badge. */
  children?: React.ReactNode;
  /** Content rendered inside the badge (text or number). */
  content?: React.ReactNode;
  /** MUI badge variant. Standard (badge content) or dot (small circle indicator). */
  variant?: 'standard' | 'dot';
  /** Color theme of the badge. */
  color?: 'primary' | 'secondary' | 'default' | 'error' | 'info' | 'success' | 'warning';
  /** Visual size of the badge. */
  size?: 'small' | 'medium';
  /** Enterprise status category. Overrides color with preset status palettes when set. */
  status?: BadgeStatus;
  /** Shortcut helper to set variant to "dot". */
  dot?: boolean;
  /** When true, renders a fully rounded/circular pill-shaped badge. */
  rounded?: boolean;
}
