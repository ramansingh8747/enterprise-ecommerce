/**
 * Enterprise Table Component Types (Module 8 - Step 8.12).
 *
 * All types are fully generic over TRow so that column field access and
 * render callbacks are end-to-end strongly typed without any.
 */

/** Horizontal alignment of a table cell. */
export type TableCellAlign = 'left' | 'center' | 'right';

/**
 * Definition for a single table column.
 * TRow is the shape of each row data object.
 */
export interface ITableColumn<TRow extends Record<string, unknown>> {
  /** Unique identifier for this column (used as React key). */
  readonly id: string;
  /** Key of TRow whose value this column displays. Omit for action/computed columns. */
  readonly field?: keyof TRow;
  /** Content rendered in the column header cell. */
  readonly header: React.ReactNode;
  /** Fixed pixel or percentage width. */
  readonly width?: number | string;
  /** Minimum pixel width — respected by stickyHeader layout. */
  readonly minWidth?: number;
  /** Cell content alignment. Defaults to 'left'. */
  readonly align?: TableCellAlign;
  /** Reserved for future sort integration — marks the column as sortable. */
  readonly sortable?: boolean;
  /** When true, the column is omitted from rendering. */
  readonly hidden?: boolean;
  /**
   * Custom cell renderer. Receives the resolved field value and the full row.
   * When omitted, the raw field value is rendered as a string.
   */
  readonly render?: (
    value: TRow[keyof TRow] | undefined,
    row: TRow,
    index: number
  ) => React.ReactNode;
  /** Custom header cell renderer. Overrides the header string when provided. */
  readonly headerRender?: () => React.ReactNode;
}

export interface ITableProps<TRow extends Record<string, unknown>> {
  /** Typed array of row data objects. */
  rows: ReadonlyArray<TRow>;
  /** Column definitions that drive header and cell rendering. */
  columns: ReadonlyArray<ITableColumn<TRow>>;
  /** Derives a stable React key from each row. */
  rowKey: (row: TRow) => string | number;
  /** When true, renders a loading overlay above the table body. */
  loading?: boolean;
  /** Message displayed when rows is empty and loading is false. */
  emptyMessage?: string;
  /** When true, the header row sticks to the top of the scroll container. */
  stickyHeader?: boolean;
  /** When true, renders a leading Checkbox column for row selection. */
  selectable?: boolean;
  /** Currently selected row keys (controlled). */
  selectedRows?: ReadonlyArray<string | number>;
  /** When true, reduces row height. */
  dense?: boolean;
  /** When true, applies hover background to rows. */
  hover?: boolean;
  /** When true, alternates row background colours. */
  striped?: boolean;
  /** When true, renders visible borders on all cells. */
  bordered?: boolean;
  /** CSS max-height applied to the TableContainer. */
  maxHeight?: number | string;
  /** Fired when a data row is clicked. */
  onRowClick?: (row: TRow, index: number) => void;
  /** Fired when the selection set changes. Receives the new selection array. */
  onSelectionChange?: (selectedKeys: ReadonlyArray<string | number>) => void;
}
