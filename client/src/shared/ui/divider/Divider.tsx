import React from 'react';
import MuiDivider from '@mui/material/Divider';
import type { SxProps, Theme } from '@mui/material';
import type { IDividerProps } from './Divider.types';
import {
  colorVariantStyles,
  dividerRootSx,
  dividerTextSx,
  getSpacingSx,
} from './Divider.styles';

/**
 * Combines multiple SxProps into a single style object.
 */
const combineSx = (...parts: Array<SxProps<Theme> | undefined>): SxProps<Theme> =>
  Object.assign({}, ...parts.filter((p): p is SxProps<Theme> => p !== undefined && p !== null));

/**
 * Enterprise Shared Divider Component (Module 8 - Step 8.16).
 *
 * Separates sections of content horizontally or vertically with custom margins,
 * text overlays, and theme-driven color variations.
 */
const Divider = React.forwardRef<HTMLHRElement, IDividerProps>(
  (
    {
      children,
      orientation = 'horizontal',
      variant,
      flexItem,
      light,
      textAlign,
      spacing = 'none',
      colorVariant = 'default',
      sx,
    },
    ref
  ) => {
    // Resolve margins and color accents
    const spacingSx = getSpacingSx(spacing, orientation);
    const colorSx = colorVariantStyles[colorVariant];
    const textSx = children !== undefined ? dividerTextSx : undefined;

    const dividerSx = combineSx(
      dividerRootSx,
      spacingSx,
      colorSx,
      textSx,
      sx
    );

    return (
      <MuiDivider
        ref={ref}
        orientation={orientation}
        {...(variant !== undefined ? { variant } : {})}
        {...(flexItem !== undefined ? { flexItem } : {})}
        {...(light !== undefined ? { light } : {})}
        {...(textAlign !== undefined ? { textAlign } : {})}
        sx={dividerSx}
      >
        {children}
      </MuiDivider>
    );
  }
);

Divider.displayName = 'Divider';

export default Divider;
export { Divider };
