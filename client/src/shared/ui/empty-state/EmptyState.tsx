import React from 'react';
import Box from '@mui/material/Box';
import type { SxProps, Theme } from '@mui/material';
import { Typography } from '../typography';
import { Icon } from '../icon';
import { Skeleton } from '../skeleton';
import type { IEmptyStateProps } from './EmptyState.types';
import {
  emptyStateActionSx,
  emptyStateCenteredSx,
  emptyStateContainerSx,
  emptyStateDescriptionSx,
  emptyStateFullHeightSx,
  emptyStateIconSx,
  emptyStateIllustrationSx,
  emptyStateRootSx,
  emptyStateTitleSx,
} from './EmptyState.styles';

/**
 * Combines multiple SxProps into a single style object.
 */
const combineSx = (...parts: Array<SxProps<Theme> | undefined>): SxProps<Theme> =>
  Object.assign({}, ...parts.filter((p): p is SxProps<Theme> => p !== undefined && p !== null));

/**
 * Enterprise Shared EmptyState Component (Module 8 - Step 8.23).
 *
 * Renders empty lists, failed search filters, or blank state panels.
 * Integrates shared Typography, Icon, and Skeleton placeholders.
 */
const EmptyState = React.forwardRef<HTMLDivElement, IEmptyStateProps>(
  (
    {
      title,
      description,
      illustration,
      icon,
      action,
      fullHeight = false,
      centered = true,
      loading = false,
    },
    ref
  ) => {
    // Resolve overall wrapper constraints
    const wrapperSx = combineSx(
      emptyStateRootSx,
      centered ? emptyStateCenteredSx : undefined,
      fullHeight ? emptyStateFullHeightSx : undefined
    );

    // 1. Render Skeleton placeholder block when loading is true
    if (loading) {
      return (
        <Box ref={ref} sx={wrapperSx}>
          <Box sx={emptyStateContainerSx}>
            {icon !== undefined && <Skeleton variant="circular" width={56} height={56} />}
            {illustration !== undefined && <Skeleton variant="rectangular" width={160} height={100} />}
            <Skeleton variant="text" width="60%" height={28} />
            {description !== undefined && <Skeleton variant="text" rows={2} width="90%" />}
            {action !== undefined && <Skeleton variant="rounded" width={120} height={36} sx={{ mt: 1 }} />}
          </Box>
        </Box>
      );
    }

    // Resolve how to display the illustration (string URL vs custom ReactNode)
    const illustrationContent =
      typeof illustration === 'string' ? (
        <Box
          component="img"
          src={illustration}
          alt=""
          sx={emptyStateIllustrationSx}
        />
      ) : (
        illustration
      );

    return (
      <Box ref={ref} sx={wrapperSx}>
        <Box sx={emptyStateContainerSx}>
          {illustrationContent !== undefined && illustrationContent}

          {illustrationContent === undefined && icon !== undefined && (
            <Icon name={icon} size="xl" sx={emptyStateIconSx} />
          )}

          <Typography variant="h6" sx={emptyStateTitleSx}>
            {title}
          </Typography>

          {description !== undefined && (
            <Typography variant="body2" sx={emptyStateDescriptionSx}>
              {description}
            </Typography>
          )}

          {action !== undefined && (
            <Box sx={emptyStateActionSx}>
              {action}
            </Box>
          )}
        </Box>
      </Box>
    );
  }
);

EmptyState.displayName = 'EmptyState';

export default EmptyState;
export { EmptyState };
