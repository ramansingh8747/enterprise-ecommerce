import React from 'react';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import FormHelperText from '@mui/material/FormHelperText';
import RadioGroup, { type RadioGroupProps } from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import MuiRadio from '@mui/material/Radio';
import type { IRadioProps, IRadioOption } from './Radio.types';
import { radioGroupLabelSx, radioHelperTextSx } from './Radio.styles';

/**
 * Enterprise Shared Radio Component (Module 8 - Step 8.6).
 *
 * Composes MUI FormControl + FormLabel + RadioGroup + FormControlLabel +
 * Radio + FormHelperText into a single strongly typed, generic unit.
 * Supports controlled and uncontrolled usage, row layout, per-option
 * disabled state, error state, and full accessibility.
 */
const RadioInner = <T extends string | number = string>(
  {
    options,
    label,
    helperText,
    error = false,
    required = false,
    disabled = false,
    row = false,
    name,
    value,
    defaultValue,
    onChange,
    onBlur,
    size,
    fullWidth = false,
    id,
    formControlSize,
  }: IRadioProps<T>,
  ref: React.ForwardedRef<HTMLDivElement>
): React.ReactElement => {
  const helperId = id !== undefined ? `${id}-helper` : undefined;

  const handleChange: RadioGroupProps['onChange'] = (event): void => {
    if (onChange !== undefined) {
      onChange(event.target.value as T | '');
    }
  };

  return (
    <FormControl
      ref={ref}
      error={error}
      required={required}
      disabled={disabled}
      fullWidth={fullWidth}
      {...(formControlSize !== undefined ? { size: formControlSize } : {})}
      {...(id !== undefined ? { id } : {})}
    >
      {label !== undefined && (
        <FormLabel sx={radioGroupLabelSx}>
          {label}
        </FormLabel>
      )}

      <RadioGroup
        row={row}
        {...(name !== undefined ? { name } : {})}
        {...(value !== undefined ? { value } : {})}
        {...(defaultValue !== undefined ? { defaultValue } : {})}
        {...(onBlur !== undefined ? { onBlur } : {})}
        onChange={handleChange}
        {...(helperId !== undefined ? { 'aria-describedby': helperId } : {})}
      >
        {options.map((option: IRadioOption<T>) => (
          <FormControlLabel
            key={String(option.value)}
            value={option.value}
            label={option.label}
            {...(option.disabled === true ? { disabled: true } : {})}
            control={
              <MuiRadio
                {...(size !== undefined ? { size } : {})}
                {...(option.disabled === true ? { disabled: true } : {})}
              />
            }
          />
        ))}
      </RadioGroup>

      {helperText !== undefined && (
        <FormHelperText
          sx={radioHelperTextSx}
          {...(helperId !== undefined ? { id: helperId } : {})}
        >
          {helperText}
        </FormHelperText>
      )}
    </FormControl>
  );
};

const Radio = React.forwardRef(RadioInner) as <T extends string | number = string>(
  props: IRadioProps<T> & { ref?: React.ForwardedRef<HTMLDivElement> }
) => React.ReactElement;

(Radio as { displayName?: string }).displayName = 'Radio';

export default Radio;
export { Radio };
