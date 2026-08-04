import type { ReactNode } from 'react';
import type { AlertProps } from '@mui/material/Alert';
import type { FieldErrors } from 'react-hook-form';

/**
 * FormError Component Types (Module 9 - Step 9.13).
 */
export interface IFormErrorProps {
  /** The error object, string, or collection from react-hook-form, server responses, or Zod schemas. */
  error?: string | string[] | FieldErrors | unknown;
  /** Alert severity. Defaults to 'error'. */
  severity?: AlertProps['severity'];
  /** Custom icon override. */
  icon?: ReactNode;
  /** Expands the alert container to fill its parent width. Defaults to true. */
  fullWidth?: boolean;
}

/**
 * FormMessage Component Types (Module 9 - Step 9.13).
 */
export interface IFormMessageProps {
  /** Core message body or description text. */
  description: string | ReactNode;
  /** Alert severity layout token. Defaults to 'info'. */
  severity?: AlertProps['severity'];
  /** Optional title for the alert block. */
  title?: string;
  /** Custom icon override. */
  icon?: ReactNode;
  /** Callback fired when the user dismisses the message. Renders close button. */
  onDismiss?: () => void;
  /** Expands the message container to fill its parent width. Defaults to true. */
  fullWidth?: boolean;
}

/**
 * ErrorSummary Component Types (Module 9 - Step 9.13).
 */
export interface IErrorSummaryProps {
  /** Collection of validation error strings or RHF FieldErrors object. */
  errors: string[] | FieldErrors;
  /** Optional summary header text. Defaults to 'Please correct the following errors:'. */
  heading?: string;
  /** Enables keyboard focus scrolling to the first input field on error. Defaults to true. */
  scrollToFirst?: boolean;
  /** ID prefix mapping to form elements (important for scrollToFirst). */
  fieldIdPrefix?: string;
}
