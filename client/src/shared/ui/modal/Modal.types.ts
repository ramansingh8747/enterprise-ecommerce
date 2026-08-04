import type { DialogProps } from '@mui/material/Dialog';

/**
 * Enterprise Modal Component Types (Module 8 - Step 8.9).
 *
 * Defined independently rather than extending DialogProps to prevent
 * exactOptionalPropertyTypes conflicts. The MUI close-reason pattern is used
 * internally to implement disableBackdropClick.
 */

export interface IModalProps {
  /** Controls whether the modal is visible. */
  open: boolean;
  /** Optional title rendered in DialogTitle. */
  title?: string;
  /** Content rendered inside DialogContent. */
  children?: React.ReactNode;
  /** Maximum width of the dialog. Defaults to 'sm'. */
  maxWidth?: DialogProps['maxWidth'];
  /** When true, the dialog stretches to fill the maxWidth. */
  fullWidth?: boolean;
  /** When true, the dialog covers the entire screen. */
  fullScreen?: boolean;
  /** When true, pressing Escape does not close the modal. */
  disableEscapeKeyDown?: boolean;
  /** When true, clicking the backdrop does not close the modal. */
  disableBackdropClick?: boolean;
  /** When true, renders an × icon button in the header. */
  showCloseButton?: boolean;
  /** When true, disables confirm/cancel actions and shows a loading state. */
  loading?: boolean;
  /**
   * When true, the modal DOM is kept mounted even when closed.
   * Useful for preserving scroll position or heavy child state.
   */
  keepMounted?: boolean;
  /** Controls the scroll container. Defaults to 'paper'. */
  scroll?: DialogProps['scroll'];
  /** Fired when the modal is requested to close (Escape, backdrop, × button). */
  onClose?: () => void;
  /** Fired when the confirm action button is clicked. */
  onConfirm?: () => void;
  /** Text label for the confirm button. Defaults to 'Confirm'. */
  confirmLabel?: string;
  /** Fired when the cancel action button is clicked. */
  onCancel?: () => void;
  /** Text label for the cancel button. Defaults to 'Cancel'. */
  cancelLabel?: string;
}
