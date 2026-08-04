import type { SwitchProps as MuiSwitchProps } from '@mui/material/Switch';
import type { FormControlLabelProps } from '@mui/material/FormControlLabel';

/**
 * Enterprise Switch Component Types (Module 8 - Step 8.7).
 *
 * Uses Pick<MuiSwitchProps> for the safe subset of Switch-native props and
 * declares FormControl/FormControlLabel-level props explicitly to prevent
 * exactOptionalPropertyTypes conflicts.
 */

export interface ISwitchProps
  extends Pick<
    MuiSwitchProps,
    | 'checked'
    | 'defaultChecked'
    | 'onChange'
    | 'onBlur'
    | 'name'
    | 'value'
    | 'size'
    | 'color'
    | 'sx'
  > {
  /** Visible label rendered via FormControlLabel. */
  label?: React.ReactNode;
  /** Helper text rendered below the FormControl. */
  helperText?: string;
  /** When true, applies error colouring to the label and helper text. */
  error?: boolean;
  /** Marks the field as required, appending an asterisk to the label. */
  required?: boolean;
  /** Disables the switch and label interaction. */
  disabled?: boolean;
  /** When true, the FormControlLabel stretches to fill its container. */
  fullWidth?: boolean;
  /** Controls the position of the label relative to the switch. */
  labelPlacement?: FormControlLabelProps['labelPlacement'];
  /** HTML id applied to the underlying switch input. */
  id?: string;
}
