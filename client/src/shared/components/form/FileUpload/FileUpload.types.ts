import type { Control, FieldValues, Path } from 'react-hook-form';

/**
 * Enterprise Form FileUpload Component Types (Module 9 - Step 9.11).
 *
 * Configures file selection lists, previews, size controls, and react-hook-form bindings.
 */
export interface IFormFileUploadProps<TFieldValues extends FieldValues = FieldValues> {
  /** The field registration name mapping to the schema path. */
  name: Path<TFieldValues>;
  /** The react-hook-form Control object. */
  control: Control<TFieldValues>;
  /** Label text for the upload control group. */
  label?: string;
  /** Helper text rendered below the upload button. */
  helperText?: string;
  /** Marks the field as required. Defaults to false. */
  required?: boolean;
  /** Disables file selection and remove actions. Defaults to false. */
  disabled?: boolean;
  /** When true, supports selecting multiple files. Defaults to false. */
  multiple?: boolean;
  /** Comma-separated list of accepted mime-types or extensions (e.g. 'image/*,application/pdf'). */
  accept?: string;
  /** Maximum number of files allowed (only applicable when multiple is true). */
  maxFiles?: number;
  /** Maximum individual file size in bytes (e.g. 5242880 for 5MB). */
  maxFileSize?: number;
  /** Default value if not initialized at the form top-level. */
  defaultValue?: TFieldValues[Path<TFieldValues>];
  /** Renders visual image previews for selected image files. Defaults to true. */
  showPreview?: boolean;
  /** Displays formatted file sizes next to names. Defaults to true. */
  showFileSize?: boolean;
  /** Enables a remove button next to each selected file. Defaults to true. */
  allowRemove?: boolean;
}
