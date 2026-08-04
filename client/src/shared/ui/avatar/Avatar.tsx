import React from 'react';
import MuiAvatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import Skeleton from '@mui/material/Skeleton';
import type { SxProps, Theme } from '@mui/material';
import type { IAvatarProps } from './Avatar.types';
import {
  avatarLoadingSx,
  avatarRootSx,
  borderedSx,
  generalBadgeSx,
  getStatusBadgeSx,
  sizeStyles,
} from './Avatar.styles';

/**
 * Combines multiple SxProps into a single style object.
 */
const combineSx = (...parts: Array<SxProps<Theme> | undefined>): SxProps<Theme> =>
  Object.assign({}, ...parts.filter((p): p is SxProps<Theme> => p !== undefined && p !== null));

/**
 * Extracts up to two uppercase initials from a name string.
 */
const getInitials = (name: string): string => {
  const cleanName = name.trim();
  if (!cleanName) return '';
  const parts = cleanName.split(/\s+/);
  const first = parts[0] ?? '';
  if (parts.length === 1) return first.substring(0, 2).toUpperCase();
  const last = parts[parts.length - 1] ?? '';
  return (first.charAt(0) + last.charAt(0)).toUpperCase();
};

/**
 * Enterprise Shared Avatar Component (Module 8 - Step 8.15).
 *
 * Composes MUI Avatar + Badge to render user/entity profile photos, initials,
 * or status indicators. Features customizable shapes, sizes, bordered options,
 * and circular ripples for active online users.
 */
const Avatar = React.forwardRef<HTMLDivElement, IAvatarProps>(
  (
    {
      src,
      alt,
      children,
      size = 'md',
      shape = 'circular',
      loading = false,
      fallbackText,
      bordered = false,
      badge,
      status,
      sx,
    },
    ref
  ) => {
    // Determine shape variant mapping to MUI Avatar shape variant
    const resolvedVariant = shape === 'circular' ? 'circular' : (shape === 'square' ? 'square' : 'rounded');

    if (loading) {
      const sizeStyle = sizeStyles[size] as Record<string, number | string>;
      const skeletonVariant = shape === 'circular' ? 'circular' : 'rectangular';
      const borderRadius = shape === 'rounded' ? '4px' : undefined;

      return (
        <Skeleton
          variant={skeletonVariant}
          sx={combineSx(
            sizeStyle,
            borderRadius !== undefined ? { borderRadius } : undefined,
            avatarLoadingSx,
            sx
          )}
        />
      );
    }

    // Resolve initials fallback if src fails or is missing
    const hasInitialsFallback = !src && fallbackText;
    const resolvedContent = hasInitialsFallback ? getInitials(fallbackText) : (children ?? alt?.charAt(0));

    // Combine styling classes
    const avatarSx = combineSx(
      avatarRootSx,
      sizeStyles[size],
      bordered ? borderedSx : undefined,
      sx
    );

    const avatarElement = (
      <MuiAvatar
        ref={ref}
        variant={resolvedVariant}
        sx={avatarSx}
        {...(src !== undefined ? { src } : {})}
        {...(alt !== undefined ? { alt } : {})}
      >
        {resolvedContent}
      </MuiAvatar>
    );

    // Overlay status or custom badge if specified
    if (status !== undefined) {
      return (
        <Badge
          overlap={shape === 'circular' ? 'circular' : 'rectangular'}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          variant="dot"
          sx={getStatusBadgeSx(status)}
        >
          {avatarElement}
        </Badge>
      );
    }

    if (badge !== undefined) {
      return (
        <Badge
          overlap={shape === 'circular' ? 'circular' : 'rectangular'}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          sx={generalBadgeSx}
          badgeContent={badge}
        >
          {avatarElement}
        </Badge>
      );
    }

    return avatarElement;
  }
);

Avatar.displayName = 'Avatar';

export default Avatar;
export { Avatar };
