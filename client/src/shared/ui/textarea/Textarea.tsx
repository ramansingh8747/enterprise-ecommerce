import React from 'react';
import MuiTextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';
import type { ITextareaProps } from './Textarea.types';
import {
  getTextareaInputStyle,
  textareaLoadingAdornmentSx,
  textareaLoadingSpinnerSx,
} from './Textarea.styles';

/**
 * Enterprise Shared Textarea Component (Module 8 - Step 8.8).
 *
 * Wraps MUI TextField with multiline always enabled. Adds a resize mode prop,
 * controlled loading state with an end-adornment spinner, and full
 * accessibility compliance.
 */
const Textarea = React.forwardRef<HTMLDivElement, ITextareaProps>(
  (
    {
      label,
      placeholder,
      value,
      defaultValue,
      onChange,
      onBlur,
      helperText,
      error = false,
      required = false,
      disabled = false,
      fullWidth = false,
      variant = 'outlined',
      size = 'medium',
      rows,
      minRows,
      maxRows,
      resize = 'vertical',
      loading = false,
      loadingText = 'Loading',
      id,
      name,
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    const endAdornment = loading ? (
      <InputAdornment position="end" sx={textareaLoadingAdornmentSx}>
        <CircularProgress
          size={18}
          thickness={4}
          sx={textareaLoadingSpinnerSx}
          aria-label={loadingText}
        />
      </InputAdornment>
    ) : undefined;

    return (
      <MuiTextField
        ref={ref}
        multiline
        variant={variant}
        size={size}
        error={error}
        required={required}
        disabled={isDisabled}
        fullWidth={fullWidth}
        inputProps={{
          style: getTextareaInputStyle(resize),
          'aria-busy': loading,
        }}
        InputProps={{
          ...(endAdornment !== undefined ? { endAdornment } : {}),
        }}
        {...(id !== undefined ? { id } : {})}
        {...(label !== undefined ? { label } : {})}
        {...(placeholder !== undefined ? { placeholder } : {})}
        {...(name !== undefined ? { name } : {})}
        {...(helperText !== undefined ? { helperText } : {})}
        {...(value !== undefined ? { value } : {})}
        {...(defaultValue !== undefined ? { defaultValue } : {})}
        {...(onChange !== undefined ? { onChange } : {})}
        {...(onBlur !== undefined ? { onBlur } : {})}
        {...(rows !== undefined ? { rows } : {})}
        {...(minRows !== undefined ? { minRows } : {})}
        {...(maxRows !== undefined ? { maxRows } : {})}
      />
    );
  }
);

Textarea.displayName = 'Textarea';

export default Textarea;
export { Textarea };
