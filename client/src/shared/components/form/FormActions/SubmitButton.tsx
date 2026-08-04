import React from 'react';
import { Button as SharedButton } from '../../../ui/button';
import type { ISubmitButtonProps } from './FormActions.types';

/**
 * Enterprise Form SubmitButton Component (Module 9 - Step 9.14).
 *
 * Wraps shared presentation button with type="submit" and is contained by default.
 * Handles loading, disabling, loading text, and prevents duplicate submissions.
 */
const SubmitButton = React.forwardRef<HTMLButtonElement, ISubmitButtonProps>(
  (props, ref) => {
    const { variant = 'contained', color = 'primary', ...restProps } = props;
    return (
      <SharedButton
        ref={ref}
        type="submit"
        variant={variant}
        color={color}
        {...restProps}
      />
    );
  }
);

SubmitButton.displayName = 'SubmitButton';

export default SubmitButton;
export { SubmitButton };
