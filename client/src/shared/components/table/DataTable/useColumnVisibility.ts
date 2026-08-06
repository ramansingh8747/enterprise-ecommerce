import { useState, useEffect, useMemo } from 'react';
import type { IDataTableColumn } from './DataTable.types';

/**
 * Hook to manage column visibility persistence.
 */
export const useColumnVisibility = <TData,>(
  tableId: string, 
  columns: IDataTableColumn<TData>[],
  controlledVisibleColumns?: Record<string, boolean>
) => {
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(() => {
    if (controlledVisibleColumns) return controlledVisibleColumns;
    const saved = localStorage.getItem(`dt-cols-${tableId}`);
    if (saved) {
      return JSON.parse(saved);
    }
    const defaults: Record<string, boolean> = {};
    columns.forEach(col => {
      defaults[col.id] = col.visible !== false;
    });
    return defaults;
  });

  useEffect(() => {
    if (controlledVisibleColumns) {
        setVisibleColumns(controlledVisibleColumns);
        return;
    }
    localStorage.setItem(`dt-cols-${tableId}`, JSON.stringify(visibleColumns));
  }, [tableId, visibleColumns, controlledVisibleColumns]);

  const toggleColumn = (columnId: string) => {
    setVisibleColumns(prev => ({
      ...prev,
      [columnId]: !prev[columnId],
    }));
  };

  const resetColumns = () => {
    const defaults: Record<string, boolean> = {};
    columns.forEach(col => {
      defaults[col.id] = col.visible !== false;
    });
    setVisibleColumns(defaults);
  };

  const filteredColumns = useMemo(() => {
    return columns.filter(col => visibleColumns[col.id] !== false);
  }, [columns, visibleColumns]);

  return { visibleColumns, toggleColumn, resetColumns, filteredColumns, setVisibleColumns };
};
