import { useState, useMemo } from 'react';
import type { IDataTableColumn } from './DataTable.types';
import { getCellValue } from './column.utils';

/**
 * Enterprise useDataTableSearch Hook (Module 10 - Step 10.6).
 *
 * Generic hook that filters rows based on a search query across searchable columns.
 */
export function useDataTableSearch<TData>(
  data: TData[],
  columns: IDataTableColumn<TData>[],
  initialQuery = ''
) {
  const [searchQuery, setSearchQuery] = useState(initialQuery);

  const filteredData = useMemo(() => {
    const trimmed = searchQuery.trim().toLowerCase();
    if (!trimmed) {
      return data;
    }

    // Filter columns that are visible and not explicitly marked searchable: false
    const searchableColumns = columns.filter(
      (col) => col.visible !== false && col.searchable !== false
    );

    return data.filter((row) => {
      return searchableColumns.some((col) => {
        const value = getCellValue(row, col.accessor);
        if (value === undefined || value === null) {
          return false;
        }

        // Handle custom render string fallback if available, otherwise check raw value
        return String(value).toLowerCase().includes(trimmed);
      });
    });
  }, [data, columns, searchQuery]);

  return {
    searchQuery,
    setSearchQuery,
    filteredData,
  };
}
export default useDataTableSearch;
