import React from 'react';
import type { FieldValues } from 'react-hook-form';
import IconButton from '@mui/material/IconButton';
import { Icon } from '../../../ui/icon';
import { Input } from '../Input';
import type { IFormPasswordInputProps } from './PasswordInput.types';

/**
 * Enterprise Form PasswordInput Component (Module 9 - Step 9.3).
 *
 * Reuses the Form Input component, forcing type to "password" or "text" based on
 * an internal visibility toggle. Embeds a keyboard-accessible IconButton with
 * "visibility" / "visibilityOff" icons inside the end adornment.
 */
const PasswordInputInner = <TFieldValues extends FieldValues = FieldValues>(
  props: IFormPasswordInputProps<TFieldValues>,
  ref: React.Ref<HTMLDivElement>
): React.ReactElement => {
  const { disabled = false, ...restProps } = props;
  const [showPassword, setShowPassword] = React.useState(false);

  const handleToggleVisibility = (): void => {
    setShowPassword((prev) => !prev);
  };

  const handleMouseDown = (event: React.MouseEvent<HTMLButtonElement>): void => {
    event.preventDefault(); // Prevents cursor focus displacement from the text field
  };

  const endAdornment = (
    <IconButton
      aria-label={showPassword ? 'Hide password' : 'Show password'}
      onClick={handleToggleVisibility}
      onMouseDown={handleMouseDown}
      disabled={disabled}
      edge="end"
      size="small"
    >
      <Icon name={showPassword ? 'visibilityOff' : 'visibility'} size="sm" />
    </IconButton>
  );

  // Destructure ref to remove it from the rest parameter, preventing type clashes under exactOptionalPropertyTypes
  const { ref: _ref, ...inputProps } = restProps;
  void _ref;

  return (
    <Input
      type={showPassword ? 'text' : 'password'}
      disabled={disabled}
      endAdornment={endAdornment}
      {...(ref !== undefined && ref !== null ? { ref } : {})}
      {...inputProps}
    />
  );
};

const PasswordInput = React.forwardRef(PasswordInputInner) as <
  TFieldValues extends FieldValues = FieldValues
>(
  props: IFormPasswordInputProps<TFieldValues> & { ref?: React.Ref<HTMLDivElement> }
) => React.ReactElement;

(PasswordInput as { displayName?: string }).displayName = 'PasswordInput';

export default PasswordInput;
export { PasswordInput };
