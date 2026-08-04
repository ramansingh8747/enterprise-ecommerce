import React from 'react';
import MuiButton from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import type { IButtonProps } from './Button.types';
import { buttonLoadingContainerSx, buttonSpinnerSx } from './Button.styles';

/**
 * Enterprise Shared Button Component (Module 8 - Step 8.2).
 *
 * Wraps Material UI Button with extended loading state support.
 * Fully accessible, keyboard navigable, and forwarded ref compatible.
 */
const Button = React.forwardRef<HTMLButtonElement, IButtonProps>(
  (
    {
      children,
      loading = false,
      loadingText,
      disabled,
      startIcon,
      endIcon,
      ...rest
    },
    ref
  ) => {
    const isDisabled = disabled ?? loading;
    const resolvedStartIcon = loading ? undefined : startIcon;
    const resolvedEndIcon = loading ? undefined : endIcon;

    const buttonContent = loading ? (
      <Box component="span" sx={buttonLoadingContainerSx}>
        <CircularProgress size={16} thickness={4} sx={buttonSpinnerSx} aria-hidden="true" />
        {loadingText ?? children}
      </Box>
    ) : (
      children
    );

    return (
      <MuiButton
        ref={ref}
        disabled={isDisabled}
        aria-busy={loading}
        startIcon={resolvedStartIcon}
        endIcon={resolvedEndIcon}
        {...rest}
      >
        {buttonContent}
      </MuiButton>
    );
  }
);

Button.displayName = 'Button';

export default Button;
export { Button };
