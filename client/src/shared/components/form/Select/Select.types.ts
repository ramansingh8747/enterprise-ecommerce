import type { Control, FieldValues, Path } from 'react-hook-form';
import type { ISelectProps } from '../../../ui/select/Select.types';

/**
 * Enterprise Form Select Component Types (Module 9 - Step 9.4).
 *
 * Integrates the atomic Shared UI Select props with generic option configuration and react-hook-form.
 */
export interface IFormSelectProps<
  TFieldValues extends FieldValues = FieldValues,
  TOption extends Record<string, unknown> = Record<string, unknown>,
  TValue extends string | number = string
> extends Omit<ISelectProps<TValue>, 'options' | 'value' | 'onChange' | 'error'> {
  /** The field registration name mapping to the schema path. */
  name: Path<TFieldValues>;
  /** The react-hook-form Control object. */
  control: Control<TFieldValues>;
  /** Array of generic option models. */
  options: ReadonlyArray<TOption>;
  /** Key of TOption to extract the human-readable label string. */
  optionLabel: keyof TOption;
  /** Key of TOption to extract the value. */
  optionValue: keyof TOption;
  /** Default value if not initialized at the form top-level. */
  defaultValue?: TFieldValues[Path<TFieldValues>];
}
