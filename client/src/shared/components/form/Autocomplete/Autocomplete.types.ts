import type { Control, FieldValues, Path } from 'react-hook-form';

/**
 * Enterprise Form Autocomplete Component Types (Module 9 - Step 9.5).
 *
 * Generic interface over TOption, supporting react-hook-form bindings.
 */
export interface IFormAutocompleteProps<
  TFieldValues extends FieldValues = FieldValues,
  TOption extends Record<string, unknown> = Record<string, unknown>
> {
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
  /** Label text for the input field. */
  label?: string;
  /** Placeholder text shown inside the input. */
  placeholder?: string;
  /** Helper text rendered below the input control. */
  helperText?: string;
  /** Marks the input field as required. Defaults to false. */
  required?: boolean;
  /** Disables the autocomplete interaction. Defaults to false. */
  disabled?: boolean;
  /** Expands the control to fill its parent container width. Defaults to false. */
  fullWidth?: boolean;
  /** Default value if not initialized at the form top-level. */
  defaultValue?: TFieldValues[Path<TFieldValues>];
  /** When true, renders a loading spinner adornment. Defaults to false. */
  loading?: boolean;
  /** Screen reader text for loading spinner. Defaults to 'Loading...'. */
  loadingText?: string;
  /** Text displayed when search query yields no matches. Defaults to 'No options'. */
  noOptionsText?: string;
  /** MUI size token. Defaults to 'medium'. */
  size?: 'small' | 'medium';
  /** Styling variant of the internal TextField. Defaults to 'outlined'. */
  variant?: 'outlined' | 'filled' | 'standard';
  /** Custom style overrides. */
  sx?: import('@mui/material').SxProps<import('@mui/material').Theme>;
  /** HTML id applied to the element. */
  id?: string;
}
