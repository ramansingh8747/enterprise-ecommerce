import React from 'react';
import MuiSnackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import type { SxProps, Theme } from '@mui/material';
import type { ISnackbarProps } from './Snackbar.types';
import {
  snackbarActionSx,
  snackbarAlertSx,
  snackbarLoadingSx,
  snackbarRootSx,
} from './Snackbar.styles';

/**
 * Combines multiple SxProps into a single style object.
 */
const combineSx = (...parts: Array<SxProps<Theme> | undefined>): SxProps<Theme> =>
  Object.assign({}, ...parts.filter((p): p is SxProps<Theme> => p !== undefined && p !== null));

/**
 * Enterprise Shared Snackbar Component (Module 8 - Step 8.22).
 *
 * Wraps MUI Snackbar + Alert. Standardized global/local notification toast.
 * Supports auto-dismiss timer, actions, close controls, and severity classifications.
 */
const Snackbar = React.forwardRef<HTMLDivElement, ISnackbarProps>(
  (
    {
      open,
      message,
      severity = 'info',
      autoHideDuration = 6000,
      anchorOrigin = { vertical: 'bottom', horizontal: 'left' },
      action,
      variant = 'filled',
      showIcon = true,
      closable = true,
      loading = false,
      onClose,
      sx,
    },
    ref
  ) => {
    const handleClose = (
      event?: React.SyntheticEvent | Event,
      reason?: string
    ): void => {
      // Standard behavior: skip clickaway closures unless explicitly overridden
      if (reason === 'clickaway') return;
      if (onClose !== undefined) {
        onClose(event, reason);
      }
    };

    // Render loading indicator or custom action inside action slot
    const alertAction = loading ? (
      <CircularProgress size={16} thickness={5} color="inherit" />
    ) : (
      action
    );

    const alertSx = combineSx(
      snackbarAlertSx,
      loading ? snackbarLoadingSx : undefined
    );

    return (
      <MuiSnackbar
        ref={ref}
        {...(open !== undefined ? { open } : {})}
        onClose={handleClose}
        {...(autoHideDuration !== null ? { autoHideDuration } : {})}
        {...(anchorOrigin !== undefined ? { anchorOrigin } : {})}
        sx={combineSx(snackbarRootSx, sx)}
      >
        <Alert
          severity={severity}
          variant={variant}
          icon={showIcon ? undefined : false} // false disables the icon in MUI Alert
          sx={alertSx}
          {...(closable && !loading && onClose !== undefined ? { onClose: handleClose } : {})}
          {...(alertAction !== undefined
            ? {
                action: <Box sx={snackbarActionSx}>{alertAction}</Box>,
              }
            : {})}
        >
          {message}
        </Alert>
      </MuiSnackbar>
    );
  }
);

Snackbar.displayName = 'Snackbar';

export default Snackbar;
export { Snackbar };
