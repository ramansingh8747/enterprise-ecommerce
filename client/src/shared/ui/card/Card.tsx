import React from 'react';
import MuiCard from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Skeleton from '@mui/material/Skeleton';
import Box from '@mui/material/Box';
import type { SxProps, Theme } from '@mui/material';
import type { ICardProps } from './Card.types';
import {
  cardClickableSx,
  cardFooterSx,
  cardFullHeightSx,
  cardFullWidthSx,
  cardHeaderSx,
  cardLoadingSx,
  getCardContentSx,
} from './Card.styles';

/**
 * Combines multiple SxProps into a single object via Object.assign.
 * Array-based merging is not accepted by MUI's sx prop.
 */
const combineSx = (...parts: Array<SxProps<Theme> | undefined>): SxProps<Theme> =>
  Object.assign({}, ...parts.filter((p): p is SxProps<Theme> => p !== undefined && p !== null));

/**
 * Enterprise Shared Card Component (Module 8 - Step 8.11).
 *
 * Wraps MUI Card with optional CardHeader (title, subtitle, headerAction),
 * controlled content padding, full-height/width layout, clickable mode with
 * keyboard accessibility, and a loading skeleton state.
 */
const Card = React.forwardRef<HTMLDivElement, ICardProps>(
  (
    {
      title,
      subtitle,
      children,
      headerAction,
      footer,
      elevation,
      outlined = false,
      clickable = false,
      loading = false,
      fullHeight = false,
      fullWidth = false,
      padding = 'medium',
      onClick,
      id,
      'aria-label': ariaLabel,
    },
    ref
  ) => {
    const hasHeader =
      title !== undefined ||
      subtitle !== undefined ||
      headerAction !== undefined;

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>): void => {
      if (!clickable || onClick === undefined) return;
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onClick(event as unknown as React.MouseEvent<HTMLDivElement>);
      }
    };

    const rootSx = combineSx(
      fullHeight ? cardFullHeightSx : undefined,
      fullWidth ? cardFullWidthSx : undefined,
      clickable ? cardClickableSx : undefined
    );

    const contentSx = combineSx(
      getCardContentSx(padding),
      loading ? cardLoadingSx : undefined,
      fullHeight ? { flex: 1 } : undefined
    );

    return (
      <MuiCard
        ref={ref}
        variant={outlined ? 'outlined' : 'elevation'}
        {...(elevation !== undefined && !outlined ? { elevation } : {})}
        {...(id !== undefined ? { id } : {})}
        {...(clickable
          ? {
              role: 'button',
              tabIndex: 0,
              onClick,
              onKeyDown: handleKeyDown,
            }
          : {})}
        {...(ariaLabel !== undefined ? { 'aria-label': ariaLabel } : {})}
        sx={rootSx}
      >
        {hasHeader && (
          <CardHeader
            sx={cardHeaderSx}
            {...(title !== undefined ? { title } : {})}
            {...(subtitle !== undefined ? { subheader: subtitle } : {})}
            {...(headerAction !== undefined ? { action: headerAction } : {})}
          />
        )}

        <CardContent sx={contentSx}>
          {loading ? (
            <Box>
              <Skeleton variant="text" width="80%" height={24} />
              <Skeleton variant="text" width="60%" height={24} />
              <Skeleton variant="rectangular" height={80} sx={{ mt: 1, borderRadius: 1 }} />
            </Box>
          ) : (
            children
          )}
        </CardContent>

        {footer !== undefined && (
          <CardActions sx={cardFooterSx}>
            {footer}
          </CardActions>
        )}
      </MuiCard>
    );
  }
);

Card.displayName = 'Card';

export default Card;
export { Card };
