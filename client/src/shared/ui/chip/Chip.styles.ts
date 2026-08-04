import type { SxProps, Theme } from '@mui/material';
import type { ChipStatus } from './Chip.types';

/**
 * Enterprise Chip Style Definitions (Module 8 - Step 8.14).
 *
 * All values integrate with the MUI theme and respect filled/outlined variants.
 */

export const chipRootSx: SxProps<Theme> = {};

/** Enforces pill shape (rounded = true) or square-ish shape (rounded = false). */
export const chipRoundedSx = (rounded: boolean): SxProps<Theme> => ({
  borderRadius: rounded ? '9999px' : '4px',
});

/** Applied when loading is true. */
export const chipLoadingSx: SxProps<Theme> = {
  opacity: 0.7,
  pointerEvents: 'none',
};

/** Mappings for status tags in 'filled' variant. */
export const statusFilledStyles: Record<ChipStatus, SxProps<Theme>> = {
  success: {
    backgroundColor: 'success.light',
    color: 'success.dark',
    '& .MuiChip-deleteIcon': {
      color: 'success.dark',
      '&:hover': { color: 'success.main' },
    },
  },
  warning: {
    backgroundColor: 'warning.light',
    color: 'warning.dark',
    '& .MuiChip-deleteIcon': {
      color: 'warning.dark',
      '&:hover': { color: 'warning.main' },
    },
  },
  error: {
    backgroundColor: 'error.light',
    color: 'error.dark',
    '& .MuiChip-deleteIcon': {
      color: 'error.dark',
      '&:hover': { color: 'error.main' },
    },
  },
  info: {
    backgroundColor: 'info.light',
    color: 'info.dark',
    '& .MuiChip-deleteIcon': {
      color: 'info.dark',
      '&:hover': { color: 'info.main' },
    },
  },
  neutral: {
    backgroundColor: 'grey.100',
    color: 'grey.800',
    '& .MuiChip-deleteIcon': {
      color: 'grey.700',
      '&:hover': { color: 'grey.900' },
    },
  },
};

/** Mappings for status tags in 'outlined' variant. */
export const statusOutlinedStyles: Record<ChipStatus, SxProps<Theme>> = {
  success: {
    borderColor: 'success.main',
    color: 'success.main',
    backgroundColor: 'transparent',
    '& .MuiChip-deleteIcon': {
      color: 'success.main',
      '&:hover': { color: 'success.dark' },
    },
  },
  warning: {
    borderColor: 'warning.main',
    color: 'warning.main',
    backgroundColor: 'transparent',
    '& .MuiChip-deleteIcon': {
      color: 'warning.main',
      '&:hover': { color: 'warning.dark' },
    },
  },
  error: {
    borderColor: 'error.main',
    color: 'error.main',
    backgroundColor: 'transparent',
    '& .MuiChip-deleteIcon': {
      color: 'error.main',
      '&:hover': { color: 'error.dark' },
    },
  },
  info: {
    borderColor: 'info.main',
    color: 'info.main',
    backgroundColor: 'transparent',
    '& .MuiChip-deleteIcon': {
      color: 'info.main',
      '&:hover': { color: 'info.dark' },
    },
  },
  neutral: {
    borderColor: 'grey.400',
    color: 'grey.700',
    backgroundColor: 'transparent',
    '& .MuiChip-deleteIcon': {
      color: 'grey.600',
      '&:hover': { color: 'grey.800' },
    },
  },
};
