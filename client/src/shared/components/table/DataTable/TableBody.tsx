import React from 'react';
import MuiTableBody from '@mui/material/TableBody';
import type { ITableBodyProps } from './DataTable.types';
import { TableRow } from './TableRow';
import { EmptyState } from './EmptyState';
import { LoadingState } from './LoadingState';
import MuiTableRow from '@mui/material/TableRow';
import MuiTableCell from '@mui/material/TableCell';
import { getVisibleColumns } from './column.utils';

/**
 * TableBody Component (Module 10 - Step 10.8).
 *
 * Renders the semantic <tbody> elements, routing selections to row subcomponents.
 */
export const TableBody = <TData,>({
  data,
  columns,
  rowKey,
  hover = false,
  striped = false,
  bordered,
  emptyMessage = 'No records found.',
  loading = false,
  customEmptyState,
  customLoadingState,
  selection,
  selectedRowIds,
  onSelectRow,
}: ITableBodyProps<TData>): React.ReactElement => {
  const visibleColumns = getVisibleColumns(columns);
  // Account for checkbox selection column in span calculations
  const colSpan = visibleColumns.length + (selection ? 1 : 0);

  if (loading) {
    return (
      <MuiTableBody>
        {customLoadingState ? (
          <MuiTableRow>
            <MuiTableCell colSpan={colSpan}>{customLoadingState}</MuiTableCell>
          </MuiTableRow>
        ) : (
          <LoadingState colSpan={colSpan} />
        )}
      </MuiTableBody>
    );
  }

  if (data.length === 0) {
    return (
      <MuiTableBody>
        {customEmptyState ? (
          <MuiTableRow>
            <MuiTableCell colSpan={colSpan}>{customEmptyState}</MuiTableCell>
          </MuiTableRow>
        ) : (
          <EmptyState message={emptyMessage} colSpan={colSpan} />
        )}
      </MuiTableBody>
    );
  }

  return (
    <MuiTableBody>
      {data.map((row, index) => (
        <TableRow
          key={rowKey(row)}
          row={row}
          columns={columns}
          rowIndex={index}
          hover={hover}
          striped={striped}
          bordered={bordered}
          selection={selection}
          selectedRowIds={selectedRowIds}
          onSelectRow={onSelectRow}
          rowKey={rowKey}
        />
      ))}
    </MuiTableBody>
  );
};
export default TableBody;
