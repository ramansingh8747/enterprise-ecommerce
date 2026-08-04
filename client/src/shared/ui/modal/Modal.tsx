import React from 'react';
import MuiDialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import CloseIcon from '@mui/icons-material/Close';
import type { IModalProps } from './Modal.types';
import {
  modalBodySx,
  modalCloseButtonSx,
  modalFooterSx,
  modalHeaderSx,
} from './Modal.styles';

/**
 * Enterprise Shared Modal Component (Module 8 - Step 8.9).
 *
 * Wraps MUI Dialog with optional title, close icon, loading state, and
 * confirm/cancel footer actions. Backdrop-click suppression is implemented
 * via the MUI close-reason pattern. Fully accessible with MUI-managed focus.
 */
const Modal = React.forwardRef<HTMLDivElement, IModalProps>(
  (
    {
      open,
      title,
      children,
      maxWidth = 'sm',
      fullWidth = false,
      fullScreen = false,
      disableEscapeKeyDown = false,
      disableBackdropClick = false,
      showCloseButton = true,
      loading = false,
      keepMounted = false,
      scroll = 'paper',
      onClose,
      onConfirm,
      confirmLabel = 'Confirm',
      onCancel,
      cancelLabel = 'Cancel',
    },
    ref
  ) => {
    const handleDialogClose = (
      _event: object,
      reason: 'backdropClick' | 'escapeKeyDown'
    ): void => {
      if (reason === 'backdropClick' && disableBackdropClick) return;
      if (onClose !== undefined) onClose();
    };

    const hasFooter = onConfirm !== undefined || onCancel !== undefined;
    const titleId = title !== undefined ? 'modal-title' : undefined;

    return (
      <MuiDialog
        ref={ref}
        open={open}
        maxWidth={maxWidth}
        fullWidth={fullWidth}
        fullScreen={fullScreen}
        disableEscapeKeyDown={disableEscapeKeyDown}
        keepMounted={keepMounted}
        scroll={scroll}
        onClose={handleDialogClose}
        {...(titleId !== undefined ? { 'aria-labelledby': titleId } : {})}
      >
        {(title !== undefined || showCloseButton) && (
          <DialogTitle
            component="div"
            sx={modalHeaderSx}
            {...(titleId !== undefined ? { id: titleId } : {})}
          >
            <span>{title ?? ''}</span>

            {showCloseButton && (
              <IconButton
                aria-label="Close modal"
                onClick={() => { if (onClose !== undefined) onClose(); }}
                sx={modalCloseButtonSx}
                size="small"
                disabled={loading}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            )}
          </DialogTitle>
        )}

        <DialogContent sx={modalBodySx}>
          {children}
        </DialogContent>

        {hasFooter && (
          <DialogActions sx={modalFooterSx}>
            {onCancel !== undefined && (
              <Button
                variant="outlined"
                onClick={onCancel}
                disabled={loading}
              >
                {cancelLabel}
              </Button>
            )}

            {onConfirm !== undefined && (
              <Button
                variant="contained"
                onClick={onConfirm}
                disabled={loading}
                startIcon={
                  loading ? (
                    <CircularProgress size={16} thickness={4} color="inherit" />
                  ) : undefined
                }
              >
                {confirmLabel}
              </Button>
            )}
          </DialogActions>
        )}
      </MuiDialog>
    );
  }
);

Modal.displayName = 'Modal';

export default Modal;
export { Modal };
