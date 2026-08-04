import type { SxProps, Theme } from '@mui/material';
import type { TextareaResizeMode } from './Textarea.types';

/**
 * Enterprise Textarea Style Definitions (Module 8 - Step 8.8).
 *
 * All values sourced from the MUI theme — no hardcoded colours or magic numbers.
 * The resize style is a function so it can be driven by the resize prop.
 */

/** Returns inputProps style object for a given resize mode. */
export const getTextareaInputStyle = (
  resize: TextareaResizeMode
): React.CSSProperties => ({
  resize,
});

/** Applied to the CircularProgress spinner shown in the loading state. */
export const textareaLoadingSpinnerSx: SxProps<Theme> = {
  color: 'action.disabled',
  flexShrink: 0,
};

/** Applied to the InputAdornment wrapping the loading spinner. */
export const textareaLoadingAdornmentSx: SxProps<Theme> = {
  alignSelf: 'flex-start',
  mt: 1.5,
  mr: 1,
};
