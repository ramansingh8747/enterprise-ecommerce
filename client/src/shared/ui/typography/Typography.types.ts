import type { TypographyProps as MuiTypographyProps } from '@mui/material/Typography';

/** All standard MUI typography variants. */
export type TypographyVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'subtitle1'
  | 'subtitle2'
  | 'body1'
  | 'body2'
  | 'caption'
  | 'button'
  | 'overline'
  | 'inherit';

/**
 * Enterprise Typography Component Types (Module 8 - Step 8.19).
 *
 * Inherits a safe subset of MUI TypographyProps, extending it with text-selection control,
 * text truncation, and loading state skeletons.
 */
export interface ITypographyProps
  extends Pick<
    MuiTypographyProps,
    | 'align'
    | 'gutterBottom'
    | 'noWrap'
    | 'paragraph'
    | 'sx'
  > {
  /** The text content or child elements. */
  children?: React.ReactNode;
  /** Visual variant representation. Defaults to 'body1'. */
  variant?: TypographyVariant;
  /** Semantic HTML element wrapper. Defaults to 'span'. */
  component?: React.ElementType;
  /** Text color value or theme color token. Defaults to 'text.primary'. */
  color?: string;
  /** Custom weight override. E.g. 'bold', 600, 'normal'. */
  fontWeight?: number | string;
  /** Truncates overflow text with a clean ellipsis indicator. Defaults to false. */
  truncate?: boolean;
  /** Controls if users can select the text. Defaults to true. */
  selectable?: boolean;
  /** When true, renders a Skeleton placeholder of matching width/height instead of content. */
  loading?: boolean;
}
