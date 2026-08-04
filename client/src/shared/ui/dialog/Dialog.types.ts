import type { DialogProps as MuiDialogProps } from '@mui/material/Dialog';
import type { ButtonProps as MuiButtonProps } from '@mui/material/Button';

/**
 * Enterprise Dialog Component Types (Module 8 - Step 8.10).
 *
 * Defined independently to prevent exactOptionalPropertyTypes conflicts.
 * Dialog is a focused confirmation/decision primitive — for richer content,
 * use the Modal component.
 */

/** Visual severity that controls the icon and accent colour. */
export type DialogSeverity = 'info' | 'success' | 'warning' | 'error';

export interface IDialogProps {
  /** Controls whether the dialog is visible. */
  open: boolean;
  /** Optional heading rendered in DialogTitle. */
  title?: string;
  /** Short descriptive message rendered as a paragraph in DialogContent. */
  message?: string;
  /**
   * Optional custom content rendered inside DialogContent below the message.
   * Use when the message string alone is insufficient.
   */
  children?: React.ReactNode;
  /** Determines which severity icon and colour accent to display. */
  severity?: DialogSeverity;
  /** Label for the primary confirm button. Defaults to 'Confirm'. */
  confirmText?: string;
  /** MUI colour token applied to the confirm button. Defaults to 'primary'. */
  confirmButtonColor?: MuiButtonProps['color'];
  /** Label for the secondary cancel button. Defaults to 'Cancel'. */
  cancelText?: string;
  /** MUI colour token applied to the cancel button. Defaults to 'inherit'. */
  cancelButtonColor?: MuiButtonProps['color'];
  /** When true, renders the cancel button. Defaults to true. */
  showCancelButton?: boolean;
  /** When true, disables both action buttons and shows a loading spinner. */
  loading?: boolean;
  /** Maximum width of the dialog. Defaults to 'xs'. */
  maxWidth?: MuiDialogProps['maxWidth'];
  /** When true, stretches the dialog to fill maxWidth. */
  fullWidth?: boolean;
  /** When true, pressing Escape does not close the dialog. */
  disableEscapeKeyDown?: boolean;
  /** When true, the dialog DOM remains mounted when closed. */
  keepMounted?: boolean;
  /** Fired when the confirm button is clicked. */
  onConfirm?: () => void;
  /** Fired when the cancel button is clicked or the dialog is dismissed. */
  onCancel?: () => void;
  /** Fired when the dialog requests closure via Escape or backdrop. */
  onClose?: () => void;
}
