import type { PaletteOptions } from '@mui/material/styles';
import { COLOR_TOKENS } from '../tokens/colors.tokens';

/**
 * Enterprise Material UI Palette Configuration (Module 3 - Step 3.2).
 *
 * Driven exclusively by COLOR_TOKENS. Contains ZERO hardcoded color hex values.
 */
export const paletteOptions: PaletteOptions = {
  mode: 'light',
  primary: {
    main: COLOR_TOKENS.brand.primary,
    light: COLOR_TOKENS.brand.primaryLight,
    dark: COLOR_TOKENS.brand.primaryHover,
    contrastText: COLOR_TOKENS.text.inverse,
  },
  secondary: {
    main: COLOR_TOKENS.brand.secondary,
    light: COLOR_TOKENS.brand.secondaryLight,
    dark: COLOR_TOKENS.brand.secondaryHover,
    contrastText: COLOR_TOKENS.text.inverse,
  },
  success: {
    main: COLOR_TOKENS.semantic.success,
    light: COLOR_TOKENS.semantic.successLight,
    dark: COLOR_TOKENS.semantic.successDark,
    contrastText: COLOR_TOKENS.text.inverse,
  },
  warning: {
    main: COLOR_TOKENS.semantic.warning,
    light: COLOR_TOKENS.semantic.warningLight,
    dark: COLOR_TOKENS.semantic.warningDark,
    contrastText: COLOR_TOKENS.text.inverse,
  },
  error: {
    main: COLOR_TOKENS.semantic.error,
    light: COLOR_TOKENS.semantic.errorLight,
    dark: COLOR_TOKENS.semantic.errorDark,
    contrastText: COLOR_TOKENS.text.inverse,
  },
  info: {
    main: COLOR_TOKENS.semantic.info,
    light: COLOR_TOKENS.semantic.infoLight,
    dark: COLOR_TOKENS.semantic.infoDark,
    contrastText: COLOR_TOKENS.text.inverse,
  },
  background: {
    default: COLOR_TOKENS.background.default,
    paper: COLOR_TOKENS.background.paper,
  },
  text: {
    primary: COLOR_TOKENS.text.primary,
    secondary: COLOR_TOKENS.text.secondary,
    disabled: COLOR_TOKENS.text.disabled,
  },
  divider: COLOR_TOKENS.border.default,
};
