import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import type { IProviderProps } from '@/providers/ProviderProps';

/**
 * Enterprise Routing Provider Component (Module 4 - Step 4.2).
 *
 * Integrates React Router v7 BrowserRouter container around the application tree.
 */
export const RouteProvider: React.FC<IProviderProps> = ({ children }) => {
  return <BrowserRouter>{children}</BrowserRouter>;
};

export default RouteProvider;
