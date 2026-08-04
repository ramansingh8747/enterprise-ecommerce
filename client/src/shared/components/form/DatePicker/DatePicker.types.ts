import type { Control, FieldValues, Path } from 'react-hook-form';
import type { Dayjs } from 'dayjs';

/**
 * Enterprise Form DatePicker Component Types (Module 9 - Step 9.9).
 *
 * Integrates MUI X DatePicker with react-hook-form Controller.
 */
export interface IFormDatePickerProps<TFieldValues extends FieldValues = FieldValues> {
  /** The field registration name mapping to the schema path. */
  name: Path<TFieldValues>;
  /** The react-hook-form Control object. */
  control: Control<TFieldValues>;
  /** Label text for the input field. */
  label?: string;
  /** Helper text rendered below the input control. */
  helperText?: string;
  /** Placeholder text shown inside the input. */
  placeholder?: string;
  /** Marks the field as required. Defaults to false. */
  required?: boolean;
  /** Disables the entire DatePicker interaction. Defaults to false. */
  disabled?: boolean;
  /** Expands the control to fill its parent container width. Defaults to false. */
  fullWidth?: boolean;
  /** Default value if not initialized at the form top-level. */
  defaultValue?: TFieldValues[Path<TFieldValues>];
  /** Minimum selectable date. */
  minDate?: Dayjs;
  /** Maximum selectable date. */
  maxDate?: Dayjs;
  /** Prevents selection of future dates. Defaults to false. */
  disableFuture?: boolean;
  /** Prevents selection of past dates. Defaults to false. */
  disablePast?: boolean;
  /** Date format pattern. Defaults to 'YYYY-MM-DD'. */
  format?: string;
  /** Marks the input field as read-only. Defaults to false. */
  readOnly?: boolean;
}
