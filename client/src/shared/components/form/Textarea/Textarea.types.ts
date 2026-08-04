import type { FieldValues } from 'react-hook-form';
import type { IFormInputProps } from '../Input/Input.types';

/**
 * Enterprise Form Textarea Component Types (Module 9 - Step 9.10).
 *
 * Extends the form Input props with textarea-specific layouts and counters.
 */
export interface IFormTextareaProps<TFieldValues extends FieldValues = FieldValues>
  extends Omit<IFormInputProps<TFieldValues>, 'multiline'> {
  /** Number of rows to render. */
  rows?: number;
  /** Minimum number of rows to render. */
  minRows?: number;
  /** Maximum number of rows to render. */
  maxRows?: number;
  /** Hard limit on character count. */
  maxLength?: number;
  /** When true, renders a character counter below the field. */
  showCharacterCount?: boolean;
  /** Controls CSS resize behavior of the textarea. Defaults to 'none'. */
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}
