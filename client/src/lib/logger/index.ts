/**
 * Client Logging Infrastructure Library Placeholder (Module 2 - Step 2.5).
 *
 * This module will expose structured logging, log-level filtering, and remote telemetry
 * adapters (Sentry / Datadog) in upcoming modules.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface ILogger {
  debug(message: string, context?: unknown): void;
  info(message: string, context?: unknown): void;
  warn(message: string, context?: unknown): void;
  error(message: string, error?: unknown, context?: unknown): void;
}

export const LOGGER_LIB_MARKER = 'LOGGER_LIB_INITIALIZED';
