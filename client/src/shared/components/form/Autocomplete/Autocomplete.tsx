import React from 'react';
import { Controller, type FieldValues } from 'react-hook-form';
import MuiAutocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import type { IFormAutocompleteProps } from './Autocomplete.types';

/**
 * Enterprise Form Autocomplete Component (Module 9 - Step 9.5).
 *
 * Wraps MUI Autocomplete to provide searchable selection functionality.
 * Resolves generic data records typesafely and binds selection state cleanly to RHF.
 */
const AutocompleteInner = <
  TFieldValues extends FieldValues = FieldValues,
  TOption extends Record<string, unknown> = Record<string, unknown>
>(
  props: IFormAutocompleteProps<TFieldValues, TOption>,
  ref: React.Ref<unknown>
): React.ReactElement => {
  void ref;
  const {
    name,
    control,
    options,
    optionLabel,
    optionValue,
    label,
    placeholder,
    helperText,
    required = false,
    disabled = false,
    fullWidth = false,
    defaultValue,
    loading = false,
    loadingText,
    noOptionsText,
    size = 'medium',
    variant = 'outlined',
    sx,
    id,
  } = props;

  const handleGetOptionLabel = (option: TOption): string => {
    return String(option[optionLabel] ?? '');
  };

  const handleIsOptionEqualToValue = (option: TOption, value: TOption): boolean => {
    return option[optionValue] === value[optionValue];
  };

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

        // Locate the currently selected option object by value
        const selectedOption =
          options.find((opt) => opt[optionValue] === value) ?? null;

        return (
          <MuiAutocomplete<TOption, false, false, false>
            ref={inputRef}
            options={options as TOption[]}
            value={selectedOption}
            onChange={(_event, newValue) => {
              onChange(newValue ? newValue[optionValue] : null);
            }}
            onBlur={onBlur}
            getOptionLabel={handleGetOptionLabel}
            isOptionEqualToValue={handleIsOptionEqualToValue}
            disabled={disabled}
            loading={loading}
            renderInput={(params) => {
              // Destructure size and InputLabelProps to bypass exactOptionalPropertyTypes clashes on the inner TextField
              const { size: paramsSize, InputLabelProps, ...restParams } = params;
              const InputProps = restParams.InputProps;
              const labelProps = InputLabelProps as Record<string, unknown>;

              return (
                <TextField
                  {...restParams}
                  {...(paramsSize !== undefined ? { size: paramsSize } : {})}
                  InputLabelProps={{
                    ...(labelProps.htmlFor !== undefined ? { htmlFor: String(labelProps.htmlFor) } : {}),
                    ...(labelProps.id !== undefined ? { id: String(labelProps.id) } : {}),
                    ...(labelProps.className !== undefined ? { className: String(labelProps.className) } : {}),
                  }}
                  {...(label !== undefined ? { label } : {})}
                  {...(placeholder !== undefined ? { placeholder } : {})}
                  error={hasError}
                  {...(resolvedHelperText !== undefined ? { helperText: resolvedHelperText } : {})}
                  required={required}
                  variant={variant}
                  InputProps={{
                    ...InputProps,
                    endAdornment: (
                      <React.Fragment>
                        {loading ? (
                          <CircularProgress color="inherit" size={16} />
                        ) : null}
                        {InputProps.endAdornment as React.ReactNode}
                      </React.Fragment>
                    ),
                  }}
                />
              );
            }}
            {...((loadingText !== undefined) ? { loadingText } : {})}
            {...((noOptionsText !== undefined) ? { noOptionsText } : {})}
            {...((size !== undefined) ? { size } : {})}
            {...((id !== undefined) ? { id } : {})}
            {...((sx !== undefined) ? { sx } : {})}
            {...((fullWidth !== undefined) ? { fullWidth } : {})}
          />
        );
      }}
    />
  );
};

const Autocomplete = React.forwardRef(AutocompleteInner) as <
  TFieldValues extends FieldValues = FieldValues,
  TOption extends Record<string, unknown> = Record<string, unknown>
>(
  props: IFormAutocompleteProps<TFieldValues, TOption> & {
    ref?: React.Ref<unknown>;
  }
) => React.ReactElement;

(Autocomplete as { displayName?: string }).displayName = 'Autocomplete';

export default Autocomplete;
export { Autocomplete };
