import { useState } from 'react';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import ViewListIcon from '@mui/icons-material/ViewList';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import type { ITableView } from './DataTable.types';

export const ViewsMenu = ({
  views,
  defaultViewName,
  onSave,
  onLoad,
  onDelete,
  onSetDefault,
  getCurrentView,
}: {
  views: Record<string, ITableView>;
  defaultViewName: string | null;
  onSave: (name: string) => void;
  onLoad: (view: ITableView) => void;
  onDelete: (name: string) => void;
  onSetDefault: (name: string | null) => void;
  getCurrentView: () => Omit<ITableView, 'name'>;
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [openSave, setOpenSave] = useState(false);
  const [viewName, setViewName] = useState('');

  const handleSave = () => {
    onSave(viewName);
    setOpenSave(false);
    setViewName('');
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} size="small" title="Views">
        <ViewListIcon />
      </IconButton>
      <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={() => setAnchorEl(null)}>
        <MenuItem sx={{ fontWeight: 'bold' }} disabled>Saved Views</MenuItem>
        <Divider />
        {Object.entries(views).map(([name, view]) => (
          <MenuItem key={name} onClick={() => { onLoad(view); setAnchorEl(null); }}>
             {name} {defaultViewName === name ? '(Default)' : ''}
             <Button size="small" onClick={(e) => { e.stopPropagation(); onDelete(name); }}>Delete</Button>
             <Button size="small" onClick={(e) => { e.stopPropagation(); onSetDefault(name); }}>Set Default</Button>
          </MenuItem>
        ))}
        <Divider />
        <MenuItem onClick={() => { setOpenSave(true); getCurrentView(); }}>Save Current View</MenuItem>
      </Menu>
      <Dialog open={openSave} onClose={() => setOpenSave(false)}>
        <DialogTitle>Save View</DialogTitle>
        <DialogContent>
            <TextField label="View Name" fullWidth value={viewName} onChange={(e) => setViewName(e.target.value)} />
        </DialogContent>
        <DialogActions>
            <Button onClick={() => setOpenSave(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
