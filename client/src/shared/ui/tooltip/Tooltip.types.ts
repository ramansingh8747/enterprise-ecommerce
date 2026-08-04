import type { TooltipProps as MuiTooltipProps } from '@mui/material/Tooltip';

/**
 * Enterprise Tooltip Component Types (Module 8 - Step 8.21).
 *
 * Safe subset of properties is picked to avoid conflicts under exactOptionalPropertyTypes.
 */
export interface ITooltipProps
  extends Pick<
    MuiTooltipProps,
    | 'placement'
    | 'arrow'
    | 'followCursor'
    | 'enterDelay'
    | 'leaveDelay'
    | 'disableHoverListener'
    | 'disableFocusListener'
    | 'disableTouchListener'
    | 'open'
    | 'sx'
  > {
  /** The tooltip text description or overlay content. */
  title: React.ReactNode;
  /** The hover trigger element. Must be a single React element. */
  children: React.ReactElement;
  /** When true, overrides title with a typesafe spinner loading representation. */
  loading?: boolean;
}
