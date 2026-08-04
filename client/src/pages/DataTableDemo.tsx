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
import type { IDataTableColumn, IBulkAction } from '@/shared/components/table/DataTable/DataTable.types';
import { formatCurrency } from '@/shared/helpers/formatter.helper';

/**
 * Product Data Contract interface definition.
 */
export interface IProduct {
  readonly id: string;
  readonly name: string;
  readonly sku: string;
  readonly price: number;
  readonly status: 'active' | 'draft' | 'out_of_stock';
  readonly stock: number;
  readonly createdAt: string;
}

// 18 Sample product records
const MOCK_PRODUCTS: readonly IProduct[] = Object.freeze([
  { id: 'PROD-001', name: 'iPhone 14 Pro Max', sku: 'APL-IPH14PM-256', price: 1199.0, status: 'active', stock: 45, createdAt: '2026-05-12' },
  { id: 'PROD-002', name: 'MacBook Pro 16" M2', sku: 'APL-MBP16M2-512', price: 2499.0, status: 'active', stock: 12, createdAt: '2026-06-20' },
  { id: 'PROD-003', name: 'Sony WH-1000XM5', sku: 'SNY-WH1000XM5-B', price: 348.0, status: 'active', stock: 85, createdAt: '2026-07-01' },
  { id: 'PROD-004', name: 'Dell XPS 15 Laptop', sku: 'DLL-XPS15-9530', price: 1899.0, status: 'draft', stock: 8, createdAt: '2026-04-18' },
  { id: 'PROD-005', name: 'iPad Pro 12.9" M2', sku: 'APL-IPP129M2-128', price: 1099.0, status: 'out_of_stock', stock: 0, createdAt: '2026-03-29' },
  { id: 'PROD-006', name: 'Nintendo Switch OLED', sku: 'NIN-SWOLED-WHT', price: 349.99, status: 'active', stock: 32, createdAt: '2026-05-25' },
  { id: 'PROD-007', name: 'Samsung Galaxy S23 Ultra', sku: 'SAM-GALS23U-512', price: 1199.99, status: 'active', stock: 24, createdAt: '2026-02-14' },
  { id: 'PROD-008', name: 'Bose QuietComfort Earbuds II', sku: 'BSE-QCEB2-SND', price: 299.0, status: 'draft', stock: 15, createdAt: '2026-07-10' },
  { id: 'PROD-009', name: 'Apple Watch Ultra', sku: 'APL-AWU-49', price: 799.0, status: 'active', stock: 9, createdAt: '2026-01-05' },
  { id: 'PROD-010', name: 'Sony PlayStation 5', sku: 'SNY-PS5-DISC', price: 499.99, status: 'out_of_stock', stock: 0, createdAt: '2026-03-10' },
  { id: 'PROD-011', name: 'Keychron Q1 Mechanical Keyboard', sku: 'KEY-Q1MKB-BLU', price: 169.0, status: 'active', stock: 55, createdAt: '2026-06-05' },
  { id: 'PROD-012', name: 'Logitech MX Master 3S', sku: 'LOG-MXM3S-GRY', price: 99.99, status: 'active', stock: 120, createdAt: '2026-06-15' },
  { id: 'PROD-013', name: 'Asus ROG Zephyrus G14', sku: 'ASU-ZEP-G14-9', price: 1599.0, status: 'draft', stock: 4, createdAt: '2026-07-22' },
  { id: 'PROD-014', name: 'GoPro HERO11 Black', sku: 'GPR-H11BLK-001', price: 399.0, status: 'active', stock: 28, createdAt: '2026-05-30' },
  { id: 'PROD-015', name: 'Canon EOS R5 Mirrorless', sku: 'CAN-EOSR5-BODY', price: 3899.0, status: 'active', stock: 3, createdAt: '2026-02-28' },
  { id: 'PROD-016', name: 'DJI Mini 3 Pro Drone', sku: 'DJI-MN3PRO-RC', price: 759.0, status: 'active', stock: 18, createdAt: '2026-06-12' },
  { id: 'PROD-017', name: 'Oculus Quest 2 VR Headset', sku: 'OCL-QST2-128', price: 299.99, status: 'draft', stock: 40, createdAt: '2026-04-10' },
  { id: 'PROD-018', name: 'Sonos One (Gen 2) Speaker', sku: 'SNS-ONEG2-WHT', price: 219.0, status: 'out_of_stock', stock: 0, createdAt: '2026-01-20' },
]);

/**
 * Enterprise DataTable Demonstration Page Component (Module 10 - Step 10.3).
 */
export const DataTableDemo: React.FC = () => {
  const [simulateLoading, setSimulateLoading] = useState(false);
  const [simulateEmpty, setSimulateEmpty] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

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

  const tableData = simulateEmpty ? [] : [...MOCK_PRODUCTS];

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
              Enterprise generic DataTable rendering demonstration showcasing column configurations, custom cell rendering, and status loaders.
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
        <Box>
          <DataTable
            data={tableData}
            columns={columns}
            rowKey={(row) => row.id}
            loading={simulateLoading}
            search
            filterable
            selection
            bulkActions={bulkActions}
            hover
            striped
            bordered
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
