import React from 'react';
import Stack from '@mui/material/Stack';
import type { IFormActionsProps } from './FormActions.types';

/**
 * Enterprise FormActions Component (Module 9 - Step 9.14).
 *
 * Renders a standardized layout container (based on MUI Stack) for form action button groups.
 * Reusable across all client forms to align submit, reset, and cancel buttons consistently.
 */
const FormActions: React.FC<IFormActionsProps> = (props) => {
  const {
    children,
    direction = 'row',
    spacing = 2,
    justifyContent = 'flex-end',
    alignItems = 'center',
    fullWidth = true,
    wrap = 'wrap',
    ...restProps
  } = props;

  return (
    <Stack
      direction={direction}
      spacing={spacing}
      justifyContent={justifyContent}
      alignItems={alignItems}
      flexWrap={wrap}
      sx={{
        width: fullWidth ? '100%' : 'auto',
      }}
      {...restProps}
    >
      {children}
    </Stack>
  );
};

export default FormActions;
export { FormActions };
