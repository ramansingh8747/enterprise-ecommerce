import { useState, useMemo } from 'react';
import type { ISortState, IDataTableColumn } from './DataTable.types';
import { defaultComparator } from './sorting.utils';

/**
 * Enterprise useDataTableSorting Hook (Module 10 - Step 10.4).
 *
 * Generic hook that manages client-side sorting states, cycles directions,
 * and maintains stable sort outputs for the generic DataTable.
 */
export function useDataTableSorting<TData>(
  data: TData[],
  columns: IDataTableColumn<TData>[],
  initialSort?: ISortState
) {
  const [sortState, setSortState] = useState<ISortState>({
    columnId: initialSort?.columnId ?? null,
    direction: initialSort?.direction ?? null,
  });

  const sortedData = useMemo(() => {
    const { columnId, direction } = sortState;

    if (!columnId || !direction) {
      return data;
    }

    const column = columns.find((c) => c.id === columnId);
    if (!column || column.sortable === false) {
      return data;
    }

    const cloned = [...data];

    cloned.sort((a, b) => {
      // 1. Custom Comparator
      if (column.comparator) {
        return direction === 'asc' ? column.comparator(a, b) : column.comparator(b, a);
      }

      // 2. Default Comparator
      const result = defaultComparator(a, b, column.accessor);
      return direction === 'asc' ? result : -result;
    });

    return cloned;
  }, [data, columns, sortState]);

  const handleSort = (columnId: string) => {
    const column = columns.find((c) => c.id === columnId);
    if (!column || column.sortable === false) return;

    setSortState((prev) => {
      if (prev.columnId === columnId) {
        if (prev.direction === 'asc') {
          return { columnId, direction: 'desc' };
        }
        return { columnId: null, direction: null };
      }
      return { columnId, direction: 'asc' };
    });
  };

  return {
    sortedData,
    sortState,
    handleSort,
  };
}
