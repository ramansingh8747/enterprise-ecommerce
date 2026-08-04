import React from 'react';
import { Controller, type FieldValues } from 'react-hook-form';
import Box from '@mui/material/Box';
import { Input as SharedInput } from '../../../ui/input';
import type { IFormTextareaProps } from './Textarea.types';

/**
 * Enterprise Form Textarea Component (Module 9 - Step 9.10).
 *
 * Integrates the atomic Shared UI Input component configured for multiline layout
 * with react-hook-form Controller. Supports character counting and custom resize logic.
 */
const TextareaInner = <TFieldValues extends FieldValues = FieldValues>(
  props: IFormTextareaProps<TFieldValues>,
  ref: React.Ref<HTMLDivElement>
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
    rows,
    minRows,
    maxRows,
    maxLength,
    showCharacterCount = false,
    resize = 'none',
    size,
    variant,
    id,
    readOnly = false,
    inputProps,
    sx,
    ...restProps
  } = props;

  const textareaSx = {
    '& textarea': {
      resize,
    },
    ...sx,
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
        const currentLength = (value as string | undefined)?.length ?? 0;

        // Custom helper node merging description text and character counter
        const characterCountHelper =
          showCharacterCount && maxLength !== undefined ? (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              <span>{resolvedHelperText ?? ''}</span>
              <Box component="span" sx={{ ml: 'auto', pl: 1 }}>
                {currentLength} / {maxLength}
              </Box>
            </Box>
          ) : (
            resolvedHelperText
          );

        return (
          <SharedInput
            ref={ref}
            inputRef={inputRef}
            name={name}
            value={(value as string | undefined) ?? ''}
            onChange={onChange}
            onBlur={onBlur}
            error={hasError}
            disabled={disabled}
            required={required}
            fullWidth={fullWidth}
            multiline
            sx={textareaSx}
            inputProps={{
              ...inputProps,
              ...(maxLength !== undefined ? { maxLength } : {}),
              ...(readOnly ? { readOnly: true } : {}),
            }}
            {...(label !== undefined ? { label } : {})}
            {...(characterCountHelper !== undefined ? { helperText: characterCountHelper } : {})}
            {...(placeholder !== undefined ? { placeholder } : {})}
            {...(rows !== undefined ? { rows } : {})}
            {...(minRows !== undefined ? { minRows } : {})}
            {...(maxRows !== undefined ? { maxRows } : {})}
            {...(size !== undefined ? { size } : {})}
            {...(variant !== undefined ? { variant } : {})}
            {...(id !== undefined ? { id } : {})}
            {...restProps}
          />
        );
      }}
    />
  );
};

const Textarea = React.forwardRef(TextareaInner) as <
  TFieldValues extends FieldValues = FieldValues
>(
  props: IFormTextareaProps<TFieldValues> & { ref?: React.Ref<HTMLDivElement> }
) => React.ReactElement;

(Textarea as { displayName?: string }).displayName = 'Textarea';

export default Textarea;
export { Textarea };
