import React from 'react';
import { Button as SharedButton } from '../../../ui/button';
import type { IResetButtonProps } from './FormActions.types';

/**
 * Enterprise Form ResetButton Component (Module 9 - Step 9.14).
 *
 * Wraps shared presentation button with type="reset" and variant="outlined" by default.
 */
const ResetButton = React.forwardRef<HTMLButtonElement, IResetButtonProps>(
  (props, ref) => {
    const { variant = 'outlined', color = 'inherit', ...restProps } = props;
    return (
      <SharedButton
        ref={ref}
        type="reset"
        variant={variant}
        color={color}
        {...restProps}
      />
    );
  }
);

ResetButton.displayName = 'ResetButton';

export default ResetButton;
export { ResetButton };
