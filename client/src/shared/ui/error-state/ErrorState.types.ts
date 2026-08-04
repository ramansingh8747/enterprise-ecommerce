import type { IconName } from '../icon';

/** Severity categories that direct visual accent colors and defaults. */
export type ErrorSeverity = 'info' | 'warning' | 'error' | 'critical';

/**
 * Enterprise ErrorState Component Types (Module 8 - Step 8.24).
 *
 * Prop contract for standardizing error overlay displays when API or state crashes occur.
 */
export interface IErrorStateProps {
  /** Main title message describing the error. */
  title: string;
  /** Secondary detailed paragraph subtext. */
  description?: string;
  /** Optional system error code or reference string (e.g. ERR_CONNECTION_FAILED). */
  errorCode?: string;
  /** Visual category level of the error layout. Defaults to 'error'. */
  severity?: ErrorSeverity;
  /** Name of the icon resolved from the registry to display above the title. */
  icon?: IconName;
  /** Image illustration URL or custom vector node. */
  illustration?: React.ReactNode;
  /** Action node (usually a Button) rendered at the bottom. */
  action?: React.ReactNode;
  /** When true, renders a standard retry action Button at the bottom (takes precedence if action is missing). */
  retryable?: boolean;
  /** Callback triggered when the retry button is clicked. */
  onRetry?: () => void;
  /** Label text for the retry action button. Defaults to 'Retry'. */
  retryLabel?: string;
  /** When true, stretches the container height to fill its parent. Defaults to false. */
  fullHeight?: boolean;
  /** When true, centers the layout inside the container. Defaults to true. */
  centered?: boolean;
  /** Renders a Skeleton structure when true. */
  loading?: boolean;
}
