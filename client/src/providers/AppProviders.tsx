import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Provider as ReduxProvider } from 'react-redux';
import { appTheme } from '@/styles/theme';
import { store } from '@/store';
import { RouteProvider } from '@/routes';
import type { IProviderProps } from './ProviderProps';

/**
 * Root Application Providers Composition Wrapper (Module 5 - Step 5.2).
 *
 * Single entry point for wrapping the application tree with global context providers.
 * Composes ThemeProvider, CssBaseline, Redux Provider, and RouteProvider in strict ordering.
 */
export const AppProviders: React.FC<IProviderProps> = ({ children }) => {
  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <ReduxProvider store={store}>
        <RouteProvider>{children}</RouteProvider>
      </ReduxProvider>
    </ThemeProvider>
  );
};

export default AppProviders;
