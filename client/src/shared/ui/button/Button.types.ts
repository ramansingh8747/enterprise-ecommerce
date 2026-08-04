import type { ButtonProps as MuiButtonProps } from '@mui/material/Button';
import type { ReactNode } from 'react';

/**
 * Enterprise Button Component Types (Module 8 - Step 8.2).
 */

export interface IButtonProps extends Omit<MuiButtonProps, 'loading'> {
  /** Button label or child content. */
  children?: ReactNode;
  /** Shows a loading spinner and disables the button. */
  loading?: boolean;
  /** Text to display alongside the loading indicator. Falls back to children if omitted. */
  loadingText?: string;
}
