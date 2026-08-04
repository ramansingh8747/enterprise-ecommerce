import type { CircularProgressProps as MuiCircularProgressProps } from '@mui/material/CircularProgress';

/**
 * Enterprise Spinner Component Types (Module 8 - Step 8.17).
 *
 * Inherits safe properties from Material UI CircularProgressProps while extending
 * with custom full-screen, overlays, centered alignment, delay and text support.
 */
export interface ISpinnerProps
  extends Pick<
    MuiCircularProgressProps,
    | 'thickness'
    | 'variant'
    | 'value'
    | 'sx'
  > {
  /** Diameter of the spinner. Can be a number (pixels) or string (css size). */
  size?: number | string;
  /** Color theme variant of the spinner. Defaults to 'primary'. */
  color?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' | 'inherit';
  /** Screen reader label for accessibility. */
  label?: string;
  /** When true, renders a translucent overlay container block over parents. */
  overlay?: boolean;
  /** When true, covers the entire viewport with a translucent backdrop overlay. */
  fullScreen?: boolean;
  /** When true, centers the spinner within its immediate layout container. */
  centered?: boolean;
  /** Milliseconds to delay before showing the loading spinner to prevent UI flickers. */
  delay?: number;
  /** Optional subtitle or status description text below the spinner. */
  message?: string;
}
