import React from 'react';
import Box from '@mui/material/Box';
import FormOverlay from './FormOverlay';
import FormLoading from './FormLoading';
import type { IFormSubmittingProps } from './FormState.types';

/**
 * Enterprise FormSubmitting Wrapper Component (Module 9 - Step 9.15).
 *
 * Wraps form layouts to manage submitting overlays, disable click/pointer events,
 * and preserve focus using the HTML5 'inert' property when submitting is active.
 */
const FormSubmitting: React.FC<IFormSubmittingProps> = ({
  submitting,
  message = 'Submitting...',
  blurBackground = true,
  opacity = 0.4,
  children,
}) => {
  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
      }}
      aria-busy={submitting}
    >
      <FormOverlay
        loading={submitting}
        blurBackground={blurBackground}
        opacity={opacity}
      >
        <FormLoading loading={submitting} message={message} size="medium" />
      </FormOverlay>
      <Box
        sx={{
          pointerEvents: submitting ? 'none' : 'auto',
        }}
        inert={submitting}
      >
        {children}
      </Box>
    </Box>
  );
};

export default FormSubmitting;
export { FormSubmitting };
