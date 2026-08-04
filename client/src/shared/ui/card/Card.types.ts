/**
 * Enterprise Card Component Types (Module 8 - Step 8.11).
 *
 * Defined independently to avoid exactOptionalPropertyTypes conflicts with
 * MuiCardProps. Only the enterprise-relevant surface is exposed.
 */

/** Controls the inner padding of the CardContent area. */
export type CardPaddingSize = 'none' | 'small' | 'medium' | 'large';

export interface ICardProps {
  /** Optional heading rendered in CardHeader. */
  title?: string;
  /** Optional subheading rendered below the title in CardHeader. */
  subtitle?: string;
  /** Content rendered inside CardContent. */
  children?: React.ReactNode;
  /** Action element (e.g. IconButton or Menu) placed in the CardHeader action slot. */
  headerAction?: React.ReactNode;
  /** Content rendered inside CardActions at the bottom of the card. */
  footer?: React.ReactNode;
  /**
   * MUI elevation level applied to the Card shadow.
   * Ignored when outlined is true.
   */
  elevation?: number;
  /** When true, renders a border instead of a box-shadow. */
  outlined?: boolean;
  /** When true, the card responds to hover/focus and fires onClick. */
  clickable?: boolean;
  /** When true, renders skeleton placeholder lines instead of children. */
  loading?: boolean;
  /** When true, the card stretches to the full height of its container. */
  fullHeight?: boolean;
  /** When true, the card stretches to fill its container width. */
  fullWidth?: boolean;
  /** Controls the padding inside the CardContent. Defaults to 'medium'. */
  padding?: CardPaddingSize;
  /** Click handler — only active when clickable is true. */
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  /** HTML id applied to the root Card element. */
  id?: string;
  /** Accessible label for the card when clickable. */
  'aria-label'?: string;
}
