import React from 'react';
import MuiTypography from '@mui/material/Typography';
import type { SxProps, Theme } from '@mui/material';
import { Skeleton } from '../skeleton';
import type { ITypographyProps } from './Typography.types';
import {
  typographyLoadingSx,
  typographyRootSx,
  typographyTruncateSx,
  typographyUnselectableSx,
} from './Typography.styles';

/**
 * Combines multiple SxProps into a single style object.
 */
const combineSx = (...parts: Array<SxProps<Theme> | undefined>): SxProps<Theme> =>
  Object.assign({}, ...parts.filter((p): p is SxProps<Theme> => p !== undefined && p !== null));

/**
 * Enterprise Shared Typography Component (Module 8 - Step 8.19).
 *
 * Wraps MUI Typography to render text layers. Supports ellipsis truncation,
 * text select toggles, and placeholder loading skeletons.
 */
const Typography = React.forwardRef<HTMLElement, ITypographyProps>(
  (
    {
      children,
      variant = 'body1',
      component,
      color,
      align,
      gutterBottom,
      noWrap,
      paragraph,
      fontWeight,
      truncate = false,
      selectable = true,
      loading = false,
      sx,
    },
    ref
  ) => {
    // 1. Render Skeleton placeholder when loading is true
    if (loading) {
      return (
        <Skeleton
          variant="text"
          width="75%"
          sx={combineSx(typographyLoadingSx, sx)}
        />
      );
    }

    // Combine structural styling overrides
    const typographySx = combineSx(
      typographyRootSx,
      truncate ? typographyTruncateSx : undefined,
      !selectable ? typographyUnselectableSx : undefined,
      fontWeight !== undefined ? { fontWeight } : undefined,
      color !== undefined ? { color } : undefined,
      sx
    );

    return (
      <MuiTypography
        ref={ref}
        {...(variant !== undefined ? { variant } : {})}
        {...(component !== undefined ? { component } : {})}
        {...(align !== undefined ? { align } : {})}
        {...(gutterBottom !== undefined ? { gutterBottom } : {})}
        {...(noWrap !== undefined ? { noWrap } : {})}
        {...(paragraph !== undefined ? { paragraph } : {})}
        sx={typographySx}
      >
        {children}
      </MuiTypography>
    );
  }
);

Typography.displayName = 'Typography';

export default Typography;
export { Typography };
