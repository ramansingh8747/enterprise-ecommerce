/**
 * Job Cancel Request DTO (Module 25.5).
 *
 * Payload shape for requesting job cancellation operations.
 */
export interface JobCancelDto {
  /** Optional human-readable reason for cancelling the background job. */
  reason?: string;
}
