import { useState, useEffect } from 'react';
import type { ITableView } from './DataTable.types';

/**
 * Hook to manage saved views persistence.
 */
export const useTableViews = (tableId: string) => {
  const [views, setViews] = useState<Record<string, ITableView>>(() => {
    const saved = localStorage.getItem(`dt-views-${tableId}`);
    return saved ? JSON.parse(saved) : {};
  });

  const [defaultViewName, setDefaultViewName] = useState<string | null>(() => {
    return localStorage.getItem(`dt-default-view-${tableId}`);
  });

  useEffect(() => {
    localStorage.setItem(`dt-views-${tableId}`, JSON.stringify(views));
  }, [tableId, views]);

  useEffect(() => {
    if (defaultViewName) {
      localStorage.setItem(`dt-default-view-${tableId}`, defaultViewName);
    } else {
      localStorage.removeItem(`dt-default-view-${tableId}`);
    }
  }, [tableId, defaultViewName]);

  const saveView = (view: ITableView) => {
    setViews(prev => ({ ...prev, [view.name]: view }));
  };

  const deleteView = (name: string) => {
    setViews(prev => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
    if (defaultViewName === name) setDefaultViewName(null);
  };

  const setDefault = (name: string | null) => {
    setDefaultViewName(name);
  };

  return { views, defaultViewName, saveView, deleteView, setDefault };
};
