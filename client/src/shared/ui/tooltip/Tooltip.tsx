import React from 'react';
import MuiTooltip from '@mui/material/Tooltip';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import type { SxProps, Theme } from '@mui/material';
import type { ITooltipProps } from './Tooltip.types';
import { tooltipLoadingSx, tooltipRootSx } from './Tooltip.styles';

/**
 * Combines multiple SxProps into a single style object.
 */
const combineSx = (...parts: Array<SxProps<Theme> | undefined>): SxProps<Theme> =>
  Object.assign({}, ...parts.filter((p): p is SxProps<Theme> => p !== undefined && p !== null));

/**
 * Enterprise Shared Tooltip Component (Module 8 - Step 8.21).
 *
 * Wraps MUI Tooltip to render helper context boxes on child hovering/focus.
 * Supports custom placements, arrow toggles, followCursor layout, and a typesafe
 * loader overlay inside.
 */
const Tooltip = React.forwardRef<HTMLElement, ITooltipProps>(
  (
    {
      title,
      children,
      placement = 'bottom',
      arrow = true,
      followCursor = false,
      enterDelay = 200,
      leaveDelay = 0,
      disableHoverListener = false,
      disableFocusListener = false,
      disableTouchListener = false,
      open,
      loading = false,
      sx,
    },
    ref
  ) => {
    // Override tooltip title text if loading
    const resolvedTitle = loading ? (
      <Box sx={tooltipLoadingSx}>
        <CircularProgress size={12} thickness={5} color="inherit" />
        <span>Loading...</span>
      </Box>
    ) : (
      title
    );

    const tooltipSx = combineSx(tooltipRootSx, sx);

    return (
      <MuiTooltip
        ref={ref}
        title={resolvedTitle}
        placement={placement}
        arrow={arrow}
        {...(followCursor !== undefined ? { followCursor } : {})}
        {...(enterDelay !== undefined ? { enterDelay } : {})}
        {...(leaveDelay !== undefined ? { leaveDelay } : {})}
        {...(disableHoverListener !== undefined ? { disableHoverListener } : {})}
        {...(disableFocusListener !== undefined ? { disableFocusListener } : {})}
        {...(disableTouchListener !== undefined ? { disableTouchListener } : {})}
        {...(open !== undefined ? { open } : {})}
        sx={tooltipSx}
      >
        {children}
      </MuiTooltip>
    );
  }
);

Tooltip.displayName = 'Tooltip';

export default Tooltip;
export { Tooltip };
