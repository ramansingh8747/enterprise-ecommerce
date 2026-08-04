import type { Control, FieldValues, Path } from 'react-hook-form';
import type { IRadioProps } from '../../../ui/radio/Radio.types';

/**
 * Enterprise Form RadioGroup Component Types (Module 9 - Step 9.7).
 *
 * Integrates the atomic Shared UI Radio props with generic option configuration and react-hook-form.
 */
export interface IFormRadioGroupProps<
  TFieldValues extends FieldValues = FieldValues,
  TOption extends Record<string, unknown> = Record<string, unknown>,
  TValue extends string | number = string
> extends Omit<IRadioProps<TValue>, 'options' | 'value' | 'onChange' | 'error' | 'name'> {
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
