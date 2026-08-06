import React, { useState } from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Snackbar from '@mui/material/Snackbar';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BlockIcon from '@mui/icons-material/Block';
import { Link } from 'react-router-dom';
import { DataTable } from '@/shared/components/table/DataTable/DataTable';
import type { IDataTableColumn, IBulkAction, ITableView } from '@/shared/components/table/DataTable/DataTable.types';
import { useTableViews } from '@/shared/components/table/DataTable/useTableViews';
import { formatCurrency } from '@/shared/helpers/formatter.helper';
import { useProductTable } from '@/features/products/hooks/useProductTable';
import type { IProduct } from '@/features/products/types/products.types';

/**
 * Enterprise DataTable Demonstration Page Component (Module 10 - Step 10.10).
 */
export const DataTableDemo: React.FC = () => {
  const {
    data: products,
    loading,
    paginationState,
    onPageChange,
    onPageSizeChange,
    searchQuery,
    onSearchQueryChange,
    filters,
    onFilterChange,
    sortState,
    setSort,
    visibleColumns,
    setVisibleColumns,
  } = useProductTable();

  const { views, defaultViewName, saveView, deleteView, setDefault } = useTableViews('products-table');
  const [simulateLoading, setSimulateLoading] = useState(false);
  const [simulateEmpty, setSimulateEmpty] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const onLoadView = (view: ITableView) => {
    onSearchQueryChange(view.searchQuery);
    Object.entries(view.filters).forEach(([key, val]) => onFilterChange(key, val));
    setSort?.(view.sortState);
    onPageSizeChange(view.pageSize);
    setVisibleColumns?.(view.visibleColumns);
  };

  // Configurable demonstration bulk actions configuration
  const bulkActions: IBulkAction<IProduct>[] = [
    {
      id: 'delete',
      label: 'Delete Selected',
      icon: <DeleteIcon fontSize="small" color="error" />,
      action: (ids, rows) => {
        setToastMsg(`[Mock Trigger] Deleted ${ids.size} items: ${rows.map((r) => r.name).join(', ')}`);
      },
    },
    {
      id: 'export',
      label: 'Export Selected',
      icon: <DownloadIcon fontSize="small" color="primary" />,
      action: (ids) => {
        setToastMsg(`[Mock Trigger] Exported ${ids.size} item(s) details to CSV format.`);
      },
    },
    {
      id: 'mark-active',
      label: 'Mark as Active',
      icon: <CheckCircleIcon fontSize="small" color="success" />,
      action: (ids) => {
        setToastMsg(`[Mock Trigger] Updated status to Active for ${ids.size} item(s).`);
      },
    },
    {
      id: 'mark-inactive',
      label: 'Mark as Inactive',
      icon: <BlockIcon fontSize="small" color="warning" />,
      action: (ids) => {
        setToastMsg(`[Mock Trigger] Updated status to Inactive for ${ids.size} item(s).`);
      },
    },
  ];

  // Column Configuration definitions utilizing custom cells and accessors
  const columns: IDataTableColumn<IProduct>[] = [
    {
      id: 'id',
      header: 'ID',
      accessor: 'id',
      width: '12%',
      alignment: 'center',
      sortable: true,
      searchable: false,
      filterable: false,
    },
    {
      id: 'name',
      header: 'Product Name',
      accessor: 'name',
      width: '30%',
      sortable: true,
      filterable: true,
      filterType: 'text',
    },
    {
      id: 'sku',
      header: 'SKU',
      accessor: 'sku',
      width: '20%',
      sortable: true,
      filterable: true,
      filterType: 'text',
    },
    {
      id: 'price',
      header: 'Price',
      accessor: 'price',
      width: '12%',
      alignment: 'right',
      sortable: true,
      filterable: true,
      filterType: 'number',
      render: (val) => {
        const amount = typeof val === 'number' ? val : 0;
        return (
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {formatCurrency(amount)}
          </Typography>
        );
      },
    },
    {
      id: 'status',
      header: 'Status',
      accessor: 'status',
      width: '14%',
      alignment: 'center',
      sortable: true,
      filterable: true,
      filterType: 'select',
      filterOptions: [
        { label: 'Active', value: 'active' },
        { label: 'Draft', value: 'draft' },
        { label: 'Out of Stock', value: 'out_of_stock' },
      ],
      render: (val) => {
        const statusStr = String(val);
        let chipColor: 'success' | 'default' | 'error' = 'default';
        let label = 'Draft';

        if (statusStr === 'active') {
          chipColor = 'success';
          label = 'Active';
        } else if (statusStr === 'out_of_stock') {
          chipColor = 'error';
          label = 'Out of Stock';
        }

        return <Chip label={label} color={chipColor} size="small" variant="outlined" />;
      },
    },
    {
      id: 'stock',
      header: 'Stock',
      accessor: 'stock',
      width: '12%',
      alignment: 'right',
      sortable: true,
      filterable: true,
      filterType: 'number',
      render: (val) => {
        const count = typeof val === 'number' ? val : 0;
        const color = count === 0 ? 'error.main' : count < 10 ? 'warning.main' : 'text.primary';
        return (
          <Typography variant="body2" color={color} sx={{ fontWeight: 500 }}>
            {count}
          </Typography>
        );
      },
    },
    {
      id: 'createdAt',
      header: 'Created Date',
      accessor: 'createdAt',
      width: '15%',
      alignment: 'center',
      sortable: true,
      searchable: false,
      filterable: true,
      filterType: 'date',
      render: (val) => {
        const dateStr = String(val);
        // Safely formats YYYY-MM-DD
        return (
          <Typography variant="body2" color="text.secondary">
            {dateStr}
          </Typography>
        );
      },
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Stack spacing={4}>
        {/* Page Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Button
              startIcon={<KeyboardBackspaceIcon />}
              component={Link}
              to="/"
              sx={{ mb: 2 }}
              color="inherit"
            >
              Back to Home
            </Button>
            <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
              Data Table Demo
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Enterprise generic DataTable rendering demonstration showcasing column configurations, custom cell rendering, and real API data fetching.
            </Typography>
          </Box>
        </Stack>

        {/* Verification Control Panel Card */}
        <Card variant="outlined">
          <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
            <Stack direction="row" spacing={4} alignItems="center">
              <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                Verification Controls:
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={simulateLoading}
                    onChange={(e) => setSimulateLoading(e.target.checked)}
                    color="primary"
                  />
                }
                label="Simulate Loading State"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={simulateEmpty}
                    onChange={(e) => setSimulateEmpty(e.target.checked)}
                    color="primary"
                  />
                }
                label="Simulate Empty State"
              />
            </Stack>
          </CardContent>
        </Card>

        {/* Data Table */}
        <Box sx={{ display: 'flex', flexDirection: 'column', height: 'auto', flex: 1 }}>
          <DataTable
            data={simulateEmpty ? [] : products}
            columns={columns}
            rowKey={(row) => row.id}
            loading={simulateLoading || loading}
            pagination
            paginationState={paginationState}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
            search
            searchQuery={searchQuery}
            onSearchQueryChange={onSearchQueryChange}
            filterable
            filters={filters}
            onFilterChange={onFilterChange}
            sortState={sortState}
            onSort={(id) => setSort?.({ columnId: id, direction: sortState?.direction === 'asc' ? 'desc' : 'asc' })}
            selection
            bulkActions={bulkActions}
            hover
            striped
            bordered
            views={views}
            defaultViewName={defaultViewName}
            onSaveView={saveView}
            onDeleteView={deleteView}
            onSetDefaultView={setDefault}
            onLoadView={onLoadView}
            visibleColumns={visibleColumns}
            onVisibleColumnsChange={setVisibleColumns}
          />
        </Box>
      </Stack>

      {/* Snackbar feedback loop for verification mock actions */}
      <Snackbar
        open={!!toastMsg}
        autoHideDuration={4000}
        onClose={() => setToastMsg(null)}
        message={toastMsg}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Container>
  );
};

export default DataTableDemo;
export { DataTableDemo as Page };
