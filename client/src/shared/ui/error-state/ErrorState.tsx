import React from 'react';
import Box from '@mui/material/Box';
import type { SxProps, Theme } from '@mui/material';
import { Typography } from '../typography';
import { Icon, type IconName } from '../icon';
import { Skeleton } from '../skeleton';
import { Button } from '../button';
import type { IErrorStateProps, ErrorSeverity } from './ErrorState.types';
import {
  errorStateActionSx,
  errorStateCenteredSx,
  errorStateCodeSx,
  errorStateContainerSx,
  errorStateDescriptionSx,
  errorStateFullHeightSx,
  errorStateIconSx,
  errorStateIllustrationSx,
  errorStateRootSx,
  errorStateTitleSx,
  severityColorStyles,
} from './ErrorState.styles';

/** Default icon keys corresponding to each severity level. */
const SEVERITY_DEFAULT_ICONS: Record<ErrorSeverity, IconName> = {
  info: 'info',
  warning: 'warning',
  error: 'error',
  critical: 'error',
};

/**
 * Combines multiple SxProps into a single style object.
 */
const combineSx = (...parts: Array<SxProps<Theme> | undefined>): SxProps<Theme> =>
  Object.assign({}, ...parts.filter((p): p is SxProps<Theme> => p !== undefined && p !== null));

/**
 * Enterprise Shared ErrorState Component (Module 8 - Step 8.24).
 *
 * Displays error messages, stack failures, or offline boundaries.
 * Composes shared Typography, Icon, Button and Skeleton overlays.
 */
const ErrorState = React.forwardRef<HTMLDivElement, IErrorStateProps>(
  (
    {
      title,
      description,
      errorCode,
      severity = 'error',
      icon,
      illustration,
      action,
      retryable = false,
      onRetry,
      retryLabel = 'Retry',
      fullHeight = false,
      centered = true,
      loading = false,
    },
    ref
  ) => {
    // Resolve overall wrapper constraints
    const wrapperSx = combineSx(
      errorStateRootSx,
      centered ? errorStateCenteredSx : undefined,
      fullHeight ? errorStateFullHeightSx : undefined
    );

    // 1. Render Skeleton placeholder block when loading is true
    if (loading) {
      const showIconSkeleton = icon !== undefined || (illustration === undefined);
      return (
        <Box ref={ref} sx={wrapperSx}>
          <Box sx={errorStateContainerSx}>
            {showIconSkeleton && <Skeleton variant="circular" width={56} height={56} />}
            {illustration !== undefined && <Skeleton variant="rectangular" width={160} height={100} />}
            <Skeleton variant="text" width="60%" height={28} />
            {description !== undefined && <Skeleton variant="text" rows={2} width="90%" />}
            {errorCode !== undefined && <Skeleton variant="text" width={140} height={20} />}
            {(action !== undefined || retryable) && (
              <Skeleton variant="rounded" width={120} height={36} sx={{ mt: 1 }} />
            )}
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
          sx={errorStateIllustrationSx}
        />
      ) : (
        illustration
      );

    // Resolve default icons if not explicitly overridden and illustration is absent
    const resolvedIconName =
      icon ?? (illustrationContent === undefined ? SEVERITY_DEFAULT_ICONS[severity] : undefined);

    // Resolve action rendering path (retry button vs custom action element)
    const resolvedAction =
      action ??
      (retryable && onRetry !== undefined ? (
        <Button
          variant="contained"
          color={severity === 'critical' || severity === 'error' ? 'error' : 'primary'}
          onClick={onRetry}
        >
          {retryLabel}
        </Button>
      ) : undefined);

    const titleColorSx = severityColorStyles[severity];

    return (
      <Box ref={ref} sx={wrapperSx}>
        <Box sx={errorStateContainerSx}>
          {illustrationContent !== undefined && illustrationContent}

          {resolvedIconName !== undefined && (
            <Icon
              name={resolvedIconName}
              size="xl"
              sx={combineSx(errorStateIconSx, titleColorSx)}
            />
          )}

          <Typography
            variant="h6"
            sx={combineSx(errorStateTitleSx, titleColorSx)}
          >
            {title}
          </Typography>

          {description !== undefined && (
            <Typography variant="body2" sx={errorStateDescriptionSx}>
              {description}
            </Typography>
          )}

          {errorCode !== undefined && (
            <Typography variant="caption" sx={errorStateCodeSx}>
              {errorCode}
            </Typography>
          )}

          {resolvedAction !== undefined && (
            <Box sx={errorStateActionSx}>
              {resolvedAction}
            </Box>
          )}
        </Box>
      </Box>
    );
  }
);

ErrorState.displayName = 'ErrorState';

export default ErrorState;
export { ErrorState };
