import React from 'react';
import { Controller, type FieldValues } from 'react-hook-form';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker as MuiDatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import type { IFormDatePickerProps } from './DatePicker.types';

/**
 * Enterprise Form DatePicker Component (Module 9 - Step 9.9).
 *
 * Wraps MUI X DatePicker in an internal LocalizationProvider for out-of-the-box usage.
 * Integrates with react-hook-form, handles invalid dates, and supports accessibility.
 */
const DatePickerInner = <TFieldValues extends FieldValues = FieldValues>(
  props: IFormDatePickerProps<TFieldValues>,
  ref: React.Ref<unknown>
): React.ReactElement => {
  void ref;
  const {
    name,
    control,
    defaultValue,
    label,
    helperText,
    placeholder,
    required = false,
    disabled = false,
    fullWidth = false,
    minDate,
    maxDate,
    disableFuture = false,
    disablePast = false,
    format = 'YYYY-MM-DD',
    readOnly = false,
  } = props;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
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

          // Parse any stored value (ISO strings or Dayjs) safely
          const parsedValue =
            value && dayjs(value).isValid() ? dayjs(value) : null;

          const textFieldProps = {
            error: hasError,
            required: required,
            fullWidth: fullWidth,
            inputRef: inputRef,
            onBlur: onBlur,
            ...(resolvedHelperText !== undefined ? { helperText: resolvedHelperText } : {}),
            ...(placeholder !== undefined ? { placeholder } : {}),
          };

          return (
            <MuiDatePicker
              value={parsedValue}
              onChange={(newValue) => {
                onChange(newValue);
              }}
              slotProps={{
                textField: textFieldProps,
              }}
              {...(label !== undefined ? { label } : {})}
              {...(disabled !== undefined ? { disabled } : {})}
              {...(readOnly !== undefined ? { readOnly } : {})}
              {...(minDate !== undefined ? { minDate } : {})}
              {...(maxDate !== undefined ? { maxDate } : {})}
              {...(disableFuture !== undefined ? { disableFuture } : {})}
              {...(disablePast !== undefined ? { disablePast } : {})}
              {...(format !== undefined ? { format } : {})}
            />
          );
        }}
      />
    </LocalizationProvider>
  );
};

const DatePicker = React.forwardRef(DatePickerInner) as <
  TFieldValues extends FieldValues = FieldValues
>(
  props: IFormDatePickerProps<TFieldValues> & { ref?: React.Ref<unknown> }
) => React.ReactElement;

(DatePicker as { displayName?: string }).displayName = 'DatePicker';

export default DatePicker;
export { DatePicker };
