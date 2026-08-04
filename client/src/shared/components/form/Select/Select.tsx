import React from 'react';
import { Controller, type FieldValues } from 'react-hook-form';
import { Select as SharedSelect } from '../../../ui/select';
import type { IFormSelectProps } from './Select.types';

/**
 * Enterprise Form Select Component (Module 9 - Step 9.4).
 *
 * Integrates the atomic Shared UI Select component with react-hook-form Controller.
 * Resolves generic option collections dynamically through user-provided optionLabel/optionValue keys.
 */
const SelectInner = <
  TFieldValues extends FieldValues = FieldValues,
  TOption extends Record<string, unknown> = Record<string, unknown>,
  TValue extends string | number = string
>(
  props: IFormSelectProps<TFieldValues, TOption, TValue>,
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
    helperText,
    disabled = false,
    required = false,
    label,
    placeholder,
    loading,
    loadingText,
    size,
    variant,
    id,
    'aria-label': ariaLabel,
  } = props;

  // Convert generic user options to standard ISelectOption format
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
          <SharedSelect<TValue>
            ref={inputRef}
            options={mappedOptions}
            value={(value as TValue | undefined) ?? ''}
            onChange={onChange}
            onBlur={onBlur}
            error={hasError}
            disabled={disabled}
            required={required}
            {...(resolvedHelperText !== undefined ? { helperText: resolvedHelperText } : {})}
            {...(label !== undefined ? { label } : {})}
            {...(placeholder !== undefined ? { placeholder } : {})}
            {...(loading !== undefined ? { loading } : {})}
            {...(loadingText !== undefined ? { loadingText } : {})}
            {...(size !== undefined ? { size } : {})}
            {...(variant !== undefined ? { variant } : {})}
            {...(id !== undefined ? { id } : {})}
            {...(ariaLabel !== undefined ? { 'aria-label': ariaLabel } : {})}
          />
        );
      }}
    />
  );
};

const Select = React.forwardRef(SelectInner) as <
  TFieldValues extends FieldValues = FieldValues,
  TOption extends Record<string, unknown> = Record<string, unknown>,
  TValue extends string | number = string
>(
  props: IFormSelectProps<TFieldValues, TOption, TValue> & {
    ref?: React.Ref<HTMLDivElement>;
  }
) => React.ReactElement;

(Select as { displayName?: string }).displayName = 'Select';

export default Select;
export { Select };
