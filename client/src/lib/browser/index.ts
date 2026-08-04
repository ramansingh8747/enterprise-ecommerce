/**
 * Browser API Infrastructure Library Placeholder (Module 2 - Step 2.5).
 *
 * This module will expose abstractions for browser APIs such as Clipboard, Geolocation,
 * Device Detection, and Intersection Observer in upcoming modules.
 */

export interface IBrowserCapabilities {
  readonly isOnline: boolean;
  readonly isTouchDevice: boolean;
  readonly hasClipboardAccess: boolean;
}

export const BROWSER_LIB_MARKER = 'BROWSER_LIB_INITIALIZED';
