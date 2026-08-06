import React, { useEffect, useMemo } from 'react';
import Box from '@mui/material/Box';
import MuiTable from '@mui/material/Table';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import type { IDataTableProps, ITableView } from './DataTable.types';
import { TableHeader } from './TableHeader';
import { TableBody } from './TableBody';
import { TablePagination } from './TablePagination';
import { TableFilters } from './TableFilters';
import { BulkActionsToolbar } from './BulkActionsToolbar';
import { ColumnVisibilityMenu } from './ColumnVisibilityMenu';
import { ViewsMenu } from './ViewsMenu';
import { useColumnVisibility } from './useColumnVisibility';
import { tableContainerSx, tableSx } from './DataTable.styles';
import { useDataTableFilters } from './useDataTableFilters';
import { useDataTableSearch } from './useDataTableSearch';
import { useDataTableSorting } from './useDataTableSorting';
import { useDataTablePagination } from './useDataTablePagination';
import { useDataTableSelection } from './useDataTableSelection';

/**
 * Enterprise DataTable Component (Module 10 - Step 10.9).
 */
export const DataTable = <TData,>(props: IDataTableProps<TData>): React.ReactElement => {
  const {
    data,
    columns,
    rowKey,
    loading = false,
    emptyMessage = 'No records found.',
    dense = false,
    hover = false,
    striped = false,
    bordered = false,
    customEmptyState,
    customLoadingState,
    ariaLabel = 'Data Table',
    ariaDescribedBy,
    sortState,
    onSort,
    initialSortColumnId,
    initialSortDirection,
    pagination = true,
    paginationState,
    onPageChange,
    onPageSizeChange,
    initialPage,
    initialPageSize,
    search = false,
    searchPlaceholder,
    searchQuery,
    onSearchQueryChange,
    initialSearchQuery,
    filterable = false,
    filters,
    onFilterChange,
    onClearFilter,
    onClearAllFilters,
    initialFilters,
    selection = false,
    selectedRowIds,
    onRowSelectionChange,
    initialSelectedRowIds,
    bulkActions,
    views = {},
    defaultViewName,
    onSaveView,
    onDeleteView,
    onSetDefaultView,
    onLoadView,
    visibleColumns: controlledVisibleColumns,
    onVisibleColumnsChange,
  } = props;
  const { visibleColumns, toggleColumn, resetColumns, filteredColumns, setVisibleColumns } = useColumnVisibility(ariaLabel, columns, controlledVisibleColumns);

  useEffect(() => {
    if (onVisibleColumnsChange && visibleColumns !== controlledVisibleColumns) {
        onVisibleColumnsChange(visibleColumns);
    }
  }, [visibleColumns, controlledVisibleColumns, onVisibleColumnsChange]);

  const getCurrentViewData = (): Omit<ITableView, 'name'> => ({
    visibleColumns,
    searchQuery: searchQuery ?? '',
    filters: filters ?? {},
    sortState: sortState ?? { columnId: null, direction: null },
    pageSize: paginationState?.pageSize ?? 10,
  });

  // 1. Call client-side selection hook
  const localSelection = useDataTableSelection({
    data,
    rowKey,
    initialSelectedRowIds,
  });

  const isSelectable = selection === true;
  const activeSelectedRowIds =
    selectedRowIds !== undefined ? selectedRowIds : localSelection.selectedRowIds;
  const activeOnRowSelectionChange = onRowSelectionChange;

  const handleSelectRow = (id: string | number, checked: boolean) => {
    if (checked) {
      localSelection.selectRow(id);
      if (activeOnRowSelectionChange) {
        const next = new Set(activeSelectedRowIds);
        next.add(id);
        activeOnRowSelectionChange(next);
      }
    } else {
      localSelection.deselectRow(id);
      if (activeOnRowSelectionChange) {
        const next = new Set(activeSelectedRowIds);
        next.delete(id);
        activeOnRowSelectionChange(next);
      }
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      localSelection.selectAllRows(paginatedData);
      if (activeOnRowSelectionChange) {
        const next = new Set(activeSelectedRowIds);
        for (const row of paginatedData) {
          next.add(rowKey(row));
        }
        activeOnRowSelectionChange(next);
      }
    } else {
      localSelection.deselectAllRows(paginatedData);
      if (activeOnRowSelectionChange) {
        const next = new Set(activeSelectedRowIds);
        for (const row of paginatedData) {
          next.delete(rowKey(row));
        }
        activeOnRowSelectionChange(next);
      }
    }
  };

  const handleClearSelection = () => {
    localSelection.clearSelection();
    if (activeOnRowSelectionChange) {
      activeOnRowSelectionChange(new Set());
    }
  };

  // Derive active selected row data (filtering data using active IDs Set)
  const activeSelectedRowData =
    selectedRowIds !== undefined
      ? data.filter((row) => selectedRowIds.has(rowKey(row)))
      : localSelection.selectedRowData;

  // 2. Call client-side filtering hook
  const localFilters = useDataTableFilters(data, filteredColumns, initialFilters);

  const activeFilters = filters !== undefined ? filters : localFilters.filters;
  const activeFilterChange =
    onFilterChange !== undefined ? onFilterChange : localFilters.setFilter;
  const activeClearFilter = onClearFilter !== undefined ? onClearFilter : localFilters.clearFilter;
  const activeClearAll =
    onClearAllFilters !== undefined ? onClearAllFilters : localFilters.clearAllFilters;
  const activeFilterData = filters !== undefined ? data : localFilters.filteredData;

  // 3. Call client-side search hook (consumes filter-filtered data)
  const localSearch = useDataTableSearch(activeFilterData, filteredColumns, initialSearchQuery ?? '');

  const activeSearchQuery = searchQuery !== undefined ? searchQuery : localSearch.searchQuery;
  const activeSetSearchQuery =
    onSearchQueryChange !== undefined ? onSearchQueryChange : localSearch.setSearchQuery;
  const activeSearchData = searchQuery !== undefined ? activeFilterData : localSearch.filteredData;

  // 4. Call client-side sorting hook (consumes search + filter-filtered data)
  const localSorting = useDataTableSorting(activeSearchData, filteredColumns, {
    columnId: initialSortColumnId ?? null,
    direction: initialSortDirection ?? null,
  });

  const activeSortState = sortState !== undefined ? sortState : localSorting.sortState;
  const activeHandleSort = onSort !== undefined ? onSort : localSorting.handleSort;
  const activeSortedData = sortState !== undefined ? activeSearchData : localSorting.sortedData;

  // 5. Call client-side pagination hook (consumes search + filter-filtered + sorted data)
  const localPagination = useDataTablePagination({
    totalRecords: activeSortedData.length,
    initialPage: initialPage ?? 1,
    initialPageSize: initialPageSize ?? 10,
  });

  const isPaginated = pagination === true;
  const activePage = paginationState !== undefined ? paginationState.page : localPagination.page;
  const activePageSize =
    paginationState !== undefined ? paginationState.pageSize : localPagination.pageSize;
  const activeTotalPages =
    paginationState !== undefined ? paginationState.totalPages : localPagination.totalPages;
  const activeTotalRecords =
    paginationState !== undefined ? paginationState.totalRecords : activeSortedData.length;

  const activeOnPageChange = (page: number) => {
    console.log("DataTable onPageChange:", page);
    if (onPageChange !== undefined) {
      onPageChange(page);
    } else {
      localPagination.handlePageChange(page);
    }
  };
  const activeOnPageSizeChange =
    onPageSizeChange !== undefined ? onPageSizeChange : localPagination.handlePageSizeChange;

  const startRecord =
    paginationState !== undefined
      ? activeTotalRecords === 0
        ? 0
        : (activePage - 1) * activePageSize + 1
      : localPagination.startRecord;
  const endRecord =
    paginationState !== undefined
      ? Math.min(activePage * activePageSize, activeTotalRecords)
      : localPagination.endRecord;

  const { handlePageChange } = localPagination;
  const serializedFilters = useMemo(() => JSON.stringify(activeFilters), [activeFilters]);

  // Reset page selection to index 1 automatically whenever search or filter parameters change
  const onPageChangeRef = React.useRef(onPageChange);
  const handlePageChangeRef = React.useRef(handlePageChange);

  useEffect(() => {
    onPageChangeRef.current = onPageChange;
    handlePageChangeRef.current = handlePageChange;
  });

  useEffect(() => {
    if (onPageChangeRef.current) {
      onPageChangeRef.current(1);
    } else {
      handlePageChangeRef.current(1);
    }
  }, [activeSearchQuery, serializedFilters]);

  // Slice data for pagination ONLY if pagination is client-side (uncontrolled)
  const paginatedData =
    isPaginated && paginationState === undefined
      ? activeSortedData.slice((activePage - 1) * activePageSize, activePage * activePageSize)
      : activeSortedData;

  // Render search/filter-active customized empty message
  const isSearchActive = activeSearchQuery.trim() !== '';
  const isFilterActive = Object.values(activeFilters).some((val) => val !== '' && val !== undefined);
  const displayEmptyMessage =
    isSearchActive || isFilterActive ? 'No matching records found.' : emptyMessage;

  return (
    <Box sx={{ width: '100%' }}>
      {/* Filters Toolbar panel */}
      {filterable && (
        <TableFilters
          columns={filteredColumns}
          filters={activeFilters}
          onFilterChange={activeFilterChange}
          onClearFilter={activeClearFilter}
          onClearAll={activeClearAll}
        />
      )}

      {/* Top Search Toolbar panel */}
      {search && (
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <OutlinedInput
            value={activeSearchQuery}
            onChange={(e) => activeSetSearchQuery(e.target.value)}
            placeholder={searchPlaceholder ?? 'Search...'}
            size="small"
            fullWidth
            startAdornment={
              <InputAdornment position="start">
                <SearchIcon color="action" fontSize="small" />
              </InputAdornment>
            }
            endAdornment={
              activeSearchQuery ? (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => activeSetSearchQuery('')}
                    edge="end"
                    aria-label="Clear search"
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : null
            }
            sx={{
              backgroundColor: 'background.paper',
              maxWidth: { xs: '100%', sm: 360 },
            }}
          />
          <Box display="flex">
            <ColumnVisibilityMenu columns={columns} visibleColumns={visibleColumns} onToggle={toggleColumn} onReset={resetColumns} />
            <ViewsMenu 
                views={views}
                defaultViewName={defaultViewName ?? null}
                onSave={(name: string) => onSaveView?.({ name, ...getCurrentViewData() })}
                onLoad={(view: ITableView) => {
                    setVisibleColumns(view.visibleColumns);
                    onLoadView?.(view);
                }}
                onDelete={onDeleteView || (() => {})}
                onSetDefault={onSetDefaultView || (() => {})}
                getCurrentView={getCurrentViewData}
            />
          </Box>
        </Box>
      )}

      {/* Bulk Actions Toolbar (incorporates Selection Summary counters) */}
      {isSelectable && activeSelectedRowIds.size > 0 && (
        <BulkActionsToolbar
          selectedRowIds={activeSelectedRowIds}
          selectedRowData={activeSelectedRowData}
          actions={bulkActions ?? []}
          onClearSelection={handleClearSelection}
        />
      )}

      {/* Main Table Container wrapper */}
      <Box sx={tableContainerSx}>
        <Box sx={{ overflowX: 'auto', width: '100%', flex: 1 }}>
          <MuiTable
            size={dense ? 'small' : 'medium'}
            aria-label={ariaLabel}
            aria-describedby={ariaDescribedBy}
            aria-busy={loading}
            sx={tableSx}
          >
            <TableHeader
              columns={filteredColumns}
              bordered={bordered}
              sortState={activeSortState}
              onSort={activeHandleSort}
              selection={isSelectable}
              selectedRowIds={activeSelectedRowIds}
              onSelectAll={handleSelectAll}
              visibleRows={paginatedData}
              rowKey={rowKey}
            />
            <TableBody
              data={paginatedData}
              columns={filteredColumns}
              rowKey={rowKey}
              hover={hover}
              striped={striped}
              bordered={bordered}
              emptyMessage={displayEmptyMessage}
              loading={loading}
              customEmptyState={customEmptyState}
              customLoadingState={customLoadingState}
              selection={isSelectable}
              selectedRowIds={activeSelectedRowIds}
              onSelectRow={handleSelectRow}
            />
          </MuiTable>
        </Box>

        {/* Render pagination footer bar if enabled and rows exist (or loading) */}
        {isPaginated && (activeTotalRecords > 0 || loading) && (
          <TablePagination
            page={activePage}
            pageSize={activePageSize}
            totalPages={activeTotalPages}
            totalRecords={activeTotalRecords}
            startRecord={startRecord}
            endRecord={endRecord}
            onPageChange={activeOnPageChange}
            onPageSizeChange={activeOnPageSizeChange}
          />
        )}
      </Box>
    </Box>
  );
};

// Set generic display name for generic component configurations
(DataTable as { displayName?: string }).displayName = 'DataTable';
export default DataTable;
