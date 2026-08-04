import React from 'react';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { parseError } from './FormError.utils';
import type { IErrorSummaryProps } from './FormError.types';

/**
 * Enterprise ErrorSummary Component (Module 9 - Step 9.13).
 *
 * Renders multiple validation errors in a single centralized panel.
 * Automatically focuses and smooth-scrolls to the first failing form input.
 */
const ErrorSummary: React.FC<IErrorSummaryProps> = ({
  errors,
  heading = 'Please correct the following errors:',
  scrollToFirst = true,
  fieldIdPrefix,
}) => {
  const errorMessages = React.useMemo(() => parseError(errors), [errors]);

  React.useEffect(() => {
    if (!scrollToFirst || errorMessages.length === 0) return;

    if (typeof errors === 'object' && errors !== null && !Array.isArray(errors)) {
      const errorKeys = Object.keys(errors);
      const firstKey = errorKeys[0];
      if (firstKey !== undefined) {
        const targetId = fieldIdPrefix ? `${fieldIdPrefix}-${firstKey}` : firstKey;

        const timer = setTimeout(() => {
          const element =
            document.getElementById(targetId) ||
            document.querySelector(`[name="${firstKey}"]`) ||
            document.querySelector(`[name$="${firstKey}"]`);

          if (element instanceof HTMLElement) {
            element.focus();
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);

        return () => clearTimeout(timer);
      }
    }
    return undefined;
  }, [errors, errorMessages, scrollToFirst, fieldIdPrefix]);

  if (errorMessages.length === 0) return null;

  return (
    <Alert severity="error" role="alert" aria-live="assertive" sx={{ width: '100%' }}>
      {heading ? <AlertTitle>{heading}</AlertTitle> : null}
      <Stack spacing={0.5}>
        {errorMessages.map((msg, idx) => (
          <Typography key={idx} variant="body2">
            • {msg}
          </Typography>
        ))}
      </Stack>
    </Alert>
  );
};

export default ErrorSummary;
export { ErrorSummary };
