import type { AvatarProps as MuiAvatarProps } from '@mui/material/Avatar';

/** Size categories for the Avatar. */
export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/** Structural shape of the Avatar. */
export type AvatarShape = 'circular' | 'rounded' | 'square';

/** Presence/status indication for the user. */
export type AvatarStatus = 'online' | 'offline' | 'away' | 'busy';

/**
 * Enterprise Avatar Component Types (Module 8 - Step 8.15).
 *
 * Defines a clean, typesafe prop contract preventing exactOptionalPropertyTypes
 * issues with standard MUI props.
 */
export interface IAvatarProps
  extends Pick<
    MuiAvatarProps,
    | 'src'
    | 'alt'
    | 'sx'
  > {
  /** The content of the avatar (e.g. initials or an icon). */
  children?: React.ReactNode;
  /** Size token. Defaults to 'md'. */
  size?: AvatarSize;
  /** Structural shape layout of the avatar. Defaults to 'circular'. */
  shape?: AvatarShape;
  /** Displays a miniature Skeleton placeholder instead of the avatar content. */
  loading?: boolean;
  /** fallback text to generate initials from if src image fails to load. */
  fallbackText?: string;
  /** Applies a styled visual border around the avatar. */
  bordered?: boolean;
  /** Custom badge element rendered as overlay (e.g. notification count). */
  badge?: React.ReactNode;
  /** Renders a colored status indicator badge. Takes precedence over custom badge. */
  status?: AvatarStatus;
}
