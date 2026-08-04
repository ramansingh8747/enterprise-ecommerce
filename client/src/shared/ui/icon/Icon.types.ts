import type { SxProps, Theme } from '@mui/material';
import type { IconName } from './icon-registry';

/** Sizing presets for rendering icons. */
export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/** Brand color categories mapping to the active theme palette. */
export type IconColor =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'inherit'
  | 'disabled';

/**
 * Enterprise Icon Component Types (Module 8 - Step 8.20).
 *
 * Defines the typesafe interface for Icon, using the IconName registry key.
 */
export interface IIconProps {
  /** The registered key name of the icon to render. */
  name: IconName;
  /** Dimension scale of the icon. Defaults to 'md'. */
  size?: IconSize;
  /** Palette category color for the icon. Defaults to 'inherit'. */
  color?: IconColor;
  /** Screen reader alternative text title for SVG access. */
  titleAccess?: string;
  /** Trigger a continuous 360-degree rotation animation. Defaults to false. */
  spin?: boolean;
  /** Grey-outs color and blocks mouse events. Defaults to false. */
  disabled?: boolean;
  /** When true, styles pointer hover feedback. Defaults to false. */
  clickable?: boolean;
  /** Optional click handler. Clicking automatically enables pointer styles. */
  onClick?: React.MouseEventHandler<SVGSVGElement>;
  /** MUI styling overrides. */
  sx?: SxProps<Theme>;
}
