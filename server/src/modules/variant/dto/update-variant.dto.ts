/**
 * Update Product Variant DTO.
 *
 * Transport contract for inbound update requests.
 * All fields optional to support partial updates.
 * Shape-only — no validation or persistence logic.
 */
export interface UpdateVariantDto {
    sku?: string;
    color?: string;
    size?: string;
    price?: number;
    salePrice?: number;
    stock?: number;
    images?: string[];
    isActive?: boolean;
}
