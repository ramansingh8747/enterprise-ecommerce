import type { FormControlProps } from '@mui/material/FormControl';

/**
 * Enterprise Radio Component Types (Module 8 - Step 8.6).
 *
 * Props are defined independently rather than extending MuiRadioGroupProps to
 * prevent exactOptionalPropertyTypes conflicts across FormControl, FormLabel,
 * RadioGroup, and Radio internals.
 */

/** A single selectable option rendered as a Radio + FormControlLabel pair. */
export interface IRadioOption<T extends string | number = string> {
  /** Human-readable label displayed beside the radio button. */
  readonly label: string;
  /** The value emitted when this option is selected. */
  readonly value: T;
  /** When true, the option is rendered but cannot be selected. */
  readonly disabled?: boolean;
}

export interface IRadioProps<T extends string | number = string> {
  /** Array of options to render as individual radio buttons. */
  options: ReadonlyArray<IRadioOption<T>>;
  /** Group label rendered as a FormLabel above the radio buttons. */
  label?: string;
  /** Helper text rendered below the radio group. */
  helperText?: string;
  /** When true, applies error colouring to the label and helper text. */
  error?: boolean;
  /** Marks the group as required. */
  required?: boolean;
  /** Disables all radio buttons in the group. */
  disabled?: boolean;
  /** When true, renders the radio buttons in a horizontal row. */
  row?: boolean;
  /** HTML name attribute shared by all radio inputs in the group. */
  name?: string;
  /** Controlled value of the selected option. */
  value?: T | '';
  /** Default selected value for uncontrolled usage. */
  defaultValue?: T | '';
  /** Callback fired when the selected option changes. */
  onChange?: (value: T | '') => void;
  /** Callback fired when the radio group loses focus. */
  onBlur?: React.FocusEventHandler<HTMLDivElement>;
  /** Size applied to each Radio button. */
  size?: 'small' | 'medium';
  /** Expands the FormControl to fill its container width. */
  fullWidth?: boolean;
  /** HTML id applied to the root FormControl. */
  id?: string;
  /** MUI size token applied to the FormControl. */
  formControlSize?: FormControlProps['size'];
}
