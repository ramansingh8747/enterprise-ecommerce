import { useEffect, useCallback } from 'react';
import type { FieldErrors } from 'react-hook-form';

/**
 * Options configuration for the useScrollToError hook.
 */
export interface IUseScrollToErrorOptions {
  /** The errors object from React Hook Form's formState. */
  errors: FieldErrors;
  /** True if we should automatically scroll when errors change. Defaults to true. */
  enabled?: boolean;
  /** Vertical offset (in pixels) to subtract from the scroll target. Defaults to 100. */
  offset?: number;
  /** Optional form container reference to limit search scope. */
  formRef?: React.RefObject<HTMLFormElement | HTMLElement>;
}

/**
 * Enterprise useScrollToError Hook (Module 9 - Step 9.16).
 *
 * Automatically scrolls the page to and focuses the first invalid form input.
 * First queries elements with aria-invalid="true" to support screen reader accessibility,
 * falling back to matching element name attributes.
 */
export function useScrollToError(options: IUseScrollToErrorOptions) {
  const { errors, enabled = true, offset = 100, formRef } = options;

  const triggerScroll = useCallback(() => {
    // 1. Get container scope
    const container = formRef?.current || document;

    // 2. Query for the first element with aria-invalid="true" (accessible default)
    let element = container.querySelector('[aria-invalid="true"]') as HTMLElement | null;

    // 3. Fallback: if aria-invalid is not set yet, try to find by name attribute from error keys
    if (!element && errors) {
      const errorKeys = Object.keys(errors);
      if (errorKeys.length > 0) {
        element = container.querySelector(`[name="${errorKeys[0]}"]`) as HTMLElement | null;
      }
    }

    if (element) {
      // 4. Calculate absolute vertical offset
      const elementRect = element.getBoundingClientRect();
      const absoluteTop = elementRect.top + window.scrollY;
      const scrollPosition = absoluteTop - offset;

      // 5. Scroll to the element smoothly
      window.scrollTo({
        top: Math.max(0, scrollPosition),
        behavior: 'smooth',
      });

      // 6. Focus the element safely
      // Query inside if the element itself is a container wrapper (like in MUI Select/DatePickers)
      const focusableTarget =
        element.tagName === 'INPUT' ||
        element.tagName === 'TEXTAREA' ||
        element.tagName === 'SELECT'
          ? element
          : (element.querySelector('input, textarea, select') as HTMLElement | null) || element;

      focusableTarget.focus({ preventScroll: true });
    }
  }, [errors, offset, formRef]);

  // Automatically trigger scroll when errors object updates
  useEffect(() => {
    if (!enabled || !errors || Object.keys(errors).length === 0) {
      return;
    }

    // Use requestAnimationFrame to ensure the DOM has completed its validation re-render
    const handle = requestAnimationFrame(() => {
      triggerScroll();
    });

    return () => cancelAnimationFrame(handle);
  }, [errors, enabled, triggerScroll]);

  return { triggerScroll };
}
