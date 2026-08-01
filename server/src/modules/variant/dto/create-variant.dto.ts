/**
 * Create Product Variant DTO.
 *
 * Transport contract for inbound create requests.
 * Shape-only — no validation or persistence logic.
 * `product` is required: every variant belongs to one Product.
 */
export interface CreateVariantDto {
    product: string;
    sku?: string;
    color?: string;
    size?: string;
    price: number;
    salePrice?: number;
    stock?: number;
    images?: string[];
    isActive?: boolean;
}
