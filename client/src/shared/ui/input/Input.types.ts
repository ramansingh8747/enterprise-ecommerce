import type { TextFieldProps as MuiTextFieldProps } from '@mui/material/TextField';
import type { ReactNode } from 'react';

/**
 * Enterprise Input Component Types (Module 8 - Step 8.3).
 */

export interface IInputProps extends Omit<MuiTextFieldProps, 'variant'> {
  /** MUI TextField variant. Defaults to 'outlined'. */
  variant?: MuiTextFieldProps['variant'];
  /** Leading adornment rendered inside the input start position. */
  startAdornment?: ReactNode;
  /** Trailing adornment rendered inside the input end position. */
  endAdornment?: ReactNode;
  /** When true, renders a CircularProgress in the end adornment and disables the field. */
  loading?: boolean;
  /** Accessible label for the loading indicator. Defaults to 'Loading'. */
  loadingText?: string;
}
