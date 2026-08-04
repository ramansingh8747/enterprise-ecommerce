import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import type { Theme } from '@mui/material/styles';
import type { IBulkAction } from './DataTable.types';

/**
 * Prop interface for the BulkActionsToolbar component.
 */
export interface IBulkActionsToolbarProps<TData> {
  readonly selectedRowIds: Set<string | number>;
  readonly selectedRowData: TData[];
  readonly actions: readonly IBulkAction<TData>[];
  readonly onClearSelection: () => void;
}

/**
 * BulkActionsToolbar Component (Module 10 - Step 10.9).
 *
 * Renders selection counters, active dropdown lists, and clear selectors above the DataTable.
 */
export const BulkActionsToolbar = <TData,>({
  selectedRowIds,
  selectedRowData,
  actions,
  onClearSelection,
}: IBulkActionsToolbarProps<TData>): React.ReactElement => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleActionClick = (act: IBulkAction<TData>) => {
    act.action(selectedRowIds, selectedRowData);
    handleMenuClose();
  };

  if (selectedRowIds.size === 0) {
    return <React.Fragment />;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: (theme: Theme) => `${theme.palette.primary.main}0d`, // Subtle 5% primary main tint
        border: (theme: Theme) => `1px solid ${theme.palette.primary.main}33`, // 20% primary main border
        borderRadius: 1,
        px: 2,
        py: 1,
        mb: 2,
      }}
      aria-label="Bulk actions toolbar"
    >
      <Typography variant="body2" color="primary.main" sx={{ fontWeight: 600 }}>
        {selectedRowIds.size} row(s) selected
      </Typography>

      <Stack direction="row" spacing={1} alignItems="center">
        {/* Bulk Actions Dropdown Trigger Menu */}
        {actions.length > 0 && (
          <React.Fragment>
            <Button
              id="bulk-actions-button"
              aria-controls={open ? 'bulk-actions-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={open ? 'true' : undefined}
              variant="outlined"
              color="primary"
              size="small"
              onClick={handleMenuOpen}
              endIcon={<KeyboardArrowDownIcon />}
              sx={{ textTransform: 'none', fontWeight: 600, py: 0.5 }}
            >
              Bulk Actions
            </Button>
            <Menu
              id="bulk-actions-menu"
              anchorEl={anchorEl}
              open={open}
              onClose={handleMenuClose}
              MenuListProps={{
                'aria-labelledby': 'bulk-actions-button',
              }}
            >
              {actions.map((act) => (
                <MenuItem
                  key={act.id}
                  onClick={() => handleActionClick(act)}
                  disabled={act.disabled ?? false}
                  sx={{ gap: 1.5, fontSize: '0.875rem' }}
                >
                  {act.icon}
                  {act.label}
                </MenuItem>
              ))}
            </Menu>
          </React.Fragment>
        )}

        <Button
          variant="text"
          color="primary"
          onClick={onClearSelection}
          size="small"
          sx={{ textTransform: 'none', fontWeight: 600, py: 0.5 }}
        >
          Clear Selection
        </Button>
      </Stack>
    </Box>
  );
};
export default BulkActionsToolbar;
