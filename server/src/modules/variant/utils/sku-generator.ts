/**
 * Enterprise Variant SKU generation utility.
 *
 * Pure, reusable helpers for normalizing and generating human-readable SKUs.
 * Format (configurable): <PRODUCTCODE>-<COLOR>-<SIZE>-<RANDOM>
 * Example: IPH16-BLK-128-4F8A
 *
 * No persistence or HTTP concerns — uniqueness retries belong in the service layer.
 */

import { randomBytes } from "crypto";

/**
 * Configurable SKU formatting options.
 */
export interface SkuGeneratorConfig {
    /** Segment separator (default: `-`). */
    separator: string;
    /** Max length for the product-code segment (default: 12). */
    maxProductCodeLength: number;
    /** Number of leading color characters (default: 3). */
    colorLength: number;
    /** Random suffix length, clamped to 4–6 (default: 4). */
    randomLength: number;
    /** Fallback when color is missing (default: `NA`). */
    fallbackColor: string;
    /** Fallback when size is missing (default: `OS`). */
    fallbackSize: string;
}

/**
 * Inputs required to build a generated variant SKU.
 */
export interface GenerateVariantSkuInput {
    productCode: string;
    color?: string;
    size?: string;
}

/**
 * Minimal product shape used to derive a product code.
 * Prefer `sku`, then `slug`, then `name`.
 */
export interface ProductCodeSource {
    sku?: string | null;
    slug?: string | null;
    name?: string | null;
}

/**
 * Default enterprise SKU formatting configuration.
 */
export const DEFAULT_SKU_GENERATOR_CONFIG: Readonly<SkuGeneratorConfig> = {
    separator: "-",
    maxProductCodeLength: 12,
    colorLength: 3,
    randomLength: 4,
    fallbackColor: "NA",
    fallbackSize: "OS",
};

const ALPHANUMERIC_UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

/**
 * Merges caller overrides with enterprise defaults.
 * Clamps `randomLength` into the supported 4–6 range.
 */
export const resolveSkuGeneratorConfig = (
    overrides: Partial<SkuGeneratorConfig> = {}
): SkuGeneratorConfig => {
    const merged: SkuGeneratorConfig = {
        ...DEFAULT_SKU_GENERATOR_CONFIG,
        ...overrides,
    };

    const randomLength = Math.min(
        6,
        Math.max(4, Math.floor(merged.randomLength) || 4)
    );

    return {
        ...merged,
        randomLength,
        maxProductCodeLength: Math.max(
            1,
            Math.floor(merged.maxProductCodeLength) || 12
        ),
        colorLength: Math.max(1, Math.floor(merged.colorLength) || 3),
    };
};

/**
 * Removes spaces/special characters and uppercases a SKU segment.
 */
export const sanitizeSkuSegment = (value: string): string => {
    return value
        .trim()
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "");
};

/**
 * Normalizes a manually provided SKU (trim + uppercase).
 * Hyphens are preserved for human-readable manual SKUs.
 */
export const normalizeManualSku = (sku: string): string => {
    const normalized = sku.trim().toUpperCase().replace(/\s+/g, "");

    if (!normalized) {
        throw new Error("Variant SKU is required.");
    }

    return normalized;
};

/**
 * Derives a compact product code from Product sku / slug / name.
 */
export const extractProductCode = (
    product: ProductCodeSource,
    config: Partial<SkuGeneratorConfig> = {}
): string => {
    const resolved = resolveSkuGeneratorConfig(config);

    const candidates = [product.sku, product.slug, product.name];

    for (const candidate of candidates) {
        if (!candidate || typeof candidate !== "string") {
            continue;
        }

        const sanitized = sanitizeSkuSegment(candidate);

        if (sanitized.length > 0) {
            return sanitized.slice(0, resolved.maxProductCodeLength);
        }
    }

    throw new Error("Unable to derive product code for SKU generation.");
};

/**
 * Builds a color segment from the first N alphanumeric characters.
 */
export const buildColorSegment = (
    color: string | undefined,
    config: Partial<SkuGeneratorConfig> = {}
): string => {
    const resolved = resolveSkuGeneratorConfig(config);

    if (!color || color.trim().length === 0) {
        return resolved.fallbackColor;
    }

    const sanitized = sanitizeSkuSegment(color);

    if (sanitized.length === 0) {
        return resolved.fallbackColor;
    }

    return sanitized.slice(0, resolved.colorLength);
};

/**
 * Builds a size segment (full sanitized uppercase value).
 */
export const buildSizeSegment = (
    size: string | undefined,
    config: Partial<SkuGeneratorConfig> = {}
): string => {
    const resolved = resolveSkuGeneratorConfig(config);

    if (!size || size.trim().length === 0) {
        return resolved.fallbackSize;
    }

    const sanitized = sanitizeSkuSegment(size);

    if (sanitized.length === 0) {
        return resolved.fallbackSize;
    }

    return sanitized;
};

/**
 * Generates a cryptographically strong alphanumeric uppercase suffix.
 */
export const generateRandomSuffix = (length = 4): string => {
    const safeLength = Math.min(6, Math.max(4, Math.floor(length) || 4));
    const bytes = randomBytes(safeLength);
    let suffix = "";

    for (let i = 0; i < safeLength; i += 1) {
        suffix += ALPHANUMERIC_UPPER[bytes[i] % ALPHANUMERIC_UPPER.length];
    }

    return suffix;
};

/**
 * Generates a human-readable variant SKU.
 * Does not check uniqueness — callers must retry on collision.
 */
export const generateVariantSku = (
    input: GenerateVariantSkuInput,
    config: Partial<SkuGeneratorConfig> = {}
): string => {
    const resolved = resolveSkuGeneratorConfig(config);

    const productCode = sanitizeSkuSegment(input.productCode).slice(
        0,
        resolved.maxProductCodeLength
    );

    if (!productCode) {
        throw new Error("Product code is required for SKU generation.");
    }

    const color = buildColorSegment(input.color, resolved);
    const size = buildSizeSegment(input.size, resolved);
    const random = generateRandomSuffix(resolved.randomLength);

    return [productCode, color, size, random].join(resolved.separator);
};
