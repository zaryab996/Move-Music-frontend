import {
  CircleIcon,
  WindmillIcon,
  TypographyIcon,
  ShadowIcon,
  PaletteIcon,
  KeyIcon,
  BugIcon,
  UserIcon,
  ListIcon,
  DashboardIcon,
  BrandChromeIcon,
  HelpIcon
} from 'vue-tabler-icons';

export interface menu {
  header?: string;
  title?: string;
  icon?: object;
  to?: string;
  divider?: boolean;
  chip?: string;
  chipColor?: string;
  chipVariant?: string;
  chipIcon?: string;
  children?: menu[];
  disabled?: boolean;
  type?: string;
  subCaption?: string;
}

const sidebarItem: menu[] = [
  {
    title: 'Dashboard',
    icon: DashboardIcon,
    to: '/dashboard'
  },

  {
    title: 'Releases',
    icon: ListIcon,
    to: '/releases'
  },
  {
    title: 'Artists',
    icon: UserIcon,
    to: '/artists'
  }
];

export default sidebarItem;
