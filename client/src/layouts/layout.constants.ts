import type { LayoutType, ILayoutConfig } from './layout.types';

/**
 * Enterprise Layout Constants (Module 4 - Step 4.4).
 *
 * Centralized constant definitions for layout types and default feature flags.
 */

export const LAYOUT_TYPES = Object.freeze({
  APP: 'app' as LayoutType,
  PUBLIC: 'public' as LayoutType,
  AUTH: 'auth' as LayoutType,
  CUSTOMER: 'customer' as LayoutType,
  ADMIN: 'admin' as LayoutType,
  ERROR: 'error' as LayoutType,
  BLANK: 'blank' as LayoutType,
});

export const LAYOUT_CONFIGS: Record<LayoutType, ILayoutConfig> = Object.freeze({
  app: Object.freeze({ showHeader: true, showFooter: true, showSidebar: false, fullWidth: false }),
  public: Object.freeze({ showHeader: true, showFooter: true, showSidebar: false, fullWidth: false }),
  auth: Object.freeze({ showHeader: false, showFooter: true, showSidebar: false, fullWidth: false }),
  customer: Object.freeze({ showHeader: true, showFooter: true, showSidebar: true, fullWidth: false }),
  admin: Object.freeze({ showHeader: true, showFooter: false, showSidebar: true, fullWidth: true }),
  error: Object.freeze({ showHeader: false, showFooter: false, showSidebar: false, fullWidth: false }),
  blank: Object.freeze({ showHeader: false, showFooter: false, showSidebar: false, fullWidth: false }),
});
