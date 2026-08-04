import type { ReactNode } from 'react';

/**
 * FormLoading Component Props (Module 9 - Step 9.15).
 */
export interface IFormLoadingProps {
  /** If true, the loading indicator is displayed. Defaults to true. */
  loading?: boolean;
  /** Optional descriptive message to display alongside the spinner. */
  message?: string;
  /** Size of the spinner. Can be a number (pixels) or preset standard size. Defaults to 'medium'. */
  size?: number | 'small' | 'medium' | 'large';
  /** If true, renders as a full-viewport center overlay. Defaults to false. */
  fullscreen?: boolean;
  /** If true, renders as an inline block without container padding/spacing. Defaults to false. */
  inline?: boolean;
}

/**
 * FormOverlay Component Props (Module 9 - Step 9.15).
 */
export interface IFormOverlayProps {
  /** If true, the overlay is displayed. */
  loading: boolean;
  /** If true, applies a CSS backdrop blur. Defaults to true. */
  blurBackground?: boolean;
  /** If true, disables user interaction with underlying elements. Defaults to true. */
  disableInteraction?: boolean;
  /** Custom opacity value for the overlay background. Defaults to 0.4. */
  opacity?: number;
  /** Optional message or loading content to display in the overlay. */
  children?: ReactNode;
}

/**
 * FormSubmitting Component Props (Module 9 - Step 9.15).
 */
export interface IFormSubmittingProps {
  /** True when the form is undergoing submission or loading. */
  submitting: boolean;
  /** Optional message to display in the overlay. Defaults to 'Submitting...'. */
  message?: string;
  /** If true, applies a CSS backdrop blur to overlay. Defaults to true. */
  blurBackground?: boolean;
  /** Custom opacity value for the overlay background. Defaults to 0.4. */
  opacity?: number;
  /** Direct children of the form layout. */
  children: ReactNode;
}
