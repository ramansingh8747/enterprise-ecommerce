import React from 'react';
import { Controller, type FieldValues } from 'react-hook-form';
import { Input as SharedInput } from '../../../ui/input';
import type { IFormInputProps } from './Input.types';

/**
 * Enterprise Form Input Component (Module 9 - Step 9.2).
 *
 * Integrates the atomic Shared UI Input component with react-hook-form Controller.
 * Manages value binding, onBlur validation, error feedback message displays,
 * and passes the field ref down for automated focus on error.
 */
const InputInner = <TFieldValues extends FieldValues = FieldValues>(
  {
    name,
    control,
    defaultValue,
    readOnly = false,
    helperText,
    disabled = false,
    required = false,
    inputProps,
    ...props
  }: IFormInputProps<TFieldValues>,
  ref: React.ForwardedRef<HTMLDivElement>
): React.ReactElement => {
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
        // If error exists from react-hook-form, display its message. Otherwise show helperText.
        const resolvedHelperText = hasError ? error.message : helperText;

        return (
          <SharedInput
            ref={ref}
            inputRef={inputRef}
            name={name}
            value={(value as string | undefined) ?? ''}
            onChange={onChange}
            onBlur={onBlur}
            error={hasError}
            helperText={resolvedHelperText}
            disabled={disabled}
            required={required}
            inputProps={{
              ...inputProps,
              ...(readOnly ? { readOnly: true } : {}),
            }}
            {...props}
          />
        );
      }}
    />
  );
};

const Input = React.forwardRef(InputInner) as <
  TFieldValues extends FieldValues = FieldValues
>(
  props: IFormInputProps<TFieldValues> & { ref?: React.Ref<HTMLDivElement> }
) => React.ReactElement;

(Input as { displayName?: string }).displayName = 'Input';

export default Input;
export { Input };
