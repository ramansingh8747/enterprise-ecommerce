import React from 'react';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import MuiSwitch from '@mui/material/Switch';
import type { ISwitchProps } from './Switch.types';
import { switchFullWidthSx, switchHelperTextSx } from './Switch.styles';

/**
 * Enterprise Shared Switch Component (Module 8 - Step 8.7).
 *
 * Composes MUI FormControl + FormControlLabel + Switch + FormHelperText into a
 * single strongly typed unit. Supports controlled and uncontrolled usage,
 * error state, helper text, required state, and full accessibility.
 */
const Switch = React.forwardRef<HTMLButtonElement, ISwitchProps>(
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
      onChange,
      onBlur,
      name,
      value,
      size,
      color,
      sx,
    },
    ref
  ) => {
    const helperId = id !== undefined ? `${id}-helper` : undefined;

    const switchElement = (
      <MuiSwitch
        ref={ref}
        disabled={disabled}
        required={required}
        {...(onChange !== undefined ? { onChange } : {})}
        {...(onBlur !== undefined ? { onBlur } : {})}
        {...(id !== undefined ? { id } : {})}
        {...(checked !== undefined ? { checked } : {})}
        {...(defaultChecked !== undefined ? { defaultChecked } : {})}
        {...(name !== undefined ? { name } : {})}
        {...(value !== undefined ? { value } : {})}
        {...(size !== undefined ? { size } : {})}
        {...(color !== undefined ? { color } : {})}
        {...(sx !== undefined ? { sx } : {})}
        {...(helperId !== undefined
          ? { inputProps: { 'aria-describedby': helperId } }
          : {})}
      />
    );

    return (
      <FormControl
        error={error}
        required={required}
        disabled={disabled}
        {...(fullWidth ? { sx: switchFullWidthSx } : {})}
      >
        {label !== undefined ? (
          <FormControlLabel
            label={label}
            labelPlacement={labelPlacement}
            control={switchElement}
          />
        ) : (
          switchElement
        )}

        {helperText !== undefined && (
          <FormHelperText
            sx={switchHelperTextSx}
            {...(helperId !== undefined ? { id: helperId } : {})}
          >
            {helperText}
          </FormHelperText>
        )}
      </FormControl>
    );
  }
);

Switch.displayName = 'Switch';

export default Switch;
export { Switch };
