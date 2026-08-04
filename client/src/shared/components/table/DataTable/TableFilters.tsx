import React from 'react';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import type { ITableFiltersProps, IDataTableColumn } from './DataTable.types';

/**
 * TableFilters Component (Module 10 - Step 10.7).
 *
 * Renders the filter controls form grid and the active filter badge list above the table.
 */
export const TableFilters = <TData,>({
  columns,
  filters,
  onFilterChange,
  onClearFilter,
  onClearAll,
}: ITableFiltersProps<TData>): React.ReactElement => {
  const filterableColumns = columns.filter((col) => col.visible !== false && col.filterable === true);

  // Determine if there are any active filters configured
  const activeFilters = Object.entries(filters).filter(
    ([, val]) => val !== undefined && val !== null && val !== ''
  );

  const hasActiveFilters = activeFilters.length > 0;

  if (filterableColumns.length === 0) {
    return <React.Fragment />;
  }

  // Helper to retrieve display text for filter values
  const getFilterLabel = (col: IDataTableColumn<TData>, val: unknown): string => {
    const headerName = typeof col.header === 'string' ? col.header : col.id;

    if (col.filterType === 'boolean') {
      return `${headerName}: ${val === 'true' || val === true ? 'Yes' : 'No'}`;
    }

    if (col.filterType === 'select' && col.filterOptions) {
      const option = col.filterOptions.find((opt) => String(opt.value) === String(val));
      if (option) {
        return `${headerName}: ${option.label}`;
      }
    }

    return `${headerName}: ${String(val)}`;
  };

  return (
    <Stack spacing={2} sx={{ mb: 3 }}>
      {/* Filter Inputs Grid */}
      <Grid container spacing={2} alignItems="center">
        {filterableColumns.map((col) => {
          const value = (filters[col.id] as string | number | undefined) ?? '';
          const label = typeof col.header === 'string' ? col.header : col.id;

          const renderFilterInput = () => {
            const type = col.filterType ?? 'text';

            switch (type) {
              case 'select':
                return (
                  <TextField
                    select
                    fullWidth
                    label={label}
                    value={value}
                    onChange={(e) => onFilterChange(col.id, e.target.value)}
                    size="small"
                  >
                    <MenuItem value="">
                      <em>All</em>
                    </MenuItem>
                    {col.filterOptions?.map((opt) => (
                      <MenuItem key={String(opt.value)} value={String(opt.value)}>
                        {opt.label}
                      </MenuItem>
                    ))}
                  </TextField>
                );

              case 'boolean':
                return (
                  <TextField
                    select
                    fullWidth
                    label={label}
                    value={value}
                    onChange={(e) => onFilterChange(col.id, e.target.value)}
                    size="small"
                  >
                    <MenuItem value="">
                      <em>All</em>
                    </MenuItem>
                    <MenuItem value="true">Yes</MenuItem>
                    <MenuItem value="false">No</MenuItem>
                  </TextField>
                );

              case 'number':
                return (
                  <TextField
                    fullWidth
                    type="number"
                    label={label}
                    value={value}
                    onChange={(e) => onFilterChange(col.id, e.target.value)}
                    size="small"
                    placeholder={`Filter by ${label}`}
                  />
                );

              case 'date':
                return (
                  <TextField
                    fullWidth
                    type="date"
                    label={label}
                    value={value}
                    onChange={(e) => onFilterChange(col.id, e.target.value)}
                    size="small"
                    InputLabelProps={{ shrink: true }}
                  />
                );

              case 'text':
              default:
                return (
                  <TextField
                    fullWidth
                    label={label}
                    value={value}
                    onChange={(e) => onFilterChange(col.id, e.target.value)}
                    size="small"
                    placeholder={`Filter by ${label}`}
                  />
                );
            }
          };

          return (
            <Grid item xs={12} sm={6} md={3} lg={2.4} key={col.id}>
              {renderFilterInput()}
            </Grid>
          );
        })}
      </Grid>

      {/* Active Filters display row */}
      {hasActiveFilters && (
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap sx={{ gap: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
            Active Filters:
          </Typography>
          {activeFilters.map(([colId, val]) => {
            const col = columns.find((c) => c.id === colId);
            if (!col) return null;

            return (
              <Chip
                key={colId}
                label={getFilterLabel(col, val)}
                onDelete={() => onClearFilter(colId)}
                size="small"
                variant="outlined"
                color="primary"
              />
            );
          })}
          <Button
            size="small"
            onClick={onClearAll}
            startIcon={<ClearAllIcon fontSize="small" />}
            color="secondary"
            sx={{ textTransform: 'none', height: 24, fontSize: '0.75rem' }}
          >
            Clear All
          </Button>
        </Stack>
      )}
    </Stack>
  );
};
export default TableFilters;
