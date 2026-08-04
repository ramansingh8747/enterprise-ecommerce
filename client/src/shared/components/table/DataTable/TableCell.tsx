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

  const style = {
    width: column.width,
    minWidth: column.minWidth,
    maxWidth: column.maxWidth,
  };

  return (
    <MuiTableCell
      align={align}
      component="td"
      style={style}
      className={column.className ?? ''}
      sx={[
        tableCellSx,
        ...(bordered ? [tableBorderedCellSx] : []),
      ] as SxProps<Theme>}
    >
      {content}
    </MuiTableCell>
  );
};
