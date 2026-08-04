import React from 'react';
import { Controller, type FieldValues } from 'react-hook-form';
import { Checkbox as SharedCheckbox } from '../../../ui/checkbox';
import type { IFormCheckboxProps } from './Checkbox.types';

/**
 * Enterprise Form Checkbox Component (Module 9 - Step 9.6).
 *
 * Integrates the atomic Shared UI Checkbox component with react-hook-form Controller.
 * Handles checkbox checked states, events, and validation errors automatically.
 */
const CheckboxInner = <TFieldValues extends FieldValues = FieldValues>(
  props: IFormCheckboxProps<TFieldValues>,
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
    indeterminate,
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
          <SharedCheckbox
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
            {...(indeterminate !== undefined ? { indeterminate } : {})}
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

const Checkbox = React.forwardRef(CheckboxInner) as <
  TFieldValues extends FieldValues = FieldValues
>(
  props: IFormCheckboxProps<TFieldValues> & { ref?: React.Ref<HTMLButtonElement> }
) => React.ReactElement;

(Checkbox as { displayName?: string }).displayName = 'Checkbox';

export default Checkbox;
export { Checkbox };
