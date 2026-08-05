/**
 * Generic Select Option Interface (Module 2 - Step 2.2).
 */
export interface IOption<T = string> {
  readonly label: string;
  readonly value: T;
  readonly disabled?: boolean;
  readonly icon?: string;
}

/**
 * Grouped Options Interface for Select Dropdowns.
 */
export interface IGroupedOption<T = string> {
  readonly group: string;
  readonly options: readonly IOption<T>[];
}

/** Standard UI Select Option. */
export type ISelectOption = IOption<string>;
