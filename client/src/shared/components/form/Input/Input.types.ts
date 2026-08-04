import type { Control, FieldValues, Path } from 'react-hook-form';
import type { IInputProps } from '../../../ui/input/Input.types';

/**
 * Enterprise Form Input Component Types (Module 9 - Step 9.2).
 *
 * Wraps the base presentation IInputProps with react-hook-form Controller props.
 */
export interface IFormInputProps<TFieldValues extends FieldValues = FieldValues>
  extends Omit<IInputProps, 'name' | 'value' | 'onChange' | 'onBlur' | 'error'> {
  /** The field registration name mapping to the schema path. */
  name: Path<TFieldValues>;
  /** The react-hook-form Control object. */
  control: Control<TFieldValues>;
  /** Default value if not initialized at the form top-level. */
  defaultValue?: TFieldValues[Path<TFieldValues>];
  /** When true, marks the input field as read-only. */
  readOnly?: boolean;
}
