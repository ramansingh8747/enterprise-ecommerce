import type { SxProps, Theme } from '@mui/material';

/**
 * Enterprise Table Style Definitions (Module 8 - Step 8.12).
 *
 * All values sourced from the MUI theme — no hardcoded colours or magic numbers.
 */

/** Applied to the TableContainer (outer scroll wrapper). */
export const tableContainerSx: SxProps<Theme> = {
  position: 'relative',
  width: '100%',
};

/** Applied to the LinearProgress loading bar wrapper. */
export const tableLoadingBarSx: SxProps<Theme> = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  zIndex: 1,
};

/** Applied to the TableHead root. */
export const tableHeadSx: SxProps<Theme> = {
  '& th': {
    fontWeight: 'bold',
    backgroundColor: 'background.paper',
    borderBottom: (theme) => `2px solid ${theme.palette.divider}`,
  },
};

/** Applied to even-indexed body rows when striped is enabled. */
export const tableStripedRowSx: SxProps<Theme> = {
  '&:nth-of-type(even)': {
    backgroundColor: 'action.hover',
  },
};

/** Applied to a selected body row. */
export const tableSelectedRowSx: SxProps<Theme> = {
  backgroundColor: 'primary.light',
  '&:hover': {
    backgroundColor: 'primary.light',
  },
};

/** Applied to a clickable body row. */
export const tableClickableRowSx: SxProps<Theme> = {
  cursor: 'pointer',
};

/** Applied to all cells when bordered is enabled. */
export const tableBorderedCellSx: SxProps<Theme> = {
  border: (theme) => `1px solid ${theme.palette.divider}`,
};

/** Applied to the empty state row. */
export const tableEmptyStateSx: SxProps<Theme> = {
  textAlign: 'center',
  color: 'text.secondary',
  py: 4,
};
