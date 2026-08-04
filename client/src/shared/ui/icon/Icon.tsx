import React from 'react';
import type { SxProps, Theme } from '@mui/material';
import { iconRegistry } from './icon-registry';
import type { IIconProps } from './Icon.types';
import {
  colorStyles,
  iconClickableSx,
  iconDisabledSx,
  iconRootSx,
  iconSpinSx,
  sizeStyles,
} from './Icon.styles';

/**
 * Combines multiple SxProps into a single style object.
 */
const combineSx = (...parts: Array<SxProps<Theme> | undefined>): SxProps<Theme> =>
  Object.assign({}, ...parts.filter((p): p is SxProps<Theme> => p !== undefined && p !== null));

/**
 * Enterprise Shared Icon Component (Module 8 - Step 8.20).
 *
 * Renders SVG icons resolved from a centralized registry. Supports layout sizing,
 * theme coloring, spinning loaders, and pointer tap interactions.
 */
const Icon = React.forwardRef<SVGSVGElement, IIconProps>(
  (
    {
      name,
      size = 'md',
      color = 'inherit',
      titleAccess,
      spin = false,
      disabled = false,
      clickable = false,
      onClick,
      sx,
    },
    ref
  ) => {
    // Resolve icon component from typesafe registry
    const RegisteredIcon = iconRegistry[name];

    // Gracefully handle missing icons in the registry
    if (RegisteredIcon === undefined) {
      const FallbackIcon = iconRegistry.warning;
      const fallbackSx = combineSx(iconRootSx, sizeStyles[size], sx);

      return (
        <FallbackIcon
          ref={ref}
          color="error"
          sx={fallbackSx}
          {...(titleAccess !== undefined ? { titleAccess } : { titleAccess: 'Warning: Icon not found' })}
        />
      );
    }

    const isClickable = clickable || onClick !== undefined;
    const isDisabled = disabled;

    // Combine structural design classes
    const iconSx = combineSx(
      iconRootSx,
      sizeStyles[size],
      colorStyles[color],
      isClickable ? iconClickableSx : undefined,
      isDisabled ? iconDisabledSx : undefined,
      spin ? iconSpinSx : undefined,
      sx
    );

    return (
      <RegisteredIcon
        ref={ref}
        sx={iconSx}
        {...(titleAccess !== undefined ? { titleAccess } : {})}
        {...(onClick !== undefined && !isDisabled ? { onClick } : {})}
      />
    );
  }
);

Icon.displayName = 'Icon';

export default Icon;
export { Icon };
