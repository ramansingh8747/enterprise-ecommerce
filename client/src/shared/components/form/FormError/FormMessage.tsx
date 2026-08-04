import React from 'react';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Typography from '@mui/material/Typography';
import type { IFormMessageProps } from './FormError.types';

/**
 * Enterprise FormMessage Component (Module 9 - Step 9.13).
 *
 * Renders success, info, warning, or general status announcements using MUI Alert.
 * Supports dismissal close handlers and customizable titles.
 */
const FormMessage: React.FC<IFormMessageProps> = ({
  description,
  severity = 'info',
  title,
  icon,
  onDismiss,
  fullWidth = true,
}) => {
  return (
    <Alert
      severity={severity}
      sx={{
        width: fullWidth ? '100%' : 'auto',
      }}
      {...(onDismiss !== undefined ? { onClose: onDismiss } : {})}
      {...(icon !== undefined ? { icon } : {})}
    >
      {title !== undefined && <AlertTitle>{title}</AlertTitle>}
      {typeof description === 'string' ? (
        <Typography variant="body2">{description}</Typography>
      ) : (
        description
      )}
    </Alert>
  );
};

export default FormMessage;
export { FormMessage };
