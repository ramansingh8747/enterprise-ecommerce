import React from 'react';
import MuiDialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { Button } from '../button';
import type { IDialogProps, DialogSeverity } from './Dialog.types';
import {
  dialogActionsSx,
  dialogContentSx,
  dialogHeaderSx,
  dialogIconSx,
  dialogIconWrapperSx,
  dialogMessageSx,
} from './Dialog.styles';

/** Maps severity to MUI colour token for the icon and accent. */
const SEVERITY_COLOR: Record<DialogSeverity, 'info' | 'success' | 'warning' | 'error'> = {
  info: 'info',
  success: 'success',
  warning: 'warning',
  error: 'error',
};

/** Renders the appropriate severity icon. */
const SeverityIcon: React.FC<{ severity: DialogSeverity }> = ({ severity }) => {
  const color = `${SEVERITY_COLOR[severity]}.main` as const;
  const iconSx = { ...dialogIconSx, color };

  switch (severity) {
    case 'success':
      return <CheckCircleOutlineIcon sx={iconSx} />;
    case 'warning':
      return <WarningAmberIcon sx={iconSx} />;
    case 'error':
      return <ErrorOutlineIcon sx={iconSx} />;
    case 'info':
    default:
      return <InfoOutlinedIcon sx={iconSx} />;
  }
};

SeverityIcon.displayName = 'SeverityIcon';

/**
 * Enterprise Shared Dialog Component (Module 8 - Step 8.10).
 *
 * A focused confirmation/decision primitive. Renders an optional severity icon,
 * title, message, and centred confirm/cancel actions. For richer arbitrary
 * content layouts use the Modal component instead.
 */
const Dialog = React.forwardRef<HTMLDivElement, IDialogProps>(
  (
    {
      open,
      title,
      message,
      children,
      severity,
      confirmText = 'Confirm',
      confirmButtonColor = 'primary',
      cancelText = 'Cancel',
      cancelButtonColor = 'inherit',
      showCancelButton = true,
      loading = false,
      maxWidth = 'xs',
      fullWidth = false,
      disableEscapeKeyDown = false,
      keepMounted = false,
      onConfirm,
      onCancel,
      onClose,
    },
    ref
  ) => {
    const handleClose = (): void => {
      if (onClose !== undefined) onClose();
    };

    const titleId = title !== undefined ? 'dialog-title' : undefined;
    const messageId = message !== undefined ? 'dialog-message' : undefined;

    return (
      <MuiDialog
        ref={ref}
        open={open}
        maxWidth={maxWidth}
        fullWidth={fullWidth}
        disableEscapeKeyDown={disableEscapeKeyDown}
        keepMounted={keepMounted}
        onClose={handleClose}
        {...(titleId !== undefined ? { 'aria-labelledby': titleId } : {})}
        {...(messageId !== undefined ? { 'aria-describedby': messageId } : {})}
      >
        {severity !== undefined && (
          <Box sx={dialogIconWrapperSx}>
            <SeverityIcon severity={severity} />
          </Box>
        )}

        {title !== undefined && (
          <DialogTitle
            sx={dialogHeaderSx}
            align="center"
            {...(titleId !== undefined ? { id: titleId } : {})}
          >
            {title}
          </DialogTitle>
        )}

        <DialogContent sx={dialogContentSx}>
          {message !== undefined && (
            <Typography
              variant="body2"
              sx={dialogMessageSx}
              {...(messageId !== undefined ? { id: messageId } : {})}
            >
              {message}
            </Typography>
          )}
          {children}
        </DialogContent>

        <DialogActions sx={dialogActionsSx} disableSpacing>
          {showCancelButton && (
            <Button
              variant="outlined"
              color={cancelButtonColor}
              disabled={loading}
              onClick={onCancel}
            >
              {cancelText}
            </Button>
          )}

          <Button
            variant="contained"
            color={confirmButtonColor}
            disabled={loading}
            loading={loading}
            onClick={onConfirm}
          >
            {confirmText}
          </Button>
        </DialogActions>
      </MuiDialog>
    );
  }
);

Dialog.displayName = 'Dialog';

export default Dialog;
export { Dialog };
