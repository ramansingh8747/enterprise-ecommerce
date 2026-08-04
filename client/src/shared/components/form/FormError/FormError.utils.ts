/**
 * Enterprise FormError Parsing Utilities (Module 9 - Step 9.13).
 */

/**
 * Parses unknown error structures (RHF errors, string arrays, RTK Query server errors) into flat strings.
 */
export const parseError = (error: unknown): string[] => {
  if (!error) return [];
  if (typeof error === 'string') return [error];
  if (Array.isArray(error)) {
    return error.flatMap((err) => parseError(err));
  }
  if (typeof error === 'object') {
    // RTK Query error formats
    if ('data' in error) {
      const data = (error as { data: unknown }).data;
      if (data && typeof data === 'object') {
        if ('message' in data && typeof data.message === 'string') {
          return [data.message];
        }
        if ('error' in data && typeof data.error === 'string') {
          return [data.error];
        }
        if ('errors' in data && Array.isArray(data.errors)) {
          return data.errors.map(String);
        }
      }
    }
    if ('error' in error && typeof (error as { error: unknown }).error === 'string') {
      return [(error as { error: string }).error];
    }
    // RHF FieldError format
    if ('message' in error && typeof error.message === 'string') {
      return [error.message];
    }
    // Recurse nesting keys
    const messages: string[] = [];
    for (const key of Object.keys(error)) {
      const val = (error as Record<string, unknown>)[key];
      messages.push(...parseError(val));
    }
    return messages;
  }
  return [String(error)];
};
