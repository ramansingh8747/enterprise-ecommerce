/**
 * Job Retry Request DTO (Module 25.5).
 *
 * Payload shape for requesting job retry operations.
 */
export interface JobRetryDto {
  /** Optional flag forcing retry even if previous attempt limit was reached. */
  forceRetry?: boolean;

  /** Optional human-readable reason for triggering the retry. */
  reason?: string;
}
