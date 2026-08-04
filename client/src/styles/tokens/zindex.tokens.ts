/**
 * Enterprise Z-Index Tokens (Module 3 - Step 3.1).
 *
 * Stacking layer order scale for component overlays, popovers, modals, and tooltips.
 */

export const ZINDEX_TOKENS = Object.freeze({
  deep: -999,
  default: 1,
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  modalBackdrop: 1300,
  modal: 1400,
  popover: 1500,
  tooltip: 1600,
  toast: 1700,
});
