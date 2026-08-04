import React from 'react';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { parseError } from './FormError.utils';
import type { IFormErrorProps } from './FormError.types';

/**
 * Enterprise FormError Component (Module 9 - Step 9.13).
 *
 * Renders unified validation or server API errors using standard MUI Alert.
 */
const FormError: React.FC<IFormErrorProps> = ({
  error,
  severity = 'error',
  icon,
  fullWidth = true,
}) => {
  const errorMessages = React.useMemo(() => parseError(error), [error]);

  if (errorMessages.length === 0) return null;

  return (
    <Alert
      severity={severity}
      sx={{
        width: fullWidth ? '100%' : 'auto',
      }}
      {...(icon !== undefined ? { icon } : {})}
    >
      {errorMessages.length === 1 ? (
        <Typography variant="body2">{errorMessages[0]}</Typography>
      ) : (
        <Stack spacing={0.5}>
          {errorMessages.map((msg, idx) => (
            <Typography key={idx} variant="body2">
              • {msg}
            </Typography>
          ))}
        </Stack>
      )}
    </Alert>
  );
};

export default FormError;
export { FormError };
