import React from 'react';
import MuiTableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Checkbox from '@mui/material/Checkbox';
import type { SxProps, Theme } from '@mui/material/styles';
import type { ITableRowProps } from './DataTable.types';
import { TableCell as BodyCell } from './TableCell';
import {
  tableRowSx,
  tableStripedRowSx,
  tableBorderedCellSx,
} from './DataTable.styles';
import { getVisibleColumns } from './column.utils';

/**
 * TableRow Component (Module 10 - Step 10.8).
 *
 * Renders the semantic <tr> elements, managing checkbox updates and selection styling highlights.
 */
export const TableRow = <TData,>({
  row,
  columns,
  rowIndex,
  hover = false,
  striped = false,
  bordered,
  selection,
  selectedRowIds,
  onSelectRow,
  rowKey,
}: ITableRowProps<TData>): React.ReactElement => {
  const visibleColumns = getVisibleColumns(columns);

  const id = rowKey(row);
  const isSelected = selectedRowIds?.has(id) ?? false;

  return (
    <MuiTableRow
      hover={hover}
      selected={isSelected}
      sx={[
        tableRowSx,
        ...(striped ? [tableStripedRowSx] : []),
        ...(isSelected
          ? [
              {
                backgroundColor: (theme: Theme) => `${theme.palette.primary.main}0d !important`, // Subtle 5% primary main tint
              },
            ]
          : []),
      ] as SxProps<Theme>}
    >
      {/* Prepend Selection Checkbox Cell */}
      {selection && (
        <TableCell
          padding="checkbox"
          sx={[...(bordered ? [tableBorderedCellSx] : [])] as SxProps<Theme>}
        >
          <Checkbox
            checked={isSelected}
            onChange={(e) => onSelectRow?.(id, e.target.checked)}
            inputProps={{ 'aria-label': `Select row ${String(id)}` }}
          />
        </TableCell>
      )}

      {visibleColumns.map((col) => (
        <BodyCell
          key={col.id}
          row={row}
          column={col}
          rowIndex={rowIndex}
          bordered={bordered}
        />
      ))}
    </MuiTableRow>
  );
};
export default TableRow;
