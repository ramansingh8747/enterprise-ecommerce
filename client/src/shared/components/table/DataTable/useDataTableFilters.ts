import { useState, useMemo, useCallback } from 'react';
import type { IDataTableColumn } from './DataTable.types';
import { getCellValue } from './column.utils';

/**
 * Enterprise useDataTableFilters Hook (Module 10 - Step 10.7).
 *
 * Generic hook that manages client-side column filters and calculates filtered data outputs.
 */
export function useDataTableFilters<TData>(
  data: TData[],
  columns: IDataTableColumn<TData>[],
  initialFilters: Record<string, unknown> = {}
) {
  const [filters, setFilters] = useState<Record<string, unknown>>(initialFilters);

  const filteredData = useMemo(() => {
    return data.filter((row) => {
      return Object.entries(filters).every(([colId, filterValue]) => {
        // Skip empty or unassigned filter criteria
        if (filterValue === undefined || filterValue === null || filterValue === '') {
          return true;
        }

        const column = columns.find((c) => c.id === colId);
        if (!column || column.filterable === false) {
          return true;
        }

        // 1. Custom Filter Comparator callback
        if (column.customFilter) {
          return column.customFilter(row, filterValue);
        }

        const cellValue = getCellValue(row, column.accessor);
        const type = column.filterType ?? 'text';

        // 2. Default Comparators by column type
        switch (type) {
          case 'text':
            return String(cellValue)
              .toLowerCase()
              .includes(String(filterValue).toLowerCase().trim());

          case 'select':
            return String(cellValue) === String(filterValue);

          case 'boolean': {
            // Normalize filterValue to boolean since select outputs strings 'true'/'false'
            const targetBool = filterValue === 'true' || filterValue === true;
            return Boolean(cellValue) === targetBool;
          }

          case 'number':
            return Number(cellValue) === Number(filterValue);

          case 'date':
            // Direct string match comparison
            return String(cellValue) === String(filterValue);

          default:
            return true;
        }
      });
    });
  }, [data, columns, filters]);

  const setFilter = useCallback((columnId: string, value: unknown) => {
    setFilters((prev) => ({
      ...prev,
      [columnId]: value,
    }));
  }, []);

  const clearFilter = useCallback((columnId: string) => {
    setFilters((prev) => {
      const next = { ...prev };
      delete next[columnId];
      return next;
    });
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters({});
  }, []);

  return {
    filters,
    filteredData,
    setFilter,
    clearFilter,
    clearAllFilters,
  };
}
export default useDataTableFilters;
