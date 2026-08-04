/**
 * Pure Routing Utility Functions (Module 4 - Step 4.5).
 *
 * Framework-agnostic routing utilities containing ZERO React imports.
 */

/**
 * Normalizes a URL path string (ensuring leading slash and removing trailing slashes).
 */
export function normalizePath(path: string): string {
  if (!path || typeof path !== 'string') return '/';
  let clean = path.trim();
  if (!clean.startsWith('/')) {
    clean = `/${clean}`;
  }
  if (clean.length > 1 && clean.endsWith('/')) {
    clean = clean.slice(0, -1);
  }
  return clean;
}

/**
 * Safely joins URL path segments together.
 */
export function joinPaths(...segments: readonly string[]): string {
  const parts = segments
    .map((s) => s.replace(/^\/+|\/+$/g, ''))
    .filter((s) => s.length > 0);
  return `/${parts.join('/')}`;
}

/**
 * Checks whether a URL target is an external HTTP/HTTPS link.
 */
export function isExternalLink(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('//');
}

/**
 * Checks if a candidate path matches a dynamic path pattern (e.g. "/products/:id").
 */
export function matchPathPattern(pattern: string, candidatePath: string): boolean {
  const normPattern = normalizePath(pattern);
  const normCandidate = normalizePath(candidatePath);

  const regexStr = `^${normPattern.replace(/:[a-zA-Z0-9_]+/g, '[^/]+')}$`;
  const regex = new RegExp(regexStr);
  return regex.test(normCandidate);
}
