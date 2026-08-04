# Client Logger Infrastructure Library (`src/lib/logger/`)

## Purpose & Responsibility
Provides a structured logger interface (`ILogger`) for recording application events, warnings, API failures, and unhandled errors.

## Planned Implementation (Upcoming Modules)
- `ConsoleLogger`: Formatted console logger with color coding and environment level suppression (e.g. suppress `debug` in production).
- `RemoteTelemetryLogger`: Sentry / Error monitoring bridge for catching production runtime exceptions.

## Strict Boundaries
- **DO NOT** output raw `console.log` statements in production components (route all logs through `logger`).
- **DO NOT** log sensitive user PII (passwords, credit card numbers, auth tokens).
