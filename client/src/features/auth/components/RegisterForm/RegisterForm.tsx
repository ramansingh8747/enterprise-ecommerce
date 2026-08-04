import React from 'react';

export interface IRegisterFormProps {
  readonly onSuccess?: () => void;
}

/**
 * Register Form Component Placeholder (Module 7 - Step 7.5).
 */
const RegisterForm: React.FC<IRegisterFormProps> = (_props) => {
  return <div data-testid="register-form" />;
};

RegisterForm.displayName = 'RegisterForm';

export default RegisterForm;
