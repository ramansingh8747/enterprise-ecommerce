/**
 * Enterprise Transition Tokens (Module 3 - Step 3.1).
 *
 * Standard animation durations and easing curves.
 */

export const TRANSITION_TOKENS = Object.freeze({
  duration: Object.freeze({
    fastest: '75ms',
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
    slowest: '500ms',
  }),

  easing: Object.freeze({
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
  }),
});
