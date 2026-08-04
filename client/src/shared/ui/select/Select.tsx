import React from 'react';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MuiSelect, { type SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormHelperText from '@mui/material/FormHelperText';
import CircularProgress from '@mui/material/CircularProgress';
import InputAdornment from '@mui/material/InputAdornment';
import type { ISelectProps, ISelectOption } from './Select.types';
import { selectLoadingSpinnerSx, selectPlaceholderMenuItemSx } from './Select.styles';

/** Internal sentinel value for the unselected placeholder option. */
const PLACEHOLDER_VALUE = '' as const;

/**
 * Enterprise Shared Select Component (Module 8 - Step 8.4).
 *
 * Composes MUI FormControl + InputLabel + Select + FormHelperText into a single
 * typed unit with generic value support, placeholder rendering, and a
 * loading state. Fully accessible and keyboard navigable.
 */
const SelectInner = <T extends string | number = string>(
  {
    options,
    value,
    onChange,
    onBlur,
    label,
    helperText,
    error = false,
    required = false,
    disabled = false,
    fullWidth = false,
    size = 'medium',
    variant = 'outlined',
    placeholder,
    loading = false,
    loadingText = 'Loading',
    id,
    'aria-label': ariaLabel,
  }: ISelectProps<T>,
  ref: React.ForwardedRef<HTMLDivElement>
): React.ReactElement => {
  const isDisabled = disabled || loading;
  const labelId = id !== undefined ? `${id}-label` : undefined;

  const handleChange = (event: SelectChangeEvent<T | ''>): void => {
    if (onChange !== undefined) {
      onChange(event.target.value as T | '');
    }
  };

  const endAdornment = loading ? (
    <InputAdornment position="end" sx={{ mr: 2 }}>
      <CircularProgress
        size={18}
        thickness={4}
        sx={selectLoadingSpinnerSx}
        aria-label={loadingText}
      />
    </InputAdornment>
  ) : undefined;

  return (
    <FormControl
      variant={variant}
      error={error}
      required={required}
      disabled={isDisabled}
      fullWidth={fullWidth}
      size={size}
    >
      {label !== undefined && (
        <InputLabel id={labelId}>{label}</InputLabel>
      )}

      <MuiSelect<T | ''>
        ref={ref}
        {...(onBlur !== undefined ? { onBlur } : {})}
        {...(labelId !== undefined ? { labelId } : {})}
        {...(id !== undefined ? { id } : {})}
        {...(label !== undefined ? { label } : {})}
        value={value ?? PLACEHOLDER_VALUE}
        onChange={handleChange}
        inputProps={{ 'aria-busy': loading, 'aria-label': ariaLabel }}
        {...(endAdornment !== undefined ? { endAdornment } : {})}
      >
        {placeholder !== undefined && (
          <MenuItem value={PLACEHOLDER_VALUE} disabled sx={selectPlaceholderMenuItemSx}>
            {placeholder}
          </MenuItem>
        )}

        {options.map((option: ISelectOption<T>) => (
          <MenuItem
            key={String(option.value)}
            value={option.value}
            {...(option.disabled === true ? { disabled: true } : {})}
          >
            {option.label}
          </MenuItem>
        ))}
      </MuiSelect>

      {helperText !== undefined && (
        <FormHelperText>{helperText}</FormHelperText>
      )}
    </FormControl>
  );
};

const Select = React.forwardRef(SelectInner) as <T extends string | number = string>(
  props: ISelectProps<T> & { ref?: React.ForwardedRef<HTMLDivElement> }
) => React.ReactElement;

(Select as { displayName?: string }).displayName = 'Select';

export default Select;
export { Select };
