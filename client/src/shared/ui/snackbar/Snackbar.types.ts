import type { SnackbarProps as MuiSnackbarProps } from '@mui/material/Snackbar';
import type { AlertProps as MuiAlertProps } from '@mui/material/Alert';

/** Strongly typed alert notification levels. */
export type SnackbarSeverity = 'success' | 'info' | 'warning' | 'error';

/**
 * Enterprise Snackbar Component Types (Module 8 - Step 8.22).
 *
 * Inherits layout config properties while avoiding exactOptionalPropertyTypes clashes.
 */
export interface ISnackbarProps
  extends Pick<
    MuiSnackbarProps,
    | 'open'
    | 'autoHideDuration'
    | 'anchorOrigin'
    | 'sx'
  > {
  /** Text description or custom layout rendered inside the alert notification. */
  message: React.ReactNode;
  /** Visual category level of the alert. Defaults to 'info'. */
  severity?: SnackbarSeverity;
  /** Custom action element (e.g. undo Button) placed inside the alert action slot. */
  action?: React.ReactNode;
  /** Display variant of the alert inside the snackbar. Defaults to 'filled'. */
  variant?: MuiAlertProps['variant'];
  /** When true, renders the severity icon. Defaults to true. */
  showIcon?: boolean;
  /** When true, renders a close icon button at the end. Defaults to true. */
  closable?: boolean;
  /** When true, disables interactive action button overlays and attaches a spinner. */
  loading?: boolean;
  /** Fired when notification is dismissed (auto-hide timer completes or close is clicked). */
  onClose?: (event?: React.SyntheticEvent | Event, reason?: string) => void;
}
