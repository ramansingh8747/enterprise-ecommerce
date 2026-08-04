import type { ReactNode } from 'react';

/**
 * Alignment options for table cell content.
 */
export type TableCellAlign = 'left' | 'center' | 'right' | 'justify';

/**
 * Sort direction states.
 */
export type SortDirection = 'asc' | 'desc' | null;

/**
 * Sorting state parameters.
 */
export interface ISortState {
  readonly columnId: string | null;
  readonly direction: SortDirection;
}

/**
 * Pagination state parameters.
 */
export interface IPaginationState {
  readonly page: number;
  readonly pageSize: number;
  readonly totalPages: number;
  readonly totalRecords: number;
}

/**
 * Filter option structure for Select type filters.
 */
export interface IFilterOption {
  readonly label: string;
  readonly value: unknown;
}

/**
 * Generic Bulk Action Definition.
 *
 * Implemented with read-only properties to ensure immutability.
 */
export interface IBulkAction<TData> {
  readonly id: string;
  readonly label: string;
  readonly icon?: ReactNode | undefined;
  readonly disabled?: boolean | undefined;
  readonly action: (selectedIds: Set<string | number>, selectedRows: TData[]) => void;
}

/**
 * Generic Column Definition Interface for Data Table.
 *
 * Implemented with read-only properties to ensure immutability.
 */
export interface IDataTableColumn<TData> {
  /** Unique identifier for the column. */
  readonly id: string;
  /** Header label or component content. */
  readonly header: ReactNode;
  /** Field key from row data object, dot-path string, or resolver callback. */
  readonly accessor?: keyof TData | string | ((row: TData) => unknown) | undefined;
  /** Text/Content alignment inside cells. Defaults to 'left'. */
  readonly alignment?: TableCellAlign | undefined;
  /** Specific CSS width (e.g. '150px' or 150 or '10%'). */
  readonly width?: string | number | undefined;
  /** Specific minimum width. */
  readonly minWidth?: string | number | undefined;
  /** Specific maximum width. */
  readonly maxWidth?: string | number | undefined;
  /** Additional custom class names to apply to column cells. */
  readonly className?: string | undefined;
  /** Visibility toggle. Defaults to true. */
  readonly visible?: boolean | undefined;
  /** Read-only custom metadata for future capabilities (sorting, filtering, etc.). */
  readonly metadata?: Record<string, unknown> | undefined;
  /** Sorting capability flag. Defaults to false. */
  readonly sortable?: boolean | undefined;
  /** Optional custom comparator for custom field sorting. */
  readonly comparator?: ((a: TData, b: TData) => number) | undefined;
  /** Search filter inclusion toggle. Defaults to true. */
  readonly searchable?: boolean | undefined;
  /** Filter toggle. Defaults to false. */
  readonly filterable?: boolean | undefined;
  /** Specific filter input widget to display. */
  readonly filterType?: 'text' | 'select' | 'boolean' | 'number' | 'date' | undefined;
  /** Select choices array for 'select' column filters. */
  readonly filterOptions?: readonly IFilterOption[] | undefined;
  /** Custom filter comparator handler callback. */
  readonly customFilter?: ((row: TData, filterValue: unknown) => boolean) | undefined;
  /** Custom renderer function for header cell. */
  readonly headerRender?: (() => ReactNode) | undefined;
  /** Custom renderer function for row cell. */
  readonly render?: ((value: unknown, row: TData, index: number) => ReactNode) | undefined;
}

/**
 * Props interface for the main generic DataTable component.
 */
export interface IDataTableProps<TData> {
  /** Array of row data items. */
  readonly data: TData[];
  /** Column definitions config. */
  readonly columns: IDataTableColumn<TData>[];
  /** Function to extract a unique key from each row item. */
  readonly rowKey: (row: TData) => string | number;
  /** Standard loading indicator toggle. Defaults to false. */
  readonly loading?: boolean | undefined;
  /** Standard empty state message. Defaults to 'No records found.'. */
  readonly emptyMessage?: string | undefined;
  /** Dense styling spacing flag. Defaults to false. */
  readonly dense?: boolean | undefined;
  /** Hover highlight state on row cursor hover. Defaults to false. */
  readonly hover?: boolean | undefined;
  /** Alternate rows colored background flag. Defaults to false. */
  readonly striped?: boolean | undefined;
  /** Outlined cell borders flag. Defaults to false. */
  readonly bordered?: boolean | undefined;
  /** Custom empty state node to render when data list is empty. */
  readonly customEmptyState?: ReactNode | undefined;
  /** Custom loading spinner node to render while fetching. */
  readonly customLoadingState?: ReactNode | undefined;
  /** A label for table element representation. */
  readonly ariaLabel?: string | undefined;
  /** A description element id for the table element representation. */
  readonly ariaDescribedBy?: string | undefined;
  /** Controlled sort state. */
  readonly sortState?: ISortState | undefined;
  /** Controlled sort update callback. */
  readonly onSort?: ((columnId: string) => void) | undefined;
  /** Initial sort column ID path. */
  readonly initialSortColumnId?: string | undefined;
  /** Initial sort direction value. */
  readonly initialSortDirection?: SortDirection | undefined;
  /** Pagination footer flag. Defaults to true. */
  readonly pagination?: boolean | undefined;
  /** Controlled pagination state parameters. */
  readonly paginationState?: IPaginationState | undefined;
  /** Callback triggered when the page index changes. */
  readonly onPageChange?: ((page: number) => void) | undefined;
  /** Callback triggered when the page limit changes. */
  readonly onPageSizeChange?: ((pageSize: number) => void) | undefined;
  /** Initial startup page index (1-indexed). */
  readonly initialPage?: number | undefined;
  /** Initial startup page size limit. */
  readonly initialPageSize?: number | undefined;
  /** Global search input toggle. Defaults to false. */
  readonly search?: boolean | undefined;
  /** Custom search field placeholder label. */
  readonly searchPlaceholder?: string | undefined;
  /** Controlled search query string. */
  readonly searchQuery?: string | undefined;
  /** Callback triggered when the search query updates. */
  readonly onSearchQueryChange?: ((query: string) => void) | undefined;
  /** Initial startup search query parameter. */
  readonly initialSearchQuery?: string | undefined;
  /** Global filters bar toggle. Defaults to false. */
  readonly filterable?: boolean | undefined;
  /** Controlled filters dictionary state. */
  readonly filters?: Record<string, unknown> | undefined;
  /** Callback triggered when a column filter updates. */
  readonly onFilterChange?: ((columnId: string, value: unknown) => void) | undefined;
  /** Callback triggered when an individual filter is removed. */
  readonly onClearFilter?: ((columnId: string) => void) | undefined;
  /** Callback triggered when all filters are cleared. */
  readonly onClearAllFilters?: (() => void) | undefined;
  /** Initial startup filters mapping object. */
  readonly initialFilters?: Record<string, unknown> | undefined;
  /** Global checkbox row selection toggle. Defaults to false. */
  readonly selection?: boolean | undefined;
  /** Controlled selected row IDs Set object. */
  readonly selectedRowIds?: Set<string | number> | undefined;
  /** Callback triggered when the selected rows change. */
  readonly onRowSelectionChange?: ((selectedIds: Set<string | number>) => void) | undefined;
  /** Initial startup selected row IDs list. */
  readonly initialSelectedRowIds?: readonly (string | number)[] | undefined;
  /** Configurable bulk actions dropdown trigger configurations. */
  readonly bulkActions?: readonly IBulkAction<TData>[] | undefined;
}

/**
 * Props for the TableHeader component.
 */
export interface ITableHeaderProps<TData> {
  readonly columns: IDataTableColumn<TData>[];
  readonly bordered?: boolean | undefined;
  /** Current active sort state. */
  readonly sortState?: ISortState | undefined;
  /** Trigger callback when a sortable column header is clicked. */
  readonly onSort?: ((columnId: string) => void) | undefined;
  /** Checkbox row selection flag. */
  readonly selection?: boolean | undefined;
  /** Active selected row IDs Set map. */
  readonly selectedRowIds?: Set<string | number> | undefined;
  /** Callback triggered when the master header checkbox is clicked. */
  readonly onSelectAll?: ((checked: boolean) => void) | undefined;
  /** Currently visible paginated data rows. */
  readonly visibleRows?: TData[] | undefined;
  /** Function to extract unique row key. */
  readonly rowKey?: ((row: TData) => string | number) | undefined;
}

/**
 * Props for the TableBody component.
 */
export interface ITableBodyProps<TData> {
  readonly data: TData[];
  readonly columns: IDataTableColumn<TData>[];
  readonly rowKey: (row: TData) => string | number;
  readonly hover?: boolean | undefined;
  readonly striped?: boolean | undefined;
  readonly bordered?: boolean | undefined;
  readonly emptyMessage?: string | undefined;
  readonly loading?: boolean | undefined;
  readonly customEmptyState?: ReactNode | undefined;
  readonly customLoadingState?: ReactNode | undefined;
  /** Checkbox row selection flag. */
  readonly selection?: boolean | undefined;
  /** Active selected row IDs Set map. */
  readonly selectedRowIds?: Set<string | number> | undefined;
  /** Callback triggered when an individual row checkbox is clicked. */
  readonly onSelectRow?: ((id: string | number, checked: boolean) => void) | undefined;
}

/**
 * Props for the TablePagination component.
 */
export interface ITablePaginationProps {
  readonly page: number;
  readonly pageSize: number;
  readonly totalPages: number;
  readonly totalRecords: number;
  readonly startRecord: number;
  readonly endRecord: number;
  readonly onPageChange: (page: number) => void;
  readonly onPageSizeChange: (pageSize: number) => void;
  readonly pageSizes?: readonly number[] | undefined;
}

/**
 * Props for the TableFilters component.
 */
export interface ITableFiltersProps<TData> {
  readonly columns: IDataTableColumn<TData>[];
  readonly filters: Record<string, unknown>;
  readonly onFilterChange: (columnId: string, value: unknown) => void;
  readonly onClearFilter: (columnId: string) => void;
  readonly onClearAll: () => void;
}

/**
 * Props for the TableRow component.
 */
export interface ITableRowProps<TData> {
  readonly row: TData;
  readonly columns: IDataTableColumn<TData>[];
  readonly rowIndex: number;
  readonly hover?: boolean | undefined;
  readonly striped?: boolean | undefined;
  readonly bordered?: boolean | undefined;
  /** Checkbox row selection flag. */
  readonly selection?: boolean | undefined;
  /** Active selected row IDs Set map. */
  readonly selectedRowIds?: Set<string | number> | undefined;
  /** Callback triggered when an individual row checkbox is clicked. */
  readonly onSelectRow?: ((id: string | number, checked: boolean) => void) | undefined;
  /** Function to extract unique row key. */
  readonly rowKey: (row: TData) => string | number;
}

/**
 * Props for the TableCell component.
 */
export interface ITableCellProps<TData> {
  readonly row: TData;
  readonly column: IDataTableColumn<TData>;
  readonly rowIndex: number;
  readonly bordered?: boolean | undefined;
}

/**
 * Props for the EmptyState component.
 */
export interface IEmptyStateProps {
  readonly message: string;
  readonly colSpan: number;
}

/**
 * Props for the LoadingState component.
 */
export interface ILoadingStateProps {
  readonly colSpan: number;
  readonly message?: string | undefined;
}
