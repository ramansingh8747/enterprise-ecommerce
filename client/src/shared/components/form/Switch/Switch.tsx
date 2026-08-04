import React from 'react';
import { Controller, type FieldValues } from 'react-hook-form';
import { Switch as SharedSwitch } from '../../../ui/switch';
import type { IFormSwitchProps } from './Switch.types';

/**
 * Enterprise Form Switch Component (Module 9 - Step 9.8).
 *
 * Integrates the atomic Shared UI Switch component with react-hook-form Controller.
 * Handles checkbox toggle bindings, change events, and validation errors automatically.
 */
const SwitchInner = <TFieldValues extends FieldValues = FieldValues>(
  props: IFormSwitchProps<TFieldValues>,
  ref: React.Ref<HTMLButtonElement>
): React.ReactElement => {
  void ref;
  const {
    name,
    control,
    defaultValue,
    label,
    helperText,
    required = false,
    disabled = false,
    fullWidth = false,
    labelPlacement = 'end',
    id,
    size,
    value,
    color,
    sx,
  } = props;

  return (
    <Controller
      name={name}
      control={control}
      {...(defaultValue !== undefined ? { defaultValue } : {})}
      render={({
        field: { value: checkedValue, onChange, onBlur, ref: inputRef },
        fieldState: { error },
      }) => {
        const hasError = error !== undefined;
        const resolvedHelperText = hasError ? error.message : helperText;

        return (
          <SharedSwitch
            ref={inputRef}
            name={name}
            checked={Boolean(checkedValue ?? false)}
            onChange={onChange}
            onBlur={onBlur}
            error={hasError}
            disabled={disabled}
            required={required}
            fullWidth={fullWidth}
            labelPlacement={labelPlacement}
            {...(label !== undefined ? { label } : {})}
            {...(resolvedHelperText !== undefined ? { helperText: resolvedHelperText } : {})}
            {...(id !== undefined ? { id } : {})}
            {...(size !== undefined ? { size } : {})}
            {...(value !== undefined ? { value } : {})}
            {...(color !== undefined ? { color } : {})}
            {...(sx !== undefined ? { sx } : {})}
          />
        );
      }}
    />
  );
};

const Switch = React.forwardRef(SwitchInner) as <
  TFieldValues extends FieldValues = FieldValues
>(
  props: IFormSwitchProps<TFieldValues> & { ref?: React.Ref<HTMLButtonElement> }
) => React.ReactElement;

(Switch as { displayName?: string }).displayName = 'Switch';

export default Switch;
export { Switch };
