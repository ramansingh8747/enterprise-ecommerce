import React from 'react';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import LinearProgress from '@mui/material/LinearProgress';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { ILoadingStateProps } from './DataTable.types';
import { tableLoadingStateSx } from './DataTable.styles';

/**
 * LoadingState Component (Module 10 - Step 10.1).
 *
 * Renders a full-width linear loading bar status over the grid columns during fetches.
 */
export const LoadingState: React.FC<ILoadingStateProps> = ({
  colSpan,
  message = 'Loading data...',
}) => {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} sx={tableLoadingStateSx}>
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <LinearProgress sx={{ width: '80%', maxWidth: 400 }} aria-label={message} />
          <Typography variant="body2" color="text.secondary">
            {message}
          </Typography>
        </Box>
      </TableCell>
    </TableRow>
  );
};

export default LoadingState;
