import type { ApiTagCategory } from './tag.types';
import { TAG_CATEGORIES } from './tag.constants';

/**
 * Open/Closed Cache Tag Registry (Module 6 - Step 6.3).
 *
 * Centralized registry for RTK Query tag types, enabling dynamic feature tag registration.
 */
export class TagRegistry {
  private static tags: Set<ApiTagCategory> = new Set(TAG_CATEGORIES);

  /**
   * Registers a new cache tag category.
   */
  public static registerTag(tag: ApiTagCategory): void {
    this.tags.add(tag);
  }

  /**
   * Gets all registered cache tag category strings.
   */
  public static getRegisteredTags(): ApiTagCategory[] {
    return Array.from(this.tags);
  }
}
