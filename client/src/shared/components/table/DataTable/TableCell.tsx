import React from 'react';
import MuiTableCell from '@mui/material/TableCell';
import type { SxProps, Theme } from '@mui/material/styles';
import type { ITableCellProps } from './DataTable.types';
import { tableCellSx, tableBorderedCellSx } from './DataTable.styles';
import { getCellValue } from './column.utils';

/**
 * TableCell Component (Module 10 - Step 10.2).
 *
 * Renders individual <td> elements resolved via Column Configuration accessors.
 */
export const TableCell = <TData,>({
  row,
  column,
  rowIndex,
  bordered,
}: ITableCellProps<TData>): React.ReactElement => {
  const align = column.alignment ?? 'left';
  const rawValue = getCellValue(row, column.accessor);

  const content = column.render
    ? column.render(rawValue, row, rowIndex)
    : rawValue !== undefined && rawValue !== null
    ? String(rawValue)
    : '';

  if (column.id === 'sku') {
    console.log("TableCell Diagnostics for SKU:");
    console.log("- column.id:", column.id);
    console.log("- accessor:", column.accessor);
    console.log("- value passed to render():", rawValue);
    console.log("- final content:", content);
  }

  const style = {
    width: column.width,
    minWidth: column.minWidth,
    maxWidth: column.maxWidth,
  };

  const cellProps = {
    align,
    component: "td" as const,
    style: style,
    className: column.className ?? '',
  };

  return (
    <MuiTableCell
      {...cellProps}
      sx={[
        tableCellSx,
        ...(bordered ? [tableBorderedCellSx] : []),
      ] as SxProps<Theme>}
    >
      {content}
    </MuiTableCell>
  );
};
