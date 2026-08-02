/**
 * System and audit telemetry metadata attached to notification dispatches.
 */
export interface NotificationMetadata {
  /**
   * System or module initiating the notification (e.g., 'OrderService', 'AuthModule').
   */
  source: string;

  /**
   * Distributed tracing correlation ID for log aggregation.
   */
  correlationId: string;

  /**
   * Optional multi-tenant organizational identifier.
   */
  tenantId?: string;

  /**
   * Categorization tags for metrics and filtering.
   */
  tags?: string[];

  /**
   * Arbitrary key-value store for channel-specific provider flags.
   */
  attributes?: Record<string, unknown>;
}
