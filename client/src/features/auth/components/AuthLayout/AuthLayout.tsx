import React from 'react';

export interface IAuthLayoutProps {
  readonly children: React.ReactNode;
}

/**
 * Auth Layout Component Placeholder (Module 7 - Step 7.5).
 *
 * Root container wrapping all authentication pages.
 */
const AuthLayout: React.FC<IAuthLayoutProps> = ({ children }) => {
  return <div data-testid="auth-layout">{children}</div>;
};

AuthLayout.displayName = 'AuthLayout';

export default AuthLayout;
