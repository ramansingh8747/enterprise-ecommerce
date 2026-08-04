/**
 * Enterprise Browser Storage Key Constants (Module 2 - Step 2.1).
 *
 * Centralized keys for LocalStorage, SessionStorage, and Cookie tokens/preferences.
 * Prevents key collision and eliminates magic string storage lookups.
 */

const KEY_PREFIX = 'ent_ecom';

export const LOCAL_STORAGE_KEYS = Object.freeze({
  AUTH_TOKEN: `${KEY_PREFIX}_auth_token`,
  REFRESH_TOKEN: `${KEY_PREFIX}_refresh_token`,
  THEME_MODE: `${KEY_PREFIX}_theme_mode`,
  USER_PREFERENCES: `${KEY_PREFIX}_user_preferences`,
  RECENT_SEARCHES: `${KEY_PREFIX}_recent_searches`,
  CART_DRAFT: `${KEY_PREFIX}_cart_draft`,
});

export const SESSION_STORAGE_KEYS = Object.freeze({
  SESSION_ID: `${KEY_PREFIX}_session_id`,
  ACTIVE_TAB: `${KEY_PREFIX}_active_tab`,
  CHECKOUT_STEP: `${KEY_PREFIX}_checkout_step`,
  TEMP_FORM_DATA: `${KEY_PREFIX}_temp_form_data`,
});

export const COOKIE_KEYS = Object.freeze({
  ACCESS_TOKEN: `${KEY_PREFIX}_access_token`,
  REFRESH_TOKEN: `${KEY_PREFIX}_refresh_token`,
  CSRF_TOKEN: `${KEY_PREFIX}_csrf_token`,
  LOCALE: `${KEY_PREFIX}_locale`,
});
