import React from 'react';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Checkbox from '@mui/material/Checkbox';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import type { SxProps, Theme } from '@mui/material/styles';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ImportExportIcon from '@mui/icons-material/ImportExport';
import type { ITableHeaderProps } from './DataTable.types';
import { tableHeadRowSx, tableHeadCellSx, tableBorderedCellSx } from './DataTable.styles';
import { getVisibleColumns } from './column.utils';

/**
 * TableHeader Component (Module 10 - Step 10.8).
 *
 * Renders the semantic <thead> elements, incorporating master selection controls.
 */
export const TableHeader = <TData,>({
  columns,
  bordered,
  sortState,
  onSort,
  selection,
  selectedRowIds,
  onSelectAll,
  visibleRows = [],
  rowKey,
}: ITableHeaderProps<TData>): React.ReactElement => {
  const visibleColumns = getVisibleColumns(columns);

  // Compute indeterminate vs selected checks across currently visible page data
  const visibleIds = rowKey ? visibleRows.map(rowKey) : [];
  const selectedVisibleCount = selectedRowIds
    ? visibleIds.filter((id) => selectedRowIds.has(id)).length
    : 0;

  const isAllSelected = visibleIds.length > 0 && selectedVisibleCount === visibleIds.length;
  const isIndeterminate = selectedVisibleCount > 0 && selectedVisibleCount < visibleIds.length;

  return (
    <TableHead sx={{ backgroundColor: 'background.paper' }}>
      <TableRow sx={tableHeadRowSx}>
        {/* Prepend Selection Checkbox Header */}
        {selection && (
          <TableCell
            padding="checkbox"
            component="th"
            scope="col"
            sx={[
              tableHeadCellSx,
              ...(bordered ? [tableBorderedCellSx] : []),
            ] as SxProps<Theme>}
          >
            <Checkbox
              indeterminate={isIndeterminate}
              checked={isAllSelected}
              onChange={(e) => onSelectAll?.(e.target.checked)}
              inputProps={{ 'aria-label': 'Select all visible rows' }}
            />
          </TableCell>
        )}

        {visibleColumns.map((col) => {
          const align = col.alignment ?? 'left';
          const style = {
            width: col.width,
            minWidth: col.minWidth,
            maxWidth: col.maxWidth,
          };

          const isSortable = !!col.sortable;
          const isActive = sortState?.columnId === col.id;
          const direction = isActive ? sortState?.direction : null;

          const tabIndex = isSortable ? 0 : undefined;
          const role = isSortable ? 'button' : undefined;
          const ariaSort = isSortable
            ? direction === 'asc'
              ? 'ascending'
              : direction === 'desc'
              ? 'descending'
              : 'none'
            : undefined;

          const handleHeaderClick = () => {
            if (isSortable && onSort) {
              onSort(col.id);
            }
          };

          const handleKeyDown = (e: React.KeyboardEvent<HTMLTableCellElement>) => {
            if (isSortable && onSort && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault();
              onSort(col.id);
            }
          };

          const renderSortIndicator = () => {
            if (!isSortable) return null;

            const iconStyle = {
              fontSize: 16,
              transition: 'transform 0.2s ease-in-out',
            };

            if (direction === 'asc') {
              return <ArrowUpwardIcon sx={iconStyle} color="primary" />;
            }
            if (direction === 'desc') {
              return <ArrowDownwardIcon sx={iconStyle} color="primary" />;
            }
            return <ImportExportIcon sx={{ ...iconStyle, opacity: 0.5 }} color="action" />;
          };

          return (
            <TableCell
              key={col.id}
              align={align}
              style={style}
              className={col.className ?? ''}
              component="th"
              scope="col"
              tabIndex={tabIndex}
              role={role}
              aria-sort={ariaSort}
              onClick={handleHeaderClick}
              onKeyDown={handleKeyDown}
              sx={[
                tableHeadCellSx,
                ...(bordered ? [tableBorderedCellSx] : []),
                ...(isSortable
                  ? [
                      {
                        cursor: 'pointer',
                        userSelect: 'none',
                        '&:hover': {
                          backgroundColor: (theme: Theme) => theme.palette.action.hover,
                        },
                      },
                    ]
                  : []),
                ...(isActive
                  ? [
                      {
                        color: 'primary.main',
                      },
                    ]
                  : []),
              ] as SxProps<Theme>}
            >
              <Stack
                direction="row"
                spacing={0.5}
                alignItems="center"
                justifyContent={
                  align === 'right'
                    ? 'flex-end'
                    : align === 'center'
                    ? 'center'
                    : 'flex-start'
                }
              >
                <Box component="span">{col.headerRender ? col.headerRender() : col.header}</Box>
                {renderSortIndicator()}
              </Stack>
            </TableCell>
          );
        })}
      </TableRow>
    </TableHead>
  );
};
export default TableHeader;
