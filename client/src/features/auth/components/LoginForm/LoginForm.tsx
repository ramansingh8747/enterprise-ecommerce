import React from 'react';

export interface ILoginFormProps {
  readonly onSuccess?: () => void;
}

/**
 * Login Form Component Placeholder (Module 7 - Step 7.5).
 */
const LoginForm: React.FC<ILoginFormProps> = () => {
  return <div data-testid="login-form" />;
};

LoginForm.displayName = 'LoginForm';

export default LoginForm;
