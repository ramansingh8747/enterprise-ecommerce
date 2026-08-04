import type { ReactNode } from 'react';

/**
 * Enterprise Layout Type Definitions (Module 4 - Step 4.4).
 *
 * Layout category types, props contract, and layout feature configurations.
 */

export type LayoutType = 'app' | 'public' | 'auth' | 'customer' | 'admin' | 'error' | 'blank';

/** Common Props contract for layout wrapper components. */
export interface ILayoutProps {
  readonly children: ReactNode;
}

/** Feature configuration contract for custom layout behavior. */
export interface ILayoutConfig {
  readonly showHeader?: boolean;
  readonly showFooter?: boolean;
  readonly showSidebar?: boolean;
  readonly fullWidth?: boolean;
}
