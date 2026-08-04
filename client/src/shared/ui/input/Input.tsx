import React from 'react';
import MuiTextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';
import type { IInputProps } from './Input.types';
import { inputLoadingAdornmentSx, inputLoadingSpinnerSx } from './Input.styles';

/**
 * Enterprise Shared Input Component (Module 8 - Step 8.3).
 *
 * Wraps Material UI TextField with centralised adornment management and
 * loading state support. Fully accessible and keyboard navigable.
 */
const Input = React.forwardRef<HTMLDivElement, IInputProps>(
  (
    {
      variant = 'outlined',
      startAdornment,
      endAdornment,
      loading = false,
      loadingText = 'Loading',
      disabled,
      InputProps,
      inputProps,
      ...rest
    },
    ref
  ) => {
    const isDisabled = disabled ?? loading;

    const resolvedStartAdornment = startAdornment !== undefined ? (
      <InputAdornment position="start">{startAdornment}</InputAdornment>
    ) : undefined;

    const resolvedEndAdornment = loading ? (
      <InputAdornment position="end" sx={inputLoadingAdornmentSx}>
        <CircularProgress
          size={18}
          thickness={4}
          sx={inputLoadingSpinnerSx}
          aria-label={loadingText}
        />
      </InputAdornment>
    ) : endAdornment !== undefined ? (
      <InputAdornment position="end">{endAdornment}</InputAdornment>
    ) : undefined;

    return (
      <MuiTextField
        ref={ref}
        variant={variant}
        disabled={isDisabled}
        inputProps={{
          ...inputProps,
          'aria-busy': loading,
        }}
        InputProps={{
          ...InputProps,
          ...(resolvedStartAdornment !== undefined
            ? { startAdornment: resolvedStartAdornment }
            : {}),
          ...(resolvedEndAdornment !== undefined
            ? { endAdornment: resolvedEndAdornment }
            : {}),
        }}
        {...rest}
      />
    );
  }
);

Input.displayName = 'Input';

export default Input;
export { Input };
