import Home from '@mui/icons-material/Home';
import Settings from '@mui/icons-material/Settings';
import Search from '@mui/icons-material/Search';
import Menu from '@mui/icons-material/Menu';
import Close from '@mui/icons-material/Close';
import Warning from '@mui/icons-material/Warning';
import Check from '@mui/icons-material/Check';
import Info from '@mui/icons-material/Info';
import ErrorIcon from '@mui/icons-material/Error';
import Person from '@mui/icons-material/Person';
import Lock from '@mui/icons-material/Lock';
import Mail from '@mui/icons-material/Mail';
import ShoppingCart from '@mui/icons-material/ShoppingCart';
import Delete from '@mui/icons-material/Delete';
import Edit from '@mui/icons-material/Edit';
import ChevronLeft from '@mui/icons-material/ChevronLeft';
import ChevronRight from '@mui/icons-material/ChevronRight';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Refresh from '@mui/icons-material/Refresh';

/**
 * Centralized Icon Registry (Module 8 - Step 8.20).
 *
 * Single source of truth mapping string aliases to Material UI SVG Icon components.
 * Enhances performance by referencing direct imports rather than the main package index.
 */
export const iconRegistry = {
  home: Home,
  settings: Settings,
  search: Search,
  menu: Menu,
  close: Close,
  warning: Warning,
  check: Check,
  info: Info,
  error: ErrorIcon,
  person: Person,
  lock: Lock,
  mail: Mail,
  cart: ShoppingCart,
  delete: Delete,
  edit: Edit,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  visibility: Visibility,
  visibilityOff: VisibilityOff,
  refresh: Refresh,
} as const;

/** Strongly typed union of all supported registry icon names. */
export type IconName = keyof typeof iconRegistry;
