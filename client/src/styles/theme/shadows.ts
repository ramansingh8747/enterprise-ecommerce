import type { Shadows } from '@mui/material/styles';
import { SHADOW_TOKENS } from '../tokens/shadows.tokens';

/**
 * Enterprise Material UI Shadows Configuration (Module 3 - Step 3.2).
 *
 * Driven by SHADOW_TOKENS. Maps elevation levels into Material UI's 25-shadow array tuple.
 */
export const shadowsOptions: Shadows = [
  SHADOW_TOKENS.none, // 0
  SHADOW_TOKENS.xs, // 1
  SHADOW_TOKENS.sm, // 2
  SHADOW_TOKENS.sm, // 3
  SHADOW_TOKENS.md, // 4
  SHADOW_TOKENS.md, // 5
  SHADOW_TOKENS.md, // 6
  SHADOW_TOKENS.lg, // 7
  SHADOW_TOKENS.lg, // 8
  SHADOW_TOKENS.lg, // 9
  SHADOW_TOKENS.xl, // 10
  SHADOW_TOKENS.xl, // 11
  SHADOW_TOKENS.xl, // 12
  SHADOW_TOKENS.xl, // 13
  SHADOW_TOKENS.xl, // 14
  SHADOW_TOKENS['2xl'], // 15
  SHADOW_TOKENS['2xl'], // 16
  SHADOW_TOKENS['2xl'], // 17
  SHADOW_TOKENS['2xl'], // 18
  SHADOW_TOKENS['2xl'], // 19
  SHADOW_TOKENS['2xl'], // 20
  SHADOW_TOKENS['2xl'], // 21
  SHADOW_TOKENS['2xl'], // 22
  SHADOW_TOKENS['2xl'], // 23
  SHADOW_TOKENS['2xl'], // 24
];
