/**
 * Search Module Custom Typed Exceptions (Module 22.3).
 */

export class SearchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SearchError';
  }
}

export class SearchRepositoryError extends SearchError {
  constructor(message: string, public readonly originalError?: Error) {
    super(`SearchRepository Error: ${message}`);
    this.name = 'SearchRepositoryError';
  }
}

export class InvalidSearchFilterError extends SearchError {
  constructor(message: string) {
    super(`Invalid Search Filter: ${message}`);
    this.name = 'InvalidSearchFilterError';
  }
}
