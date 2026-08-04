/**
 * Enterprise Textarea Component Types (Module 8 - Step 8.8).
 *
 * Defined independently rather than extending MuiTextFieldProps to prevent
 * exactOptionalPropertyTypes conflicts across TextFieldProps / InputProps
 * internals (onChange, inputProps, InputProps, etc.).
 */

/** CSS resize behaviour for the textarea element. */
export type TextareaResizeMode = 'none' | 'both' | 'horizontal' | 'vertical';

export interface ITextareaProps {
  /** Floating label rendered above the textarea. */
  label?: string;
  /** Placeholder text displayed when the textarea is empty. */
  placeholder?: string;
  /** Controlled value of the textarea. */
  value?: string;
  /** Default value for uncontrolled usage. */
  defaultValue?: string;
  /** Callback fired when the textarea value changes. */
  onChange?: React.ChangeEventHandler<HTMLTextAreaElement>;
  /** Callback fired when the textarea loses focus. */
  onBlur?: React.FocusEventHandler<HTMLTextAreaElement>;
  /** Helper text rendered below the textarea. */
  helperText?: string;
  /** When true, applies error styling. */
  error?: boolean;
  /** Marks the field as required. */
  required?: boolean;
  /** Disables the textarea. */
  disabled?: boolean;
  /** Expands the control to fill its container. */
  fullWidth?: boolean;
  /** MUI TextField variant. Defaults to 'outlined'. */
  variant?: 'outlined' | 'filled' | 'standard';
  /** MUI size token. Defaults to 'medium'. */
  size?: 'small' | 'medium';
  /** Fixed number of visible rows. */
  rows?: number;
  /** Minimum rows when auto-sizing. */
  minRows?: number;
  /** Maximum rows when auto-sizing. */
  maxRows?: number;
  /** Controls CSS resize handle visibility. Defaults to 'vertical'. */
  resize?: TextareaResizeMode;
  /** When true, shows a loading indicator and disables the field. */
  loading?: boolean;
  /** Accessible label for the loading indicator. Defaults to 'Loading'. */
  loadingText?: string;
  /** HTML id applied to the underlying textarea element. */
  id?: string;
  /** HTML name applied to the textarea. */
  name?: string;
}
