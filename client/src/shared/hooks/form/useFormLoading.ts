/**
 * Configuration options for the useFormLoading hook.
 */
export interface IUseFormLoadingParams {
  /** React Hook Form isSubmitting state. */
  isSubmitting?: boolean;
  /** RTK Query status objects or other loading booleans. */
  asyncStates?: Array<boolean | { isLoading?: boolean; isFetching?: boolean } | null | undefined>;
}

/**
 * Enterprise useFormLoading Hook (Module 9 - Step 9.16).
 *
 * Consolidates React Hook Form submission status with RTK Query and other API loading booleans.
 * Yields unified derived states to manage overlay masks and action button disabled modes.
 */
export function useFormLoading(params: IUseFormLoadingParams = {}) {
  const { isSubmitting = false, asyncStates = [] } = params;

  const isAsyncLoading = asyncStates.some((state) => {
    if (!state) return false;
    if (typeof state === 'boolean') {
      return state;
    }
    return !!(state.isLoading || state.isFetching);
  });

  return {
    /** True if either the form is submitting or any backend mutations/queries are loading. */
    isLoading: isSubmitting || isAsyncLoading,
    /** Direct React Hook Form isSubmitting flag. */
    isSubmitting,
    /** Direct derived async API states flag. */
    isAsyncLoading,
  };
}
