import React from 'react';
import MuiBadge from '@mui/material/Badge';
import type { SxProps, Theme } from '@mui/material';
import type { IBadgeProps } from './Badge.types';
import {
  badgeRootSx,
  statusStyles,
  badgeSmallSx,
  badgeRoundedSx,
} from './Badge.styles';

/**
 * Combines multiple SxProps into a single style object.
 */
const combineSx = (...parts: Array<SxProps<Theme> | undefined>): SxProps<Theme> =>
  Object.assign({}, ...parts.filter((p): p is SxProps<Theme> => p !== undefined && p !== null));

/**
 * Enterprise Shared Badge Component (Module 8 - Step 8.13).
 *
 * Wraps MUI Badge to act as standard notification and status indicator across
 * the application. Supports numeric badges, dot badges, status variants,
 * custom content, and sizing.
 */
const Badge = React.forwardRef<HTMLSpanElement, IBadgeProps>(
  (
    {
      children,
      content,
      variant,
      color,
      size = 'medium',
      invisible = false,
      max,
      showZero = false,
      overlap,
      anchorOrigin,
      status,
      dot = false,
      rounded = false,
      sx,
    },
    ref
  ) => {
    // Resolve variant based on shortcut 'dot' prop or variant prop
    const resolvedVariant = dot ? 'dot' : (variant ?? 'standard');

    // Combine custom enterprise styles with standard MUI sx
    const badgeSx = combineSx(
      badgeRootSx,
      size === 'small' ? badgeSmallSx : undefined,
      rounded ? badgeRoundedSx : undefined,
      status !== undefined ? statusStyles[status] : undefined,
      sx
    );

    return (
      <MuiBadge
        ref={ref}
        badgeContent={content}
        variant={resolvedVariant}
        {...(color !== undefined ? { color } : {})}
        {...(invisible !== undefined ? { invisible } : {})}
        {...(max !== undefined ? { max } : {})}
        {...(showZero !== undefined ? { showZero } : {})}
        {...(overlap !== undefined ? { overlap } : {})}
        {...(anchorOrigin !== undefined ? { anchorOrigin } : {})}
        sx={badgeSx}
      >
        {children}
      </MuiBadge>
    );
  }
);

Badge.displayName = 'Badge';

export default Badge;
export { Badge };
