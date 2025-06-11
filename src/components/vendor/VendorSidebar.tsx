'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  BuildingStorefrontIcon,
  ClipboardDocumentListIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  MegaphoneIcon,
  Cog6ToothIcon,
  XMarkIcon,
  Bars3BottomLeftIcon,
  ClockIcon,
  TruckIcon,
  DocumentTextIcon,
  CreditCardIcon,
  StarIcon,
  TagIcon,
  FolderIcon,
  AdjustmentsHorizontalIcon,
  BanknotesIcon,
  ChartPieIcon,
  CalendarDaysIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

// Type definitions for navigation structure
interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavigationCategory {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  items: NavigationItem[];
}

// Professional vendor menu categorization structure
const navigationCategories: NavigationCategory[] = [
  {
    name: 'Overview',
    icon: HomeIcon,
    items: [
      { name: 'Dashboard', href: '/vendor/dashboard', icon: HomeIcon },
      { name: 'Analytics', href: '/vendor/analytics', icon: ChartBarIcon },
    ]
  },
  {
    name: 'Restaurant Management',
    icon: BuildingStorefrontIcon,
    items: [
      { name: 'Restaurant Profile', href: '/vendor/restaurant', icon: BuildingStorefrontIcon },
      { name: 'Operating Hours', href: '/vendor/restaurant/hours', icon: ClockIcon },
      { name: 'Delivery Settings', href: '/vendor/restaurant/delivery', icon: TruckIcon },
      { name: 'Business Documents', href: '/vendor/restaurant/documents', icon: DocumentTextIcon },
    ]
  },
  {
    name: 'Menu Management',
    icon: ClipboardDocumentListIcon,
    items: [
      { name: 'Menu Items', href: '/vendor/menu', icon: ClipboardDocumentListIcon },
      { name: 'Categories', href: '/vendor/menu/categories', icon: FolderIcon },
      { name: 'Modifiers', href: '/vendor/menu/modifiers', icon: AdjustmentsHorizontalIcon },
      { name: 'Pricing', href: '/vendor/menu/pricing', icon: TagIcon },
    ]
  },
  {
    name: 'Order Management',
    icon: ClipboardDocumentListIcon,
    items: [
      { name: 'Active Orders', href: '/vendor/orders', icon: ClipboardDocumentListIcon },
      { name: 'Order History', href: '/vendor/orders/history', icon: CalendarDaysIcon },
      { name: 'Order Analytics', href: '/vendor/orders/analytics', icon: ChartPieIcon },
    ]
  },
  {
    name: 'Financial',
    icon: CurrencyDollarIcon,
    items: [
      { name: 'Earnings', href: '/vendor/earnings', icon: CurrencyDollarIcon },
      { name: 'Payouts', href: '/vendor/payouts', icon: BanknotesIcon },
      { name: 'Commission Reports', href: '/vendor/reports/commission', icon: DocumentTextIcon },
      { name: 'Bank Details', href: '/vendor/settings/banking', icon: CreditCardIcon },
    ]
  },
  {
    name: 'Marketing',
    icon: MegaphoneIcon,
    items: [
      { name: 'Promotions', href: '/vendor/promotions', icon: MegaphoneIcon },
      { name: 'Reviews', href: '/vendor/reviews', icon: StarIcon },
      { name: 'Customer Insights', href: '/vendor/customers', icon: UserGroupIcon },
    ]
  },
  {
    name: 'Settings',
    icon: Cog6ToothIcon,
    items: [
      { name: 'Account Settings', href: '/vendor/settings', icon: Cog6ToothIcon },
      { name: 'Notifications', href: '/vendor/settings/notifications', icon: Bars3BottomLeftIcon },
    ]
  }
];

interface VendorSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onExpandAndNavigate?: (href: string, categoryName: string) => void;
}

export default function VendorSidebar({
  isOpen,
  onClose,
  isCollapsed = false,
  onToggleCollapse,
  onExpandAndNavigate
}: VendorSidebarProps) {
  const pathname = usePathname();

  const isItemActive = (href: string) => {
    return pathname === href || (href === '/vendor/dashboard' && pathname === '/vendor');
  };

  const handleCollapsedCategoryClick = (category: NavigationCategory) => {
    if (onExpandAndNavigate && category.items.length > 0) {
      // Get the first item in the category
      const firstItem = category.items[0];
      // Expand sidebar and navigate to first item
      onExpandAndNavigate(firstItem.href, category.name);
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 bg-white shadow-lg transform transition-all duration-300 ease-in-out lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } ${isCollapsed ? 'w-16' : 'w-64'}`}>
        {/* Fixed Header */}
        <div className="flex items-center justify-between px-4 min-h-16 border-b border-gray-200 bg-white relative z-10">
          {/* Clickable Logo + Text Area */}
          {onToggleCollapse ? (
            <button
              onClick={onToggleCollapse}
              className="flex items-center space-x-2 hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors duration-200 flex-1"
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <BuildingStorefrontIcon className="h-5 w-5 text-white" />
              </div>
              {!isCollapsed && (
                <span className="text-xl font-bold text-gray-900">Vendor Panel</span>
              )}
            </button>
          ) : (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <BuildingStorefrontIcon className="h-5 w-5 text-white" />
              </div>
              {!isCollapsed && (
                <span className="text-xl font-bold text-gray-900">Vendor Panel</span>
              )}
            </div>
          )}

          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Scrollable Navigation Container */}
        <div
          className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400"
          style={{ height: 'calc(100vh - 4rem)' }}
        >
          {/* Navigation */}
          <nav className={`py-3 ${isCollapsed ? 'px-2' : 'px-4'}`}>
          {navigationCategories.map((category) => (
            <div key={category.name}>
              {isCollapsed ? (
                // Collapsed view - show category icon only
                <button
                  onClick={() => handleCollapsedCategoryClick(category)}
                  className="w-full p-3 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200 flex items-center justify-center group relative"
                  title={category.name}
                >
                  <category.icon className="h-6 w-6" />
                  
                  {/* Tooltip */}
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                    {category.name}
                  </div>
                </button>
              ) : (
                // Expanded view
                <div className="space-y-1">
                  {/* Category Header */}
                  <div className="px-3 py-2">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {category.name}
                    </h3>
                  </div>
                  
                  {/* Category Items */}
                  <div className="ml-3 space-y-1 mt-1 mb-4">
                    {category.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={onClose}
                        className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${
                          isItemActive(item.href)
                            ? 'bg-orange-100 text-orange-700 border-r-2 border-orange-500'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                      >
                        <item.icon
                          className={`mr-3 h-4 w-4 ${
                            isItemActive(item.href) ? 'text-orange-500' : 'text-gray-400 group-hover:text-gray-500'
                          }`}
                        />
                        <span className="text-sm font-normal">{item.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
          </nav>

          {/* Bottom Spacer for better scrolling experience */}
          <div className="h-6"></div>
        </div>
      </div>
    </>
  );
}
