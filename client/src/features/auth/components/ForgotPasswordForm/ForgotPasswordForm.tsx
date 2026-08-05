import React from 'react';

export interface IForgotPasswordFormProps {
  readonly onSuccess?: () => void;
}

/**
 * Forgot Password Form Component Placeholder (Module 7 - Step 7.5).
 */
const ForgotPasswordForm: React.FC<IForgotPasswordFormProps> = () => {
  return <div data-testid="forgot-password-form" />;
};

ForgotPasswordForm.displayName = 'ForgotPasswordForm';

export default ForgotPasswordForm;
