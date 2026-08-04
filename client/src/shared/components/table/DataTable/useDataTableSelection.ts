import { useState, useCallback, useMemo } from 'react';

/**
 * Hook parameter structure.
 */
export interface IUseDataTableSelectionParams<TData> {
  readonly data: TData[];
  readonly rowKey: (row: TData) => string | number;
  readonly initialSelectedRowIds?: readonly (string | number)[] | undefined;
}

/**
 * Enterprise useDataTableSelection Hook (Module 10 - Step 10.8).
 *
 * Generic hook that manages client-side row selection using Set objects.
 */
export function useDataTableSelection<TData>({
  data,
  rowKey,
  initialSelectedRowIds = [],
}: IUseDataTableSelectionParams<TData>) {
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(
    () => new Set(initialSelectedRowIds)
  );

  const toggleSelectRow = useCallback((id: string | number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const selectRow = useCallback((id: string | number) => {
    setSelectedIds((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const deselectRow = useCallback((id: string | number) => {
    setSelectedIds((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const selectAllRows = useCallback(
    (visibleRows: TData[]) => {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        for (const row of visibleRows) {
          next.add(rowKey(row));
        }
        return next;
      });
    },
    [rowKey]
  );

  const deselectAllRows = useCallback(
    (visibleRows: TData[]) => {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        for (const row of visibleRows) {
          next.delete(rowKey(row));
        }
        return next;
      });
    },
    [rowKey]
  );

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const selectedRowData = useMemo(() => {
    return data.filter((row) => selectedIds.has(rowKey(row)));
  }, [data, rowKey, selectedIds]);

  return {
    selectedRowIds: selectedIds,
    selectedRowData,
    toggleSelectRow,
    selectRow,
    deselectRow,
    selectAllRows,
    deselectAllRows,
    clearSelection,
  };
}
export default useDataTableSelection;
