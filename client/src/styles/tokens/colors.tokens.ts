/**
 * Enterprise Color Tokens (Module 3 - Step 3.1).
 *
 * Framework-agnostic color definitions for brand, semantic, neutral, text, background, and borders.
 */

export const COLOR_TOKENS = Object.freeze({
  brand: Object.freeze({
    primary: '#2563eb',
    primaryHover: '#1d4ed8',
    primaryActive: '#1e40af',
    primaryLight: '#eff6ff',
    secondary: '#0f172a',
    secondaryHover: '#1e293b',
    secondaryLight: '#f8fafc',
    accent: '#8b5cf6',
    accentHover: '#7c3aed',
  }),

  semantic: Object.freeze({
    success: '#10b981',
    successLight: '#ecfdf5',
    successDark: '#047857',
    warning: '#f59e0b',
    warningLight: '#fffbeb',
    warningDark: '#b45309',
    error: '#ef4444',
    errorLight: '#fef2f2',
    errorDark: '#b91c1c',
    info: '#3b82f6',
    infoLight: '#eff6ff',
    infoDark: '#1d4ed8',
  }),

  neutral: Object.freeze({
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617',
    white: '#ffffff',
    black: '#000000',
  }),

  text: Object.freeze({
    primary: '#0f172a',
    secondary: '#475569',
    muted: '#94a3b8',
    disabled: '#cbd5e1',
    inverse: '#ffffff',
  }),

  background: Object.freeze({
    default: '#f8fafc',
    paper: '#ffffff',
    subtle: '#f1f5f9',
    dark: '#0f172a',
    darkPaper: '#1e293b',
  }),

  border: Object.freeze({
    default: '#e2e8f0',
    subtle: '#f1f5f9',
    strong: '#cbd5e1',
    focus: '#2563eb',
  }),
});
