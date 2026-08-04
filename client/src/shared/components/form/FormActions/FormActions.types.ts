import type { ReactNode } from 'react';
import type { StackProps } from '@mui/material/Stack';
import type { IButtonProps } from '../../../ui/button/Button.types';

/**
 * FormActions Layout Types (Module 9 - Step 9.14).
 */
export interface IFormActionsProps extends Omit<StackProps, 'direction'> {
  /** Standard React children, usually form buttons. */
  children: ReactNode;
  /** Responsive stack directions. Defaults to 'row'. */
  direction?: 'row' | 'column' | { xs?: 'column' | 'row'; sm?: 'column' | 'row'; md?: 'column' | 'row'; lg?: 'column' | 'row'; xl?: 'column' | 'row' };
  /** Expands container width. Defaults to true. */
  fullWidth?: boolean;
  /** Standard CSS wrap property. Map to flexWrap. Defaults to 'wrap'. */
  wrap?: 'wrap' | 'nowrap' | 'wrap-reverse';
}

/**
 * SubmitButton Component Types.
 */
export type ISubmitButtonProps = Omit<IButtonProps, 'type'>;

/**
 * ResetButton Component Types.
 */
export type IResetButtonProps = Omit<IButtonProps, 'type' | 'loading' | 'loadingText'>;

/**
 * CancelButton Component Types.
 */
export interface ICancelButtonProps extends Omit<IButtonProps, 'type' | 'loading' | 'loadingText'> {
  /** Direct onClick event handler. */
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  /** Optional navigation target path or relative route jump index (e.g. -1 for back). */
  to?: string | number;
  /** Optional navigation/cancellation callback function. */
  onCancel?: () => void;
}
