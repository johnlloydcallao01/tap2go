// React 19 compatibility types
import { ReactNode } from 'react';

declare module 'react' {
  interface ReactElement {
    children?: ReactNode;
  }
}

// Heroicons compatibility
declare module '@heroicons/react/24/outline' {
  import { ComponentType, SVGProps } from 'react';
  
  export const BellIcon: ComponentType<SVGProps<SVGSVGElement>>;
  export const CheckCircleIcon: ComponentType<SVGProps<SVGSVGElement>>;
  export const XCircleIcon: ComponentType<SVGProps<SVGSVGElement>>;
  export const ClockIcon: ComponentType<SVGProps<SVGSVGElement>>;
  export const TruckIcon: ComponentType<SVGProps<SVGSVGElement>>;
  export const UserIcon: ComponentType<SVGProps<SVGSVGElement>>;
  export const HomeIcon: ComponentType<SVGProps<SVGSVGElement>>;
  export const ShoppingCartIcon: ComponentType<SVGProps<SVGSVGElement>>;
  export const HeartIcon: ComponentType<SVGProps<SVGSVGElement>>;
  export const MagnifyingGlassIcon: ComponentType<SVGProps<SVGSVGElement>>;
  export const Bars3Icon: ComponentType<SVGProps<SVGSVGElement>>;
  export const XMarkIcon: ComponentType<SVGProps<SVGSVGElement>>;
  export const MapPinIcon: ComponentType<SVGProps<SVGSVGElement>>;
  export const StarIcon: ComponentType<SVGProps<SVGSVGElement>>;
  export const PlusIcon: ComponentType<SVGProps<SVGSVGElement>>;
  export const MinusIcon: ComponentType<SVGProps<SVGSVGElement>>;
  export const TrashIcon: ComponentType<SVGProps<SVGSVGElement>>;
  export const PencilIcon: ComponentType<SVGProps<SVGSVGElement>>;
  export const EyeIcon: ComponentType<SVGProps<SVGSVGElement>>;
  export const EyeSlashIcon: ComponentType<SVGProps<SVGSVGElement>>;
  export const ArrowLeftIcon: ComponentType<SVGProps<SVGSVGElement>>;
  export const ArrowRightIcon: ComponentType<SVGProps<SVGSVGElement>>;
  export const ChevronDownIcon: ComponentType<SVGProps<SVGSVGElement>>;
  export const ChevronUpIcon: ComponentType<SVGProps<SVGSVGElement>>;
  export const ChevronLeftIcon: ComponentType<SVGProps<SVGSVGElement>>;
  export const ChevronRightIcon: ComponentType<SVGProps<SVGSVGElement>>;
  export const CogIcon: ComponentType<SVGProps<SVGSVGElement>>;
  export const DocumentIcon: ComponentType<SVGProps<SVGSVGElement>>;
  export const FolderIcon: ComponentType<SVGProps<SVGSVGElement>>;
  export const PhotoIcon: ComponentType<SVGProps<SVGSVGElement>>;
  export const VideoCameraIcon: ComponentType<SVGProps<SVGSVGElement>>;
  export const MusicalNoteIcon: ComponentType<SVGProps<SVGSVGElement>>;
  export const CloudArrowUpIcon: ComponentType<SVGProps<SVGSVGElement>>;
  export const ArrowDownTrayIcon: ComponentType<SVGProps<SVGSVGElement>>;
  export const ShareIcon: ComponentType<SVGProps<SVGSVGElement>>;
  export const LinkIcon: ComponentType<SVGProps<SVGSVGElement>>;
  export const ClipboardIcon: ComponentType<SVGProps<SVGSVGElement>>;
  export const InformationCircleIcon: ComponentType<SVGProps<SVGSVGElement>>;
  export const ExclamationTriangleIcon: ComponentType<SVGProps<SVGSVGElement>>;
  export const CheckIcon: ComponentType<SVGProps<SVGSVGElement>>;
  export const XIcon: ComponentType<SVGProps<SVGSVGElement>>;
  export const ArrowPathIcon: ComponentType<SVGProps<SVGSVGElement>>;
}

declare module '@heroicons/react/24/solid' {
  import { ComponentType, SVGProps } from 'react';
  
  export const BellIcon: ComponentType<SVGProps<SVGSVGElement>>;
  export const CheckCircleIcon: ComponentType<SVGProps<SVGSVGElement>>;
  export const XCircleIcon: ComponentType<SVGProps<SVGSVGElement>>;
  export const ClockIcon: ComponentType<SVGProps<SVGSVGElement>>;
  export const TruckIcon: ComponentType<SVGProps<SVGSVGElement>>;
  export const UserIcon: ComponentType<SVGProps<SVGSVGElement>>;
  export const HomeIcon: ComponentType<SVGProps<SVGSVGElement>>;
  export const ShoppingCartIcon: ComponentType<SVGProps<SVGSVGElement>>;
  export const HeartIcon: ComponentType<SVGProps<SVGSVGElement>>;
  export const MagnifyingGlassIcon: ComponentType<SVGProps<SVGSVGElement>>;
  export const Bars3Icon: ComponentType<SVGProps<SVGSVGElement>>;
  export const XMarkIcon: ComponentType<SVGProps<SVGSVGElement>>;
  export const MapPinIcon: ComponentType<SVGProps<SVGSVGElement>>;
  export const StarIcon: ComponentType<SVGProps<SVGSVGElement>>;
  export const PlusIcon: ComponentType<SVGProps<SVGSVGElement>>;
  export const MinusIcon: ComponentType<SVGProps<SVGSVGElement>>;
  export const TrashIcon: ComponentType<SVGProps<SVGSVGElement>>;
  export const PencilIcon: ComponentType<SVGProps<SVGSVGElement>>;
  export const EyeIcon: ComponentType<SVGProps<SVGSVGElement>>;
  export const EyeSlashIcon: ComponentType<SVGProps<SVGSVGElement>>;
  export const ArrowLeftIcon: ComponentType<SVGProps<SVGSVGElement>>;
  export const ArrowRightIcon: ComponentType<SVGProps<SVGSVGElement>>;
  export const ChevronDownIcon: ComponentType<SVGProps<SVGSVGElement>>;
  export const ChevronUpIcon: ComponentType<SVGProps<SVGSVGElement>>;
  export const ChevronLeftIcon: ComponentType<SVGProps<SVGSVGElement>>;
  export const ChevronRightIcon: ComponentType<SVGProps<SVGSVGElement>>;
  export const CogIcon: ComponentType<SVGProps<SVGSVGElement>>;
  export const DocumentIcon: ComponentType<SVGProps<SVGSVGElement>>;
  export const FolderIcon: ComponentType<SVGProps<SVGSVGElement>>;
  export const PhotoIcon: ComponentType<SVGProps<SVGSVGElement>>;
  export const VideoCameraIcon: ComponentType<SVGProps<SVGSVGElement>>;
  export const MusicalNoteIcon: ComponentType<SVGProps<SVGSVGElement>>;
  export const CloudArrowUpIcon: ComponentType<SVGProps<SVGSVGElement>>;
  export const ArrowDownTrayIcon: ComponentType<SVGProps<SVGSVGElement>>;
  export const ShareIcon: ComponentType<SVGProps<SVGSVGElement>>;
  export const LinkIcon: ComponentType<SVGProps<SVGSVGElement>>;
  export const ClipboardIcon: ComponentType<SVGProps<SVGSVGElement>>;
  export const InformationCircleIcon: ComponentType<SVGProps<SVGSVGElement>>;
  export const ExclamationTriangleIcon: ComponentType<SVGProps<SVGSVGElement>>;
  export const CheckIcon: ComponentType<SVGProps<SVGSVGElement>>;
  export const XIcon: ComponentType<SVGProps<SVGSVGElement>>;
  export const ArrowPathIcon: ComponentType<SVGProps<SVGSVGElement>>;
}

// Next.js Link component compatibility
declare module 'next/link' {
  import { ComponentType, AnchorHTMLAttributes, ReactNode } from 'react';
  
  interface LinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
    href: string;
    children: ReactNode;
    replace?: boolean;
    scroll?: boolean;
    shallow?: boolean;
    passHref?: boolean;
    prefetch?: boolean;
    locale?: string | false;
  }
  
  const Link: ComponentType<LinkProps>;
  export default Link;
}
