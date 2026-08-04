import type { IconName } from '../icon';

/**
 * Enterprise EmptyState Component Types (Module 8 - Step 8.23).
 *
 * Prop contract for standardizing placeholder layouts when data lists are empty.
 */
export interface IEmptyStateProps {
  /** Primary title description. */
  title: string;
  /** Secondary detailed paragraph subtext. */
  description?: string;
  /** Image illustration URL or custom vector node. */
  illustration?: React.ReactNode;
  /** Name of the icon resolved from the registry to display above the title. */
  icon?: IconName;
  /** Action node (usually a Button) rendered at the bottom. */
  action?: React.ReactNode;
  /** When true, stretches the container height to fill its parent. Defaults to false. */
  fullHeight?: boolean;
  /** When true, centers the layout inside the container. Defaults to true. */
  centered?: boolean;
  /** Renders a Skeleton structure when true. */
  loading?: boolean;
}
