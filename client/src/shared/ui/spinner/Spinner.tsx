import React from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { SxProps, Theme } from '@mui/material';
import type { ISpinnerProps } from './Spinner.types';
import {
  spinnerCenteredSx,
  spinnerContainerSx,
  spinnerFullScreenSx,
  spinnerMessageSx,
  spinnerOverlaySx,
  spinnerRootSx,
} from './Spinner.styles';

/**
 * Combines multiple SxProps into a single style object.
 */
const combineSx = (...parts: Array<SxProps<Theme> | undefined>): SxProps<Theme> =>
  Object.assign({}, ...parts.filter((p): p is SxProps<Theme> => p !== undefined && p !== null));

/**
 * Enterprise Shared Spinner Component (Module 8 - Step 8.17).
 *
 * Wraps MUI CircularProgress. Offers support for layout presets (centered,
 * absolute overlay, fixed full viewport), fallback status text, and a flicker-reduction
 * delay rendering option.
 */
const Spinner = React.forwardRef<HTMLDivElement, ISpinnerProps>(
  (
    {
      size,
      thickness,
      color,
      variant,
      value,
      label,
      overlay = false,
      fullScreen = false,
      centered = false,
      delay = 0,
      message,
      sx,
    },
    ref
  ) => {
    const [shouldRender, setShouldRender] = React.useState(delay === 0);

    React.useEffect(() => {
      if (delay === 0) {
        setShouldRender(true);
        return;
      }

      const timer = setTimeout(() => {
        setShouldRender(true);
      }, delay);

      return () => {
        clearTimeout(timer);
      };
    }, [delay]);

    if (!shouldRender) {
      return null;
    }

    // Combine wrapper layout styles
    const wrapperSx = combineSx(
      fullScreen
        ? spinnerFullScreenSx
        : overlay
        ? spinnerOverlaySx
        : centered
        ? spinnerCenteredSx
        : spinnerRootSx,
      sx
    );

    const progressElement = (
      <CircularProgress
        {...(size !== undefined ? { size } : {})}
        {...(thickness !== undefined ? { thickness } : {})}
        {...(value !== undefined ? { value } : {})}
        {...(color !== undefined ? { color } : {})}
        {...(variant !== undefined ? { variant } : {})}
        {...(label !== undefined ? { 'aria-label': label } : { 'aria-label': 'Loading' })}
      />
    );

    const hasMessage = message !== undefined && message.trim() !== '';

    return (
      <Box
        ref={ref}
        sx={wrapperSx}
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        {hasMessage ? (
          <Box sx={spinnerContainerSx}>
            {progressElement}
            <Typography variant="body2" sx={spinnerMessageSx}>
              {message}
            </Typography>
          </Box>
        ) : (
          progressElement
        )}
      </Box>
    );
  }
);

Spinner.displayName = 'Spinner';

export default Spinner;
export { Spinner };
