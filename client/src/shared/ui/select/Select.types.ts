import type { FormControlProps } from '@mui/material/FormControl';

/**
 * Enterprise Select Component Types (Module 8 - Step 8.4).
 *
 * Defined independently from MuiSelectProps to avoid property conflicts under
 * exactOptionalPropertyTypes: true between FormControlProps and SelectProps.
 */

/** A single option entry rendered as a MenuItem inside the Select. */
export interface ISelectOption<T extends string | number = string> {
  /** Human-readable label displayed in the dropdown. */
  readonly label: string;
  /** The value emitted when this option is selected. */
  readonly value: T;
  /** When true, the option is rendered but cannot be chosen. */
  readonly disabled?: boolean;
}

export interface ISelectProps<T extends string | number = string> {
  /** Typed array of options to render as MenuItems. */
  options: ReadonlyArray<ISelectOption<T>>;
  /** Currently selected value. */
  value?: T | '';
  /** Callback fired when the selected value changes. */
  onChange?: (value: T | '') => void;
  /** Callback fired when the select control loses focus. */
  onBlur?: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  /** FormControl / InputLabel label text. */
  label?: string;
  /** Helper text rendered below the control. */
  helperText?: string;
  /** When true, applies error styling and colour. */
  error?: boolean;
  /** Marks the field as required. */
  required?: boolean;
  /** Disables the entire FormControl. */
  disabled?: boolean;
  /** Expands the control to fill its container. */
  fullWidth?: boolean;
  /** MUI size token applied to the FormControl. */
  size?: FormControlProps['size'];
  /** MUI TextField/Select variant. Defaults to 'outlined'. */
  variant?: 'outlined' | 'filled' | 'standard';
  /** Placeholder text shown when no value is selected. */
  placeholder?: string;
  /** When true, shows a loading indicator and disables the control. */
  loading?: boolean;
  /** Screen-reader label for the loading indicator. Defaults to 'Loading'. */
  loadingText?: string;
  /** HTML id applied to the Select element. */
  id?: string;
  /** Accessible name for the Select when no label is provided. */
  'aria-label'?: string;
}
