import React from 'react';
import MuiChip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import type { SxProps, Theme } from '@mui/material';
import type { IChipProps } from './Chip.types';
import {
  chipLoadingSx,
  chipRootSx,
  chipRoundedSx,
  statusFilledStyles,
  statusOutlinedStyles,
} from './Chip.styles';

/**
 * Combines multiple SxProps into a single style object.
 */
const combineSx = (...parts: Array<SxProps<Theme> | undefined>): SxProps<Theme> =>
  Object.assign({}, ...parts.filter((p): p is SxProps<Theme> => p !== undefined && p !== null));

/**
 * Enterprise Shared Chip Component (Module 8 - Step 8.14).
 *
 * Wraps MUI Chip as standardized tag, filter, and label element.
 * Supports status indicator coloring, circular/square rounded options,
 * and loading states with built-in accessibility.
 */
const Chip = React.forwardRef<HTMLDivElement, IChipProps>(
  (
    {
      label,
      avatar,
      icon,
      deleteIcon,
      clickable,
      disabled = false,
      color,
      variant = 'filled',
      size = 'medium',
      status,
      rounded = true,
      loading = false,
      onClick,
      onDelete,
      sx,
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    // Use a small spinner as the icon if the chip is in a loading state
    const resolvedIcon = loading ? (
      <CircularProgress size={14} thickness={5} color="inherit" />
    ) : (
      icon
    );

    // Build conditional chip style rules
    const statusThemeStyles =
      status !== undefined
        ? variant === 'outlined'
          ? statusOutlinedStyles[status]
          : statusFilledStyles[status]
        : undefined;

    const chipSx = combineSx(
      chipRootSx,
      chipRoundedSx(rounded),
      loading ? chipLoadingSx : undefined,
      statusThemeStyles,
      sx
    );

    return (
      <MuiChip
        ref={ref}
        label={label}
        variant={variant}
        size={size}
        disabled={isDisabled}
        {...(color !== undefined && status === undefined ? { color } : {})}
        {...(avatar !== undefined && !loading ? { avatar } : {})}
        {...(resolvedIcon !== undefined ? { icon: resolvedIcon } : {})}
        {...(deleteIcon !== undefined ? { deleteIcon } : {})}
        {...(clickable !== undefined ? { clickable } : {})}
        {...(onClick !== undefined ? { onClick } : {})}
        {...(onDelete !== undefined && !loading ? { onDelete } : {})}
        sx={chipSx}
      />
    );
  }
);

Chip.displayName = 'Chip';

export default Chip;
export { Chip };
