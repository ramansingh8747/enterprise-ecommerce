import React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import type { SelectChangeEvent } from '@mui/material/Select';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import LastPageIcon from '@mui/icons-material/LastPage';
import type { ITablePaginationProps } from './DataTable.types';
import { paginationContainerSx, paginationControlsSx } from './DataTable.styles';

/**
 * Generates an array of page numbers and ellipsis tokens to render.
 */
function getPageNumbers(currentPage: number, totalPages: number): (number | string)[] {
  const pages: (number | string)[] = [];
  const maxPageNumbersToShow = 5;

  if (totalPages <= maxPageNumbersToShow) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    // Always include page 1
    pages.push(1);

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    if (start > 2) {
      pages.push('...');
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < totalPages - 1) {
      pages.push('...');
    }

    // Always include last page
    pages.push(totalPages);
  }

  return pages;
}

/**
 * TablePagination Component (Module 10 - Step 10.5).
 *
 * Renders the pagination footer bar under the DataTable.
 */
export const TablePagination: React.FC<ITablePaginationProps> = ({
  page,
  pageSize,
  totalPages,
  totalRecords,
  startRecord,
  endRecord,
  onPageChange,
  onPageSizeChange,
  pageSizes = [5, 10, 20, 50, 100],
}) => {
  const handlePageSizeChange = (event: SelectChangeEvent<number>) => {
    onPageSizeChange(Number(event.target.value));
  };

  const handlePageChange = (pageNum: number) => {
    onPageChange(pageNum);
  };

  const pages = getPageNumbers(page, totalPages);

  const isFirstDisabled = page === 1;
  const isLastDisabled = page === totalPages;

  return (
    <Box sx={paginationContainerSx} aria-label="Table pagination navigation">
      {/* Left aligned records status info */}
      <Box>
        <Typography variant="body2" color="text.secondary">
          Showing {startRecord}–{endRecord} of {totalRecords} records
        </Typography>
      </Box>

      {/* Right aligned control groups */}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        alignItems="center"
        spacing={3}
        sx={{ width: { xs: '100%', md: 'auto' } }}
      >
        {/* Page size Selector */}
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="body2" color="text.secondary">
            Rows per page:
          </Typography>
          <Select
            value={pageSize}
            onChange={handlePageSizeChange}
            variant="outlined"
            size="small"
            sx={{ minWidth: 70, height: 32, fontSize: '0.875rem' }}
            aria-label="Select rows per page"
          >
            {pageSizes.map((size: number) => (
              <MenuItem key={size} value={size}>
                {size}
              </MenuItem>
            ))}
          </Select>
        </Stack>

        {/* Navigation control arrows & page buttons */}
        <Box sx={paginationControlsSx}>
          {/* First Page */}
          <IconButton
            size="small"
            onClick={() => handlePageChange(1)}
            disabled={isFirstDisabled}
            aria-label="Go to first page"
          >
            <FirstPageIcon fontSize="small" />
          </IconButton>

          {/* Previous Page */}
          <IconButton
            size="small"
            onClick={() => handlePageChange(page - 1)}
            disabled={isFirstDisabled}
            aria-label="Go to previous page"
          >
            <NavigateBeforeIcon fontSize="small" />
          </IconButton>

          {/* Page numbers list */}
          <Stack direction="row" spacing={0.5} alignItems="center">
            {pages.map((p, idx) => {
              if (p === '...') {
                return (
                  <Typography
                    key={`ellipsis-${idx}`}
                    variant="body2"
                    color="text.secondary"
                    sx={{ px: 1, selectUser: 'none' }}
                  >
                    ...
                  </Typography>
                );
              }

              const pageNum = Number(p);
              const isActive = pageNum === page;

              return (
                <Button
                  key={`page-${pageNum}`}
                  size="small"
                  variant={isActive ? 'contained' : 'text'}
                  color={isActive ? 'primary' : 'inherit'}
                  onClick={() => handlePageChange(pageNum)}
                  sx={{
                    minWidth: 32,
                    height: 32,
                    p: 0,
                    borderRadius: 1,
                    fontSize: '0.875rem',
                    fontWeight: isActive ? 600 : 400,
                  }}
                  aria-label={`Go to page ${pageNum}`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {pageNum}
                </Button>
              );
            })}
          </Stack>

          {/* Next Page */}
          <IconButton
            size="small"
            onClick={() => handlePageChange(page + 1)}
            disabled={isLastDisabled}
            aria-label="Go to next page"
          >
            <NavigateNextIcon fontSize="small" />
          </IconButton>

          {/* Last Page */}
          <IconButton
            size="small"
            onClick={() => handlePageChange(totalPages)}
            disabled={isLastDisabled}
            aria-label="Go to last page"
          >
            <LastPageIcon fontSize="small" />
          </IconButton>
        </Box>
      </Stack>
    </Box>
  );
};
export default TablePagination;
