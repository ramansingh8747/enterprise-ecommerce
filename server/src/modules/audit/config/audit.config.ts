/**
 * Enterprise Audit Engine Configuration (Module 24.4 / 24.6).
 *
 * Strongly-typed options governing request interception, route exclusion,
 * sensitive data masking, header whitelisting, payload size bounds, and retention policies.
 * Supports environment variable overrides with safe production fallbacks.
 */

export interface IAuditConfig {
  /** Master switch to enable or disable automatic HTTP request audit tracking. */
  enabled: boolean;

  /** Default retention period for audit logs in days. */
  retentionDays: number;

  /** Batch size for bulk asynchronous log ingestion. */
  batchSize: number;

  /** Maximum rows allowed in a single export operation. */
  exportMaxRows: number;

  /** Route URL paths or prefixes excluded from automatic activity tracking. */
  excludedRoutes: string[];

  /** HTTP methods excluded from audit tracking (e.g., OPTIONS, HEAD). */
  excludedMethods: string[];

  /** HTTP response status codes ignored from audit logging. */
  ignoredStatusCodes: number[];

  /** Maximum request payload size in bytes to capture in audit metadata (8 KB). */
  maxBodySize: number;

  /** Whether to capture request body parameters in audit metadata. */
  captureRequestBody: boolean;

  /** Whether to capture response body payload in audit metadata. */
  captureResponseBody: boolean;

  /** Whether to capture query string parameters in audit metadata. */
  captureQuery: boolean;

  /** Whether to capture URL path parameters in audit metadata. */
  captureParams: boolean;

  /** Case-insensitive HTTP header whitelist safe for audit logging. */
  headerWhitelist: string[];

  /** Key names masked with '[REDACTED]' in request bodies, query, and metadata. */
  sensitiveKeys: string[];
}

/**
 * Default production-ready audit logging configuration with environment variable fallbacks.
 */
export const DEFAULT_AUDIT_CONFIG: IAuditConfig = {
  enabled: process.env.AUDIT_ENABLED !== 'false',
  retentionDays: process.env.AUDIT_RETENTION_DAYS
    ? parseInt(process.env.AUDIT_RETENTION_DAYS, 10)
    : 90,
  batchSize: process.env.AUDIT_BATCH_SIZE
    ? parseInt(process.env.AUDIT_BATCH_SIZE, 10)
    : 50,
  exportMaxRows: process.env.AUDIT_EXPORT_MAX_ROWS
    ? parseInt(process.env.AUDIT_EXPORT_MAX_ROWS, 10)
    : 10000,
  excludedRoutes: ['/health', '/metrics', '/favicon.ico', '/api/v1/health'],
  excludedMethods: ['OPTIONS', 'HEAD'],
  ignoredStatusCodes: [],
  maxBodySize: process.env.AUDIT_MAX_BODY_SIZE
    ? parseInt(process.env.AUDIT_MAX_BODY_SIZE, 10)
    : 8192,
  captureRequestBody: process.env.AUDIT_CAPTURE_REQUEST_BODY !== 'false',
  captureResponseBody: process.env.AUDIT_CAPTURE_RESPONSE_BODY === 'true',
  captureQuery: true,
  captureParams: true,
  headerWhitelist: [
    'user-agent',
    'x-request-id',
    'x-correlation-id',
    'content-type',
    'accept',
    'accept-language',
    'host',
  ],
  sensitiveKeys: [
    'password',
    'oldpassword',
    'newpassword',
    'confirmpassword',
    'otp',
    'token',
    'refreshtoken',
    'accesstoken',
    'authorization',
    'secret',
    'creditcard',
    'cvv',
    'ssn',
  ],
};
