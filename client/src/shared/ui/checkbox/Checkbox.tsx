import React from 'react';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import MuiCheckbox from '@mui/material/Checkbox';
import type { ICheckboxProps } from './Checkbox.types';
import { checkboxFullWidthSx, checkboxHelperTextSx } from './Checkbox.styles';

/**
 * Enterprise Shared Checkbox Component (Module 8 - Step 8.5).
 *
 * Composes MUI FormControl + FormControlLabel + Checkbox + FormHelperText into
 * a single strongly typed unit. Supports controlled and uncontrolled usage,
 * error state, helper text, indeterminate state, and full accessibility.
 */
const Checkbox = React.forwardRef<HTMLButtonElement, ICheckboxProps>(
  (
    {
      label,
      helperText,
      error = false,
      required = false,
      disabled = false,
      fullWidth = false,
      labelPlacement = 'end',
      id,
      checked,
      defaultChecked,
      indeterminate,
      size,
      onChange,
      onBlur,
      name,
      value,
      color,
      sx,
    },
    ref
  ) => {
    const checkboxElement = (
      <MuiCheckbox
        ref={ref}
        disabled={disabled}
        required={required}
        onChange={onChange}
        {...(onBlur !== undefined ? { onBlur } : {})}
        {...(indeterminate === true ? { indeterminate: true } : {})}
        {...(id !== undefined ? { id, inputProps: { 'aria-describedby': helperText !== undefined ? `${id}-helper` : undefined } } : {})}
        {...(checked !== undefined ? { checked } : {})}
        {...(defaultChecked !== undefined ? { defaultChecked } : {})}
        {...(size !== undefined ? { size } : {})}
        {...(name !== undefined ? { name } : {})}
        {...(value !== undefined ? { value } : {})}
        {...(color !== undefined ? { color } : {})}
        {...(sx !== undefined ? { sx } : {})}
      />
    );

    return (
      <FormControl
        error={error}
        required={required}
        disabled={disabled}
        {...(fullWidth ? { sx: checkboxFullWidthSx } : {})}
      >
        {label !== undefined ? (
          <FormControlLabel
            label={label}
            labelPlacement={labelPlacement}
            control={checkboxElement}
          />
        ) : (
          checkboxElement
        )}

        {helperText !== undefined && (
          <FormHelperText
            sx={checkboxHelperTextSx}
            {...(id !== undefined ? { id: `${id}-helper` } : {})}
          >
            {helperText}
          </FormHelperText>
        )}
      </FormControl>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export default Checkbox;
export { Checkbox };
