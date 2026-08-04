import React from 'react';
import { Controller, type FieldValues } from 'react-hook-form';
import { Radio as SharedRadio } from '../../../ui/radio';
import type { IFormRadioGroupProps } from './RadioGroup.types';

/**
 * Enterprise Form RadioGroup Component (Module 9 - Step 9.7).
 *
 * Integrates the atomic Shared Radio component with react-hook-form Controller.
 * Resolves generic options dynamically via user-supplied optionLabel/optionValue keys.
 */
const RadioGroupInner = <
  TFieldValues extends FieldValues = FieldValues,
  TOption extends Record<string, unknown> = Record<string, unknown>,
  TValue extends string | number = string
>(
  props: IFormRadioGroupProps<TFieldValues, TOption, TValue>,
  ref: React.Ref<HTMLDivElement>
): React.ReactElement => {
  void ref;
  const {
    name,
    control,
    options,
    optionLabel,
    optionValue,
    defaultValue,
    label,
    helperText,
    required = false,
    disabled = false,
    row = false,
    size,
    fullWidth = false,
    id,
    formControlSize,
  } = props;

  // Convert generic user options to standard IRadioOption format
  const mappedOptions = React.useMemo(() => {
    return options.map((opt) => ({
      label: String(opt[optionLabel] ?? ''),
      value: opt[optionValue] as TValue,
      disabled: opt.disabled === true,
    }));
  }, [options, optionLabel, optionValue]);

  return (
    <Controller
      name={name}
      control={control}
      {...(defaultValue !== undefined ? { defaultValue } : {})}
      render={({
        field: { value, onChange, onBlur, ref: inputRef },
        fieldState: { error },
      }) => {
        const hasError = error !== undefined;
        const resolvedHelperText = hasError ? error.message : helperText;

        return (
          <SharedRadio<TValue>
            ref={inputRef}
            name={name}
            options={mappedOptions}
            value={(value as TValue | undefined) ?? ''}
            onChange={onChange}
            onBlur={onBlur}
            error={hasError}
            disabled={disabled}
            required={required}
            row={row}
            fullWidth={fullWidth}
            {...(label !== undefined ? { label } : {})}
            {...(resolvedHelperText !== undefined ? { helperText: resolvedHelperText } : {})}
            {...(size !== undefined ? { size } : {})}
            {...(id !== undefined ? { id } : {})}
            {...(formControlSize !== undefined ? { formControlSize } : {})}
          />
        );
      }}
    />
  );
};

const RadioGroup = React.forwardRef(RadioGroupInner) as <
  TFieldValues extends FieldValues = FieldValues,
  TOption extends Record<string, unknown> = Record<string, unknown>,
  TValue extends string | number = string
>(
  props: IFormRadioGroupProps<TFieldValues, TOption, TValue> & {
    ref?: React.Ref<HTMLDivElement>;
  }
) => React.ReactElement;

(RadioGroup as { displayName?: string }).displayName = 'RadioGroup';

export default RadioGroup;
export { RadioGroup };
