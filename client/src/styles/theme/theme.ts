import { createTheme } from '@mui/material/styles';
import { paletteOptions } from './palette';
import { typographyOptions } from './typography';
import { shapeOptions } from './shape';
import { shadowsOptions } from './shadows';
import { componentsOptions } from './components';

/**
 * Enterprise Material UI Theme Instance (Module 3 - Step 3.2).
 *
 * Assembles modular palette, typography, shape, shadow, and component options into a unified MUI Theme.
 */
export const appTheme = createTheme({
  palette: paletteOptions,
  typography: typographyOptions,
  shape: shapeOptions,
  shadows: shadowsOptions,
  components: componentsOptions,
});

export default appTheme;
