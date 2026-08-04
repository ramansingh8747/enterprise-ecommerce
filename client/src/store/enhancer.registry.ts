import type { StoreEnhancer } from '@reduxjs/toolkit';
import { devToolsEnhancer } from './enhancers/devtools.enhancer';

/**
 * Open/Closed Enhancer Registry (Module 5 - Step 5.5).
 *
 * Allows future feature modules to register store enhancers dynamically.
 */
export class EnhancerRegistry {
  private static enhancers: StoreEnhancer[] = [devToolsEnhancer];

  /**
   * Registers a store enhancer.
   */
  public static register(enhancer: StoreEnhancer): void {
    this.enhancers.push(enhancer);
  }

  /**
   * Gets all registered store enhancers.
   */
  public static getEnhancers(): readonly StoreEnhancer[] {
    return Object.freeze([...this.enhancers]);
  }
}
