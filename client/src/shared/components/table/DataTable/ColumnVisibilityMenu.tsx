import { useState } from 'react';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import type { IDataTableColumn } from './DataTable.types';

export const ColumnVisibilityMenu = <TData,>({
  columns,
  visibleColumns,
  onToggle,
  onReset,
}: {
  columns: IDataTableColumn<TData>[];
  visibleColumns: Record<string, boolean>;
  onToggle: (id: string) => void;
  onReset: () => void;
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  return (
    <>
      <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} size="small">
        <ViewColumnIcon />
      </IconButton>
      <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={() => setAnchorEl(null)}>
        <MenuItem sx={{ fontWeight: 'bold' }} disabled>Column Visibility</MenuItem>
        <Divider />
        {columns.map((col) => (
          <MenuItem key={col.id} onClick={(e) => { e.stopPropagation(); onToggle(col.id); }}>
            <FormControlLabel
              control={<Checkbox checked={visibleColumns[col.id] !== false} size="small" />}
              label={typeof col.header === 'string' ? col.header : col.id}
            />
          </MenuItem>
        ))}
        <Divider />
        <MenuItem>
          <Button fullWidth onClick={onReset} size="small">Reset to Default</Button>
        </MenuItem>
      </Menu>
    </>
  );
};
