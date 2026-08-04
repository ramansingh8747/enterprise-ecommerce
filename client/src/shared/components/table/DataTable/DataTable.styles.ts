import type { SxProps, Theme } from '@mui/material';

export const tableContainerSx: SxProps<Theme> = {
  width: '100%',
  overflowX: 'auto',
  borderRadius: (theme) => `${theme.shape.borderRadius}px`,
  border: (theme) => `1px solid ${theme.palette.divider}`,
  backgroundColor: (theme) => theme.palette.background.paper,
  boxShadow: (theme) => theme.shadows[1],
};

export const tableSx: SxProps<Theme> = {
  minWidth: 650,
  borderCollapse: 'collapse',
};

export const tableHeadRowSx: SxProps<Theme> = {
  backgroundColor: (theme) => theme.palette.action.hover,
  borderBottom: (theme) => `2px solid ${theme.palette.divider}`,
};

export const tableHeadCellSx: SxProps<Theme> = {
  fontWeight: 600,
  color: (theme) => theme.palette.text.primary,
  py: 2,
};

export const tableRowSx: SxProps<Theme> = {
  transition: (theme) =>
    theme.transitions.create(['background-color'], {
      duration: theme.transitions.duration.shorter,
    }),
  '&:last-child td, &:last-child th': {
    border: 0,
  },
};

export const tableCellSx: SxProps<Theme> = {
  py: 1.5,
  px: 2,
};

export const tableStripedRowSx: SxProps<Theme> = {
  '&:nth-of-type(odd)': {
    backgroundColor: (theme) => theme.palette.action.hover,
  },
};

export const tableBorderedCellSx: SxProps<Theme> = {
  borderRight: (theme) => `1px solid ${theme.palette.divider}`,
  '&:last-child': {
    borderRight: 0,
  },
};

export const tableEmptyStateSx: SxProps<Theme> = {
  py: 6,
  px: 2,
  textAlign: 'center',
};

export const tableLoadingStateSx: SxProps<Theme> = {
  py: 6,
  px: 2,
  textAlign: 'center',
};

export const paginationContainerSx: SxProps<Theme> = {
  display: 'flex',
  flexDirection: { xs: 'column', sm: 'row' },
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 2,
  py: 2,
  px: 3,
  borderTop: (theme) => `1px solid ${theme.palette.divider}`,
  backgroundColor: (theme) => theme.palette.background.paper,
};

export const paginationControlsSx: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  gap: 0.5,
  flexWrap: 'wrap',
};
