/**
 * Enterprise HTTP Constants for API Requests (Module 6 - Step 6.2).
 *
 * Header key and media-type string constants.
 */

export const HTTP_HEADERS = Object.freeze({
  CONTENT_TYPE: 'Content-Type',
  ACCEPT: 'Accept',
  AUTHORIZATION: 'Authorization',
  X_API_VERSION: 'X-API-Version',
  X_REQUEST_ID: 'X-Request-Id',
  X_CLIENT_VERSION: 'X-Client-Version',
});

export const MEDIA_TYPES = Object.freeze({
  JSON: 'application/json',
  MULTIPART: 'multipart/form-data',
  FORM_URLENCODED: 'application/x-www-form-urlencoded',
});
