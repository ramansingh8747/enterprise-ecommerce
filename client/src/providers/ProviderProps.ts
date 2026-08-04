import type { ReactNode } from 'react';

/**
 * Common Provider Props Interface (Module 2 - Step 2.4).
 *
 * Contract for application provider components wrapping child elements.
 */
export interface IProviderProps {
  readonly children: ReactNode;
}
