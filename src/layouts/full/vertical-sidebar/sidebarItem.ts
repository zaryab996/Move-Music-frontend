import {
  CircleIcon,
  WindmillIcon,
  TagIcon,
  TypographyIcon,
  ShadowIcon,
  PaletteIcon,
  KeyIcon,
  BugIcon,
  UserIcon,
  ListIcon,
  DashboardIcon,
  BrandChromeIcon,
  HelpIcon,
  FileTextIcon,
  PackageIcon
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
  // {
  //   title: 'Dashboard',
  //   icon: DashboardIcon,
  //   to: '/dashboard'
  // },

  {
    title: 'Releases',
    icon: ListIcon,
    to: '/releases'
  },
  {
    title: 'Artists',
    icon: UserIcon,
    to: '/artists'
  },
  {
    title: 'Labels',
    icon: TagIcon,
    to: '/labels'
  },
  {
    title: 'Delivered List',
    icon: PackageIcon,
    to: '/delivered'
  },
  {
    title: 'Statements',
    icon: FileTextIcon,
    to: '/statements'
  }
];

export default sidebarItem;
