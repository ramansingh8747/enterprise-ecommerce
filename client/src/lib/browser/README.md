# Browser Capabilities Infrastructure Library (`src/lib/browser/`)

## Purpose & Responsibility
Safely abstracts native browser capabilities (Online/Offline status, Clipboard API, Screen Media Queries, Notification API).

## Planned Implementation (Upcoming Modules)
- `ClipboardService`: Safe async text copy/paste driver with fallback handling.
- `NetworkStatusService`: Online/Offline connectivity event listener.
- `DeviceDetector`: Touch capability and viewport detection.

## Strict Boundaries
- **DO NOT** directly manipulate `document.body` or DOM nodes outside React component refs.
- **DO NOT** execute blocking alert/confirm dialogs (use Material UI modals/dialogs instead).
