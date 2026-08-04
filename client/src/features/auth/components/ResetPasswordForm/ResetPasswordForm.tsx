import React from 'react';

export interface IResetPasswordFormProps {
  readonly token?: string;
  readonly onSuccess?: () => void;
}

/**
 * Reset Password Form Component Placeholder (Module 7 - Step 7.5).
 */
const ResetPasswordForm: React.FC<IResetPasswordFormProps> = (_props) => {
  return <div data-testid="reset-password-form" />;
};

ResetPasswordForm.displayName = 'ResetPasswordForm';

export default ResetPasswordForm;
