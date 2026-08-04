import React from 'react';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import type { IEmptyStateProps } from './DataTable.types';
import { tableEmptyStateSx } from './DataTable.styles';

/**
 * EmptyState Component (Module 10 - Step 10.1).
 *
 * Renders a full-width centered description message when there is no dataset to display.
 */
export const EmptyState: React.FC<IEmptyStateProps> = ({ message, colSpan }) => {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} sx={tableEmptyStateSx}>
        <Typography variant="body2" color="text.secondary">
          {message}
        </Typography>
      </TableCell>
    </TableRow>
  );
};

export default EmptyState;
