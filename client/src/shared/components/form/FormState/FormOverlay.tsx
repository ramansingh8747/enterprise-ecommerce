import React from 'react';
import Backdrop from '@mui/material/Backdrop';
import { alpha, useTheme } from '@mui/material/styles';
import type { IFormOverlayProps } from './FormState.types';

/**
 * Enterprise FormOverlay Component (Module 9 - Step 9.15).
 *
 * Renders an absolute backdrop overlay inside a positioned parent container.
 * Masks interaction, overlays content, and provides customizable backdrop blur.
 */
const FormOverlay: React.FC<IFormOverlayProps> = ({
  loading,
  blurBackground = true,
  disableInteraction = true,
  opacity = 0.4,
  children,
}) => {
  const theme = useTheme();

  return (
    <Backdrop
      open={loading}
      sx={{
        position: 'absolute',
        zIndex: theme.zIndex.drawer - 1,
        backgroundColor: alpha(theme.palette.background.paper, opacity),
        backdropFilter: blurBackground ? 'blur(2px)' : 'none',
        pointerEvents: disableInteraction ? 'auto' : 'none',
        borderRadius: 'inherit',
      }}
      aria-hidden={!loading}
    >
      {children}
    </Backdrop>
  );
};

export default FormOverlay;
export { FormOverlay };
