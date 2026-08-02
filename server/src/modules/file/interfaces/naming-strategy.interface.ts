import { NamingStrategyType } from '../types/file.types';

/**
 * Naming Strategy Component Contract (Module 21.1).
 */
export interface INamingStrategy {
  /**
   * Generates a sanitized unique filename using the selected strategy.
   * @param originalFilename Client original filename
   * @param strategyType Optional naming strategy type
   * @param customPrefix Optional custom prefix or folder hint
   */
  generateName(
    originalFilename: string,
    strategyType?: NamingStrategyType,
    customPrefix?: string
  ): string;
}
