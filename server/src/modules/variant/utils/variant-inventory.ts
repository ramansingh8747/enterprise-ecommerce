/**
 * Enterprise Variant inventory helpers.
 *
 * Pure stock mutation and availability calculations.
 * No persistence or HTTP concerns.
 */

/**
 * Variant inventory availability statuses.
 */
export const VARIANT_AVAILABILITY_STATUS = {
    IN_STOCK: "IN_STOCK",
    OUT_OF_STOCK: "OUT_OF_STOCK",
    LOW_STOCK: "LOW_STOCK",
} as const;

export type VariantAvailabilityStatus =
    (typeof VARIANT_AVAILABILITY_STATUS)[keyof typeof VARIANT_AVAILABILITY_STATUS];

/**
 * Configurable inventory thresholds.
 */
export interface VariantInventoryConfig {
    /** Stock at or below this (and > 0) is LOW_STOCK. */
    lowStockThreshold: number;
}

export const DEFAULT_VARIANT_INVENTORY_CONFIG: Readonly<VariantInventoryConfig> =
    {
        lowStockThreshold: 5,
    };

/**
 * Result of a validated stock mutation (before persistence).
 */
export interface VariantStockMutationPlan {
    previousStock: number;
    stock: number;
    availabilityStatus: VariantAvailabilityStatus;
}

/**
 * Ensures stock is a non-negative finite integer-compatible number.
 */
export const assertNonNegativeStock = (stock: number): void => {
    if (typeof stock !== "number" || !Number.isFinite(stock) || stock < 0) {
        throw new Error("Stock cannot be negative.");
    }
};

/**
 * Ensures a stock delta/quantity is a positive finite number.
 */
export const assertPositiveQuantity = (quantity: number): void => {
    if (
        typeof quantity !== "number" ||
        !Number.isFinite(quantity) ||
        quantity <= 0
    ) {
        throw new Error("Quantity must be greater than 0.");
    }
};

/**
 * Resolves availability from current stock and optional low-stock threshold.
 */
export const resolveVariantAvailability = (
    stock: number,
    config: Partial<VariantInventoryConfig> = {}
): VariantAvailabilityStatus => {
    assertNonNegativeStock(stock);

    const threshold =
        config.lowStockThreshold ??
        DEFAULT_VARIANT_INVENTORY_CONFIG.lowStockThreshold;

    if (stock === 0) {
        return VARIANT_AVAILABILITY_STATUS.OUT_OF_STOCK;
    }

    if (stock > 0 && stock <= threshold) {
        return VARIANT_AVAILABILITY_STATUS.LOW_STOCK;
    }

    return VARIANT_AVAILABILITY_STATUS.IN_STOCK;
};

/**
 * Plans an absolute stock set operation.
 */
export const planSetStock = (
    previousStock: number,
    quantity: number,
    config: Partial<VariantInventoryConfig> = {}
): VariantStockMutationPlan => {
    assertNonNegativeStock(previousStock);
    assertNonNegativeStock(quantity);

    return {
        previousStock,
        stock: quantity,
        availabilityStatus: resolveVariantAvailability(quantity, config),
    };
};

/**
 * Plans a stock increase by a positive quantity.
 */
export const planIncreaseStock = (
    previousStock: number,
    quantity: number,
    config: Partial<VariantInventoryConfig> = {}
): VariantStockMutationPlan => {
    assertNonNegativeStock(previousStock);
    assertPositiveQuantity(quantity);

    const nextStock = previousStock + quantity;

    return {
        previousStock,
        stock: nextStock,
        availabilityStatus: resolveVariantAvailability(nextStock, config),
    };
};

/**
 * Plans a stock decrease by a positive quantity.
 * Throws when the operation would produce negative inventory.
 */
export const planDecreaseStock = (
    previousStock: number,
    quantity: number,
    config: Partial<VariantInventoryConfig> = {}
): VariantStockMutationPlan => {
    assertNonNegativeStock(previousStock);
    assertPositiveQuantity(quantity);

    const nextStock = previousStock - quantity;

    if (nextStock < 0) {
        throw new Error(
            "Insufficient stock. Stock update would result in negative inventory."
        );
    }

    return {
        previousStock,
        stock: nextStock,
        availabilityStatus: resolveVariantAvailability(nextStock, config),
    };
};
