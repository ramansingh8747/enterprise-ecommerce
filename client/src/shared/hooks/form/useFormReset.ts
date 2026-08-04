import type { UseFormReset as RHFReset, FieldValues } from 'react-hook-form';

/**
 * Configuration options for the useFormReset hook.
 */
export interface IUseFormResetOptions<TFieldValues extends FieldValues> {
  /** React Hook Form reset function from useForm context. */
  resetFn: RHFReset<TFieldValues>;
  /** Optional form default values to reset fields to. */
  defaultValues?: Partial<TFieldValues>;
}

/**
 * Enterprise useFormReset Hook (Module 9 - Step 9.16).
 *
 * Provides reusable helpers to manage form reset workflows, supporting complete resets,
 * resetting specific fields while preserving others, or partial field updates.
 */
export function useFormReset<TFieldValues extends FieldValues>(
  options: IUseFormResetOptions<TFieldValues>
) {
  const { resetFn, defaultValues } = options;

  /**
   * Resets the entire form back to defaults or a set of provided custom values.
   */
  const resetAll = (values?: Partial<TFieldValues>) => {
    resetFn((values || defaultValues) as TFieldValues);
  };

  /**
   * Resets the form but preserves the values of specific fields.
   */
  const resetExcept = (
    fieldsToPreserve: Array<keyof TFieldValues>,
    currentValues: TFieldValues,
    newValues?: Partial<TFieldValues>
  ) => {
    const nextValues = {
      ...(newValues || defaultValues),
    } as Partial<TFieldValues>;

    // Copy selected field values from the current active values list
    fieldsToPreserve.forEach((field) => {
      nextValues[field] = currentValues[field];
    });

    resetFn(nextValues as TFieldValues);
  };

  /**
   * Resets only specific fields, leaving all other active field values untouched.
   */
  const resetOnly = (
    fieldsToReset: Array<keyof TFieldValues>,
    currentValues: TFieldValues,
    resetValues?: Partial<TFieldValues>
  ) => {
    const nextValues = {
      ...currentValues,
    };

    // Replace selected fields with default values or specified custom targets
    fieldsToReset.forEach((field) => {
      const defaultValue = resetValues?.[field] ?? defaultValues?.[field];
      if (defaultValue !== undefined) {
        nextValues[field] = defaultValue as TFieldValues[keyof TFieldValues];
      }
    });

    resetFn(nextValues);
  };

  return {
    resetAll,
    resetExcept,
    resetOnly,
  };
}
