import type { IBackendProduct, IProduct } from '../types/products.types';

/**
 * Maps a backend product object to the frontend DataTable product model.
 */
export function mapBackendProductToFrontend(product: IBackendProduct): IProduct {
  console.log('Mapping product:', product);
  let status: 'active' | 'draft' | 'out_of_stock' = 'draft';

  if (product.status === 'ACTIVE') {
    status = product.quantity === 0 ? 'out_of_stock' : 'active';
  } else if (product.status === 'DRAFT') {
    status = 'draft';
  } else {
    status = 'out_of_stock';
  }

  // Format ISO timestamp to YYYY-MM-DD
  let formattedDate = '2026-01-01';
  try {
    if (product.createdAt) {
      const parts = product.createdAt.split('T');
      if (parts[0]) {
        formattedDate = parts[0];
      }
    }
  } catch {
    // Fallback if date is invalid
  }

  return {
    id: product._id,
    name: product.name,
    sku: product.sku,
    price: product.price,
    status,
    stock: product.quantity,
    createdAt: formattedDate,
  };
}

/**
 * Maps a list of backend products to frontend DataTable products list.
 */
export function mapBackendProductsToFrontend(products: readonly IBackendProduct[]): IProduct[] {
  return products.map(mapBackendProductToFrontend);
}
