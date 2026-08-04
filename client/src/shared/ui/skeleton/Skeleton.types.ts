import type { SkeletonProps as MuiSkeletonProps } from '@mui/material/Skeleton';

/** Variant shapes for the skeleton loader placeholder. */
export type SkeletonVariant = 'text' | 'rectangular' | 'rounded' | 'circular';

/** Animation type presets. Pulse, wave shimmer, or static. */
export type SkeletonAnimation = 'pulse' | 'wave' | false;

/**
 * Enterprise Skeleton Component Types (Module 8 - Step 8.18).
 *
 * Inherits a safe subset of MUI SkeletonProps, extending it with multi-row rendering,
 * repeat replication, and full width presets.
 */
export interface ISkeletonProps
  extends Pick<
    MuiSkeletonProps,
    | 'sx'
  > {
  /** The shape variant. Defaults to 'text'. */
  variant?: SkeletonVariant;
  /** The animation type. Defaults to 'pulse'. */
  animation?: SkeletonAnimation;
  /** Custom width constraint. E.g. 100, "80%". */
  width?: number | string;
  /** Custom height constraint. E.g. 24, "1.2rem". */
  height?: number | string;
  /** Number of text placeholder rows to render (applicable when variant is "text"). Defaults to 1. */
  rows?: number;
  /** Force fully rounded corners on rectangular variants. */
  rounded?: boolean;
  /** When true, forces width to 100%. */
  fullWidth?: boolean;
  /** Number of times to duplicate the single skeleton component or block. Defaults to 1. */
  repeat?: number;
}
