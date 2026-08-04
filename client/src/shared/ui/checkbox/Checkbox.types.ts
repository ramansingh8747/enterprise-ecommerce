import type { CheckboxProps as MuiCheckboxProps } from '@mui/material/Checkbox';
import type { FormControlLabelProps } from '@mui/material/FormControlLabel';

/**
 * Enterprise Checkbox Component Types (Module 8 - Step 8.5).
 *
 * Props that belong exclusively to FormControl/FormControlLabel are declared
 * here explicitly to avoid exactOptionalPropertyTypes conflicts with
 * MuiCheckboxProps internals.
 */

export interface ICheckboxProps
  extends Pick<
    MuiCheckboxProps,
    'checked' | 'defaultChecked' | 'indeterminate' | 'size' | 'onChange' | 'onBlur' | 'name' | 'value' | 'color' | 'sx'
  > {
  /** Visible label rendered via FormControlLabel. */
  label?: React.ReactNode;
  /** Helper text rendered below the FormControl. */
  helperText?: string;
  /** When true, applies error colouring to the label and helper text. */
  error?: boolean;
  /** Marks the field as required, appending an asterisk to the label. */
  required?: boolean;
  /** Disables the checkbox and label interaction. */
  disabled?: boolean;
  /** When true, the FormControlLabel expands to fill its container. */
  fullWidth?: boolean;
  /** Controls the position of the label relative to the checkbox. */
  labelPlacement?: FormControlLabelProps['labelPlacement'];
  /** HTML id applied to the underlying checkbox input. */
  id?: string;
}
