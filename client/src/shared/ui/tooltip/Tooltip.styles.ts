import type { SxProps, Theme } from '@mui/material';

/**
 * Enterprise Tooltip Style Definitions (Module 8 - Step 8.21).
 *
 * Integrated with the MUI theme variables and shadows.
 */

export const tooltipRootSx: SxProps<Theme> = {
  '& .MuiTooltip-tooltip': {
    backgroundColor: 'grey.900',
    color: 'common.white',
    boxShadow: (theme) => theme.shadows[2],
    fontSize: '0.75rem',
    lineHeight: 1.4,
    padding: '6px 10px',
    borderRadius: '4px',
  },
  '& .MuiTooltip-arrow': {
    color: 'grey.900',
  },
};

/** Layout adjustments inside tooltip title box when in a loading state. */
export const tooltipLoadingSx: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  gap: 1,
  padding: '2px 4px',
};
