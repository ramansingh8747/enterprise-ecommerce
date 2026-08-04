import React from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import type { IFormLoadingProps } from './FormState.types';

/**
 * Enterprise FormLoading Component (Module 9 - Step 9.15).
 *
 * Renders a standardized loading indicator (CircularProgress and message) for forms.
 * Supports inline, viewport-fullscreen, and standard block container layouts.
 */
const FormLoading: React.FC<IFormLoadingProps> = ({
  loading = true,
  message,
  size = 'medium',
  fullscreen = false,
  inline = false,
}) => {
  const theme = useTheme();

  if (!loading) return null;

  // Resolve preset size strings to standard Material UI pixel values
  const resolvedSize = typeof size === 'number'
    ? size
    : size === 'small'
    ? 24
    : size === 'large'
    ? 56
    : 40; // 'medium'

  const content = (
    <Stack
      spacing={2}
      alignItems="center"
      justifyContent="center"
      aria-busy="true"
      aria-live="polite"
    >
      <CircularProgress size={resolvedSize} color="primary" />
      {message && (
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
          {message}
        </Typography>
      )}
    </Stack>
  );

  if (fullscreen) {
    return (
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.palette.background.default,
          zIndex: theme.zIndex.modal + 1,
        }}
      >
        {content}
      </Box>
    );
  }

  if (inline) {
    return (
      <Box sx={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
        {content}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        py: 4,
        px: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
      }}
    >
      {content}
    </Box>
  );
};

export default FormLoading;
export { FormLoading };
