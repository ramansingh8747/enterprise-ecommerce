import type { Control, FieldValues, Path } from 'react-hook-form';
import type { ICheckboxProps } from '../../../ui/checkbox/Checkbox.types';

/**
 * Enterprise Form Checkbox Component Types (Module 9 - Step 9.6).
 *
 * Integrates the atomic Shared UI Checkbox props with react-hook-form Controller.
 */
export interface IFormCheckboxProps<TFieldValues extends FieldValues = FieldValues>
  extends Omit<ICheckboxProps, 'checked' | 'defaultChecked' | 'onChange' | 'error' | 'name'> {
  /** The field registration name mapping to the schema path. */
  name: Path<TFieldValues>;
  /** The react-hook-form Control object. */
  control: Control<TFieldValues>;
  /** Default checked state value. */
  defaultValue?: TFieldValues[Path<TFieldValues>];
}
