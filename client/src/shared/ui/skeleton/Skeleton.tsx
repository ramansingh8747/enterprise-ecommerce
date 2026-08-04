import React from 'react';
import MuiSkeleton from '@mui/material/Skeleton';
import Box from '@mui/material/Box';
import type { SxProps, Theme } from '@mui/material';
import type { ISkeletonProps } from './Skeleton.types';
import {
  forceRoundedSx,
  repeatedContainerSx,
  skeletonFullWidthSx,
  skeletonRootSx,
  textRowContainerSx,
  variantStyles,
} from './Skeleton.styles';

/**
 * Combines multiple SxProps into a single style object.
 */
const combineSx = (...parts: Array<SxProps<Theme> | undefined>): SxProps<Theme> =>
  Object.assign({}, ...parts.filter((p): p is SxProps<Theme> => p !== undefined && p !== null));

/**
 * Enterprise Shared Skeleton Component (Module 8 - Step 8.18).
 *
 * Wraps MUI Skeleton to act as loading placeholder. Supports multi-row text lists,
 * layout repetition, and customizable shapes.
 */
const Skeleton = React.forwardRef<HTMLDivElement, ISkeletonProps>(
  (
    {
      variant = 'text',
      animation = 'pulse',
      width,
      height,
      rows = 1,
      rounded = false,
      fullWidth = false,
      repeat = 1,
      sx,
    },
    ref
  ) => {
    // 1. Handle duplication repeat layout
    if (repeat > 1) {
      return (
        <Box ref={ref} sx={repeatedContainerSx}>
          {Array.from({ length: repeat }).map((_, index) => (
            <Skeleton
              key={index}
              variant={variant}
              animation={animation}
              rows={rows}
              rounded={rounded}
              fullWidth={fullWidth}
              {...(width !== undefined ? { width } : {})}
              {...(height !== undefined ? { height } : {})}
              {...(sx !== undefined ? { sx } : {})}
            />
          ))}
        </Box>
      );
    }

    // Combine base styles
    const skeletonSx = combineSx(
      skeletonRootSx,
      variantStyles[variant],
      rounded ? forceRoundedSx : undefined,
      fullWidth ? skeletonFullWidthSx : undefined,
      sx
    );

    // 2. Handle text multi-row rendering
    if (variant === 'text' && rows > 1) {
      return (
        <Box ref={ref} sx={textRowContainerSx}>
          {Array.from({ length: rows }).map((_, index) => {
            const isLast = index === rows - 1;
            // The last row is rendered shorter to feel like a real paragraph block
            const rowWidth = isLast ? '65%' : (width ?? '100%');
            return (
              <MuiSkeleton
                key={index}
                variant="text"
                {...(animation !== undefined && animation !== false ? { animation } : {})}
                {...(!fullWidth && rowWidth !== undefined ? { width: rowWidth } : {})}
                {...(height !== undefined ? { height } : {})}
                sx={skeletonSx}
              />
            );
          })}
        </Box>
      );
    }

    // 3. Render single generic skeleton block
    return (
      <MuiSkeleton
        ref={ref}
        {...(variant !== undefined ? { variant } : {})}
        {...(animation !== undefined && animation !== false ? { animation } : {})}
        {...(!fullWidth && width !== undefined ? { width } : {})}
        {...(height !== undefined ? { height } : {})}
        sx={skeletonSx}
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';

export default Skeleton;
export { Skeleton };
