/**
 * Update Category DTO.
 *
 * Transport contract for inbound update requests.
 * All fields optional to support partial updates.
 * Shape-only — no validation or persistence logic.
 */
export interface UpdateCategoryDto {
    name?: string;
    slug?: string;
    description?: string;
    parent?: string | null;
    level?: number;
    isActive?: boolean;
    sortOrder?: number;
}
