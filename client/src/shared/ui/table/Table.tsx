import React from 'react';
import MuiTable from '@mui/material/Table';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import LinearProgress from '@mui/material/LinearProgress';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Checkbox } from '../checkbox';
import type { ITableProps, ITableColumn } from './Table.types';
import {
  tableBorderedCellSx,
  tableClickableRowSx,
  tableContainerSx,
  tableEmptyStateSx,
  tableHeadSx,
  tableLoadingBarSx,
  tableSelectedRowSx,
  tableStripedRowSx,
} from './Table.styles';

const SELECTION_COL_WIDTH = 48;

/**
 * Enterprise Shared Table Component (Module 8 - Step 8.12).
 *
 * A fully generic, presentation-only data table. Supports dynamic column
 * definitions, row selection via shared Checkbox, striped/hover/bordered
 * styling, a loading progress bar, and an empty state message.
 * No sorting, pagination, filtering, or virtualisation.
 */
const TableInner = <TRow extends Record<string, unknown>>(
  {
    rows,
    columns,
    rowKey,
    loading = false,
    emptyMessage = 'No data available.',
    stickyHeader = false,
    selectable = false,
    selectedRows,
    dense = false,
    hover = false,
    striped = false,
    bordered = false,
    maxHeight,
    onRowClick,
    onSelectionChange,
  }: ITableProps<TRow>,
  ref: React.ForwardedRef<HTMLDivElement>
): React.ReactElement => {
  const visibleColumns = columns.filter(
    (col): col is ITableColumn<TRow> => col.hidden !== true
  );

  const selectedSet = new Set<string | number>(selectedRows ?? []);

  const isAllSelected =
    rows.length > 0 &&
    rows.every((row) => selectedSet.has(rowKey(row)));

  const isIndeterminate =
    !isAllSelected && rows.some((row) => selectedSet.has(rowKey(row)));

  const handleSelectAll = (): void => {
    if (onSelectionChange === undefined) return;
    if (isAllSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(rows.map(rowKey));
    }
  };

  const handleSelectRow = (key: string | number): void => {
    if (onSelectionChange === undefined) return;
    const next = new Set(selectedSet);
    if (next.has(key)) {
      next.delete(key);
    } else {
      next.add(key);
    }
    onSelectionChange(Array.from(next));
  };

  const cellSx = bordered ? tableBorderedCellSx : undefined;

  return (
    <TableContainer
      ref={ref}
      sx={{
        ...tableContainerSx,
        ...(maxHeight !== undefined ? { maxHeight } : {}),
      }}
    >
      {loading && (
        <Box sx={tableLoadingBarSx}>
          <LinearProgress aria-label="Loading table data" />
        </Box>
      )}

      <MuiTable
        stickyHeader={stickyHeader}
        size={dense ? 'small' : 'medium'}
        aria-busy={loading}
      >
        <TableHead sx={tableHeadSx}>
          <TableRow>
            {selectable && (
              <TableCell
                padding="checkbox"
                {...(bordered ? { sx: tableBorderedCellSx } : {})}
                {...(SELECTION_COL_WIDTH !== undefined
                  ? { style: { width: SELECTION_COL_WIDTH } }
                  : {})}
              >
                <Checkbox
                  checked={isAllSelected}
                  indeterminate={isIndeterminate}
                  onChange={handleSelectAll}
                  aria-label="Select all rows"
                  size="small"
                />
              </TableCell>
            )}

            {visibleColumns.map((col) => (
              <TableCell
                key={col.id}
                align={col.align ?? 'left'}
                {...(cellSx !== undefined ? { sx: cellSx } : {})}
                {...(col.width !== undefined ? { width: col.width } : {})}
                {...(col.minWidth !== undefined
                  ? { style: { minWidth: col.minWidth } }
                  : {})}
              >
                {col.headerRender !== undefined
                  ? col.headerRender()
                  : col.header}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>

        <TableBody>
          {rows.length === 0 && !loading ? (
            <TableRow>
              <TableCell
                colSpan={
                  visibleColumns.length + (selectable ? 1 : 0)
                }
                sx={tableEmptyStateSx}
              >
                <Typography variant="body2">{emptyMessage}</Typography>
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row, index) => {
              const key = rowKey(row);
              const isSelected = selectedSet.has(key);
              const isClickable = onRowClick !== undefined;

              const rowSx = {
                ...(striped ? tableStripedRowSx : {}),
                ...(isSelected ? tableSelectedRowSx : {}),
                ...(isClickable ? tableClickableRowSx : {}),
              };

              return (
                <TableRow
                  key={key}
                  hover={hover}
                  selected={isSelected}
                  sx={rowSx}
                  onClick={
                    isClickable
                      ? () => { onRowClick(row, index); }
                      : undefined
                  }
                  tabIndex={isClickable ? 0 : undefined}
                  onKeyDown={
                    isClickable
                      ? (e: React.KeyboardEvent) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            onRowClick(row, index);
                          }
                        }
                      : undefined
                  }
                  {...(isClickable ? { role: 'button' } : {})}
                >
                  {selectable && (
                    <TableCell
                      padding="checkbox"
                      {...(cellSx !== undefined ? { sx: cellSx } : {})}
                      onClick={(e) => { e.stopPropagation(); }}
                    >
                      <Checkbox
                        checked={isSelected}
                        onChange={() => { handleSelectRow(key); }}
                        aria-label={`Select row ${String(key)}`}
                        size="small"
                      />
                    </TableCell>
                  )}

                  {visibleColumns.map((col) => {
                    const rawValue =
                      col.field !== undefined
                        ? (row[col.field] as TRow[keyof TRow] | undefined)
                        : undefined;

                    const cellContent =
                      col.render !== undefined
                        ? col.render(rawValue, row, index)
                        : rawValue !== undefined && rawValue !== null
                        ? String(rawValue)
                        : '';

                    return (
                      <TableCell
                        key={col.id}
                        align={col.align ?? 'left'}
                        {...(cellSx !== undefined ? { sx: cellSx } : {})}
                      >
                        {cellContent}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </MuiTable>
    </TableContainer>
  );
};

const Table = React.forwardRef(TableInner) as <
  TRow extends Record<string, unknown>
>(
  props: ITableProps<TRow> & { ref?: React.ForwardedRef<HTMLDivElement> }
) => React.ReactElement;

(Table as { displayName?: string }).displayName = 'Table';

export default Table;
export { Table };
