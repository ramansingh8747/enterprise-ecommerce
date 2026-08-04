import type { Control, FieldValues, Path } from 'react-hook-form';
import type { ISwitchProps } from '../../../ui/switch/Switch.types';

/**
 * Enterprise Form Switch Component Types (Module 9 - Step 9.8).
 *
 * Integrates the atomic Shared UI Switch props with react-hook-form Controller.
 */
export interface IFormSwitchProps<TFieldValues extends FieldValues = FieldValues>
  extends Omit<ISwitchProps, 'checked' | 'defaultChecked' | 'onChange' | 'error' | 'name'> {
  /** The field registration name mapping to the schema path. */
  name: Path<TFieldValues>;
  /** The react-hook-form Control object. */
  control: Control<TFieldValues>;
  /** Default value for the toggle state. */
  defaultValue?: TFieldValues[Path<TFieldValues>];
}
