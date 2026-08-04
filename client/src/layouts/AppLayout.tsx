import React from 'react';
import type { ILayoutProps } from './layout.types';

/**
 * Enterprise Master Application Layout (Module 4 - Step 4.4).
 *
 * Top-level master layout container component.
 */
export const AppLayout: React.FC<ILayoutProps> = ({ children }) => {
  return <>{children}</>;
};

export default AppLayout;
