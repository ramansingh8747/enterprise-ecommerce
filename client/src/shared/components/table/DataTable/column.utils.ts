import type { IDataTableColumn } from './DataTable.types';
import { DEFAULT_COLUMN_ALIGN, DEFAULT_COLUMN_VISIBLE } from './column.constants';

/**
 * Normalizes a column definition object by supplying default values
 * for visibility and cell text alignment if not explicitly configured.
 */
export function normalizeColumn<TData>(column: IDataTableColumn<TData>): IDataTableColumn<TData> {
  return {
    ...column,
    alignment: column.alignment ?? DEFAULT_COLUMN_ALIGN,
    visible: column.visible ?? DEFAULT_COLUMN_VISIBLE,
  };
}

/**
 * Filters and returns only the visible columns from a column configuration list.
 */
export function getVisibleColumns<TData>(
  columns: IDataTableColumn<TData>[]
): IDataTableColumn<TData>[] {
  return columns.filter((col) => col.visible !== false);
}

/**
 * Safely extracts a cell value from a row object based on the accessor key, dot-path, or callback.
 * Handles nested property access safely (e.g. 'user.profile.firstName').
 *
 * @param row The row data object.
 * @param accessor The field key (keyof TData), dot-notated path string, or resolver function.
 */
export function getCellValue<TData>(
  row: TData,
  accessor?: keyof TData | string | ((row: TData) => unknown) | undefined
): unknown {
  if (accessor === undefined) {
    return undefined;
  }

  // 1. Resolver function
  if (typeof accessor === 'function') {
    return accessor(row);
  }

  // 2. String accessor
  if (typeof accessor === 'string') {
    // Nested dot-notation path check
    if (accessor.includes('.')) {
      const parts = accessor.split('.');
      let current: unknown = row;
      for (const part of parts) {
        if (current && typeof current === 'object' && part in (current as Record<string, unknown>)) {
          current = (current as Record<string, unknown>)[part];
        } else {
          return undefined;
        }
      }
      return current;
    }

    return (row as Record<string, unknown>)[accessor];
  }

  // 3. keyof TData accessor fallback (cast to unknown first to allow conversion of symbol | number to string)
  return (row as Record<string, unknown>)[accessor as unknown as string];
}
