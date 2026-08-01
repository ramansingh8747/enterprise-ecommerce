/**
 * Enterprise Variant pricing helpers.
 *
 * Pure calculations and validation for price / salePrice / discount.
 * No persistence or HTTP concerns.
 */

/**
 * Persistable pricing inputs.
 */
export interface VariantPricingInput {
    price: number;
    salePrice?: number | null;
}

/**
 * Computed pricing fields returned on Variant responses.
 */
export interface VariantPricingComputed {
    price: number;
    salePrice?: number;
    finalPrice: number;
    discountPercentage: number;
}

/**
 * Ensures price and optional salePrice obey enterprise pricing rules.
 */
export const assertVariantPricing = (
    price: number,
    salePrice?: number | null
): void => {
    if (typeof price !== "number" || !Number.isFinite(price) || price < 0) {
        throw new Error("Variant price cannot be negative.");
    }

    if (salePrice === undefined || salePrice === null) {
        return;
    }

    if (
        typeof salePrice !== "number" ||
        !Number.isFinite(salePrice) ||
        salePrice < 0
    ) {
        throw new Error("Variant sale price cannot be negative.");
    }

    if (salePrice > price) {
        throw new Error("Sale price cannot be greater than price.");
    }
};

/**
 * Rounds a number to two decimal places.
 */
export const roundToTwoDecimals = (value: number): number => {
    return Math.round((value + Number.EPSILON) * 100) / 100;
};

/**
 * Calculates discount percentage from price and salePrice.
 * Returns 0 when salePrice is absent or price is 0.
 */
export const calculateDiscountPercentage = (
    price: number,
    salePrice?: number | null
): number => {
    if (
        salePrice === undefined ||
        salePrice === null ||
        typeof salePrice !== "number" ||
        !Number.isFinite(salePrice)
    ) {
        return 0;
    }

    if (price <= 0) {
        return 0;
    }

    const discount = ((price - salePrice) / price) * 100;
    return roundToTwoDecimals(Math.max(0, discount));
};

/**
 * Resolves the customer-facing final price.
 */
export const resolveFinalPrice = (
    price: number,
    salePrice?: number | null
): number => {
    if (
        salePrice !== undefined &&
        salePrice !== null &&
        typeof salePrice === "number" &&
        Number.isFinite(salePrice)
    ) {
        return salePrice;
    }

    return price;
};

/**
 * Builds computed pricing fields for a Variant response.
 */
export const buildVariantPricing = (
    input: VariantPricingInput
): VariantPricingComputed => {
    assertVariantPricing(input.price, input.salePrice);

    const hasSalePrice =
        input.salePrice !== undefined && input.salePrice !== null;

    return {
        price: input.price,
        ...(hasSalePrice ? { salePrice: input.salePrice as number } : {}),
        finalPrice: resolveFinalPrice(input.price, input.salePrice),
        discountPercentage: calculateDiscountPercentage(
            input.price,
            input.salePrice
        ),
    };
};
