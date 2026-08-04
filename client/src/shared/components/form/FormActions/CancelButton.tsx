import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button as SharedButton } from '../../../ui/button';
import type { ICancelButtonProps } from './FormActions.types';

/**
 * Enterprise Form CancelButton Component (Module 9 - Step 9.14).
 *
 * Wraps shared presentation button with type="button" and variant="text" by default.
 * Prevents accidental form submission, and supports standard onClick handlers, custom
 * onCancel callbacks, and React Router navigation via the 'to' prop.
 */
const CancelButton = React.forwardRef<HTMLButtonElement, ICancelButtonProps>(
  (props, ref) => {
    const { variant = 'text', color = 'inherit', onClick, to, onCancel, ...restProps } = props;
    const navigate = useNavigate();

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      // 1. Fire custom click handler
      if (onClick) {
        onClick(event);
      }

      // 2. Fire onCancel callback (if provided)
      if (onCancel) {
        onCancel();
      }

      // 3. Handle routing navigation (if target route is provided and not default-prevented)
      if (to !== undefined && !event.defaultPrevented) {
        if (typeof to === 'number') {
          navigate(to);
        } else {
          navigate(String(to));
        }
      }
    };

    return (
      <SharedButton
        ref={ref}
        type="button"
        variant={variant}
        color={color}
        onClick={handleClick}
        {...restProps}
      />
    );
  }
);

CancelButton.displayName = 'CancelButton';

export default CancelButton;
export { CancelButton };
