import type { AuthFormType } from './auth-form.enums';

/**
 * Auth Form Generic Interfaces (Module 7 - Step 7.3).
 *
 * Framework-agnostic form field states, error envelopes, and form metadata.
 */

export interface IFormFieldState<T = string> {
  readonly value: T;
  readonly isTouched: boolean;
  readonly isDirty: boolean;
  readonly error?: string;
}

export interface IFormStatus {
  readonly isSubmitting: boolean;
  readonly isValidating: boolean;
  readonly isSuccess: boolean;
  readonly errorCount: number;
}

export interface IFormError {
  readonly field: string;
  readonly message: string;
  readonly code?: string;
}

export interface IFormMetadata {
  readonly formId: string;
  readonly formType: AuthFormType;
  readonly createdAt: string;
  readonly isDirty: boolean;
}
