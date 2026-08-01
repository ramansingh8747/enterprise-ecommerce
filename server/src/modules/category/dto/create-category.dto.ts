/**
 * Create Category DTO.
 *
 * Transport contract for inbound create requests.
 * Shape-only — no validation or persistence logic.
 */
export interface CreateCategoryDto {
    name: string;
    slug: string;
    description?: string;
    parent?: string | null;
    level?: number;
    isActive?: boolean;
    sortOrder?: number;
}
