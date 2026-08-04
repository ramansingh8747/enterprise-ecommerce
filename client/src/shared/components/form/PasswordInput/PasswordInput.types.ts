import type { FieldValues } from 'react-hook-form';
import type { IFormInputProps } from '../Input/Input.types';

/**
 * Enterprise Form PasswordInput Component Types (Module 9 - Step 9.3).
 *
 * Inherits form Input contract while omitting layout-breaking properties (e.g. type, adornments).
 */
export type IFormPasswordInputProps<TFieldValues extends FieldValues = FieldValues> =
  Omit<IFormInputProps<TFieldValues>, 'type' | 'startAdornment' | 'endAdornment'>;
