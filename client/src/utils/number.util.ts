/**
 * Number Utility Functions (Module 2 - Step 2.3).
 *
 * Pure numeric calculation and rounding helper utilities.
 */

/**
 * Clamps a number between a minimum and maximum bound.
 */
export function clamp(val: number, min: number, max: number): number {
  if (isNaN(val)) return min;
  return Math.min(Math.max(val, min), max);
}

/**
 * Rounds a number to a specified number of decimal places.
 */
export function roundTo(val: number, decimals = 2): number {
  if (isNaN(val)) return 0;
  const factor = Math.pow(10, decimals);
  return Math.round((val + Number.EPSILON) * factor) / factor;
}

/**
 * Generates a random integer within [min, max] inclusive bounds.
 */
export function randomInt(min: number, max: number): number {
  const ceilMin = Math.ceil(min);
  const floorMax = Math.floor(max);
  return Math.floor(Math.random() * (floorMax - ceilMin + 1)) + ceilMin;
}
