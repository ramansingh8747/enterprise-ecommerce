import React from 'react';
import type { ILayoutProps } from './layout.types';

/**
 * Enterprise Error Page Layout (Module 4 - Step 4.4).
 *
 * Layout placeholder for 404, 401, 403, and 500 error pages.
 */
export const ErrorLayout: React.FC<ILayoutProps> = ({ children }) => {
  return <>{children}</>;
};

export default ErrorLayout;
