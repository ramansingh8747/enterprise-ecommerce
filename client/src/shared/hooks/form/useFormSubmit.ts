import { useState } from 'react';

/**
 * Options configuration for the useFormSubmit hook.
 */
export interface IUseFormSubmitOptions<TData, TResult = unknown> {
  /** The actual async submission callback (e.g. backend RTK Query mutation trigger). */
  onSubmit: (data: TData) => Promise<TResult> | TResult;
  /** Success callback triggered upon successful resolution. */
  onSuccess?: (result: TResult, data: TData) => void | Promise<void>;
  /** Error callback triggered upon catch rejection. */
  onError?: (error: unknown, data: TData) => void | Promise<void>;
}

/**
 * Enterprise useFormSubmit Hook (Module 9 - Step 9.16).
 *
 * Provides a standardized submission wrapper that coordinates local loading/submitting states,
 * captures errors, handles callbacks, and keeps business logic cleanly separated from presentation.
 */
export function useFormSubmit<TData, TResult = unknown>(
  options: IUseFormSubmitOptions<TData, TResult>
) {
  const { onSubmit, onSuccess, onError } = options;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<unknown | null>(null);

  const handleSubmit = async (data: TData): Promise<TResult> => {
    setIsSubmitting(true);
    setError(null);
    try {
      const result = await onSubmit(data);
      if (onSuccess) {
        await onSuccess(result, data);
      }
      return result;
    } catch (err) {
      setError(err);
      if (onError) {
        await onError(err, data);
      }
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    /** Submit handler to be passed to form execution elements. */
    handleSubmit,
    /** Local submitting state. */
    isSubmitting,
    /** Captured error payload. */
    error,
    /** Clears the local submission error. */
    clearError: () => setError(null),
  };
}
