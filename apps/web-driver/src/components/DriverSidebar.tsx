'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  TruckIcon,
  MapPinIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  UserIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
  BellIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

// Type utility for React 19 compatibility with Heroicons
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type IconComponent = any;

interface NavigationItem {
  name: string;
  href: string;
  icon: IconComponent;
}

interface NavigationCategory {
  name: string;
  icon: IconComponent;
  items: NavigationItem[];
}

const navigationCategories: NavigationCategory[] = [
  {
    name: 'Dashboard',
    icon: HomeIcon,
    items: [
      { name: 'Overview', href: '/dashboard', icon: HomeIcon },
      { name: 'Current Delivery', href: '/current', icon: TruckIcon },
    ]
  },
  {
    name: 'Deliveries',
    icon: TruckIcon,
    items: [
      { name: 'Available Orders', href: '/orders/available', icon: ClockIcon },
      { name: 'My Deliveries', href: '/orders', icon: TruckIcon },
      { name: 'Delivery History', href: '/orders/history', icon: DocumentTextIcon },
    ]
  },
  {
    name: 'Navigation',
    icon: MapPinIcon,
    items: [
      { name: 'Live Map', href: '/map', icon: MapPinIcon },
      { name: 'Route Optimization', href: '/routes', icon: MapPinIcon },
    ]
  },
  {
    name: 'Earnings',
    icon: CurrencyDollarIcon,
    items: [
      { name: 'Earnings Overview', href: '/earnings', icon: CurrencyDollarIcon },
      { name: 'Payment History', href: '/earnings/history', icon: DocumentTextIcon },
      { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
    ]
  },
  {
    name: 'Account',
    icon: UserIcon,
    items: [
      { name: 'Profile', href: '/profile', icon: UserIcon },
      { name: 'Vehicle Info', href: '/vehicle', icon: TruckIcon },
      { name: 'Documents', href: '/documents', icon: DocumentTextIcon },
      { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
      { name: 'Notifications', href: '/notifications', icon: BellIcon },
    ]
  }
];

interface DriverSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed?: boolean;
  onExpandAndNavigate?: (href: string, categoryName: string) => void;
}

export default function DriverSidebar({
  isOpen,
  onClose,
  isCollapsed = false,
  onExpandAndNavigate
}: DriverSidebarProps) {
  const pathname = usePathname();

  const isItemActive = (href: string) => {
    return pathname === href || (href === '/dashboard' && pathname === '/');
  };

  const handleCollapsedCategoryClick = (category: NavigationCategory) => {
    if (onExpandAndNavigate && category.items.length > 0) {
      // Get the first item in the category
      const firstItem = category.items[0];
      // Expand sidebar and navigate to first item
      onExpandAndNavigate(firstItem.href, category.name);
    }
  };

  // Handle navigation link clicks - only close sidebar on mobile
  const handleNavClick = () => {
    // Only close sidebar on mobile (when screen is small)
    if (window.innerWidth < 1024) { // lg breakpoint
      onClose();
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
      <div className={`fixed bottom-0 left-0 z-50 bg-gray-50 shadow-lg transform transition-all duration-300 ease-in-out lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } ${isCollapsed ? 'w-16' : 'w-64'}`} style={{ top: '67px' }}>
        {/* Mobile close button */}
        <div className="lg:hidden flex justify-end p-2 border-b border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Scrollable Navigation Container */}
        <div className="h-full overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
          {/* Navigation */}
          <nav className={`py-3 ${isCollapsed ? 'px-2' : 'px-4'}`}>
            <div className="space-y-1">
              {navigationCategories.map((category) => {

                if (isCollapsed) {
                  // Collapsed view - show only category icons (interactive)
                  return (
                    <div key={category.name} className="relative group">
                      <button
                        onClick={() => handleCollapsedCategoryClick(category)}
                        className="w-full flex items-center justify-center p-3 rounded-md transition-all duration-200 hover:scale-105 text-gray-600 hover:bg-blue-50 hover:text-blue-600 hover:shadow-sm"
                        title={`${category.name} - Click to expand and view ${category.items[0]?.name || 'items'}`}
                      >
                        <category.icon className="h-6 w-6" />
                      </button>

                      {/* Enhanced Tooltip with interaction hint */}
                      <div className="absolute left-full ml-3 top-0 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 shadow-lg">
                        <div className="font-medium">{category.name}</div>
                        <div className="text-xs text-gray-300 mt-1">
                          Click to expand & go to {category.items[0]?.name || 'first item'}
                        </div>
                        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45"></div>
                      </div>
                    </div>
                  );
                }

                // Expanded view - show full categories and items (always visible)
                return (
                  <div key={category.name}>
                    {/* Category Header - Static Label */}
                    <div className="category-header px-3 py-2 text-gray-700">
                      <span className="category-text uppercase tracking-wide text-sm font-bold leading-tight">
                        {category.name}
                      </span>
                    </div>

                    {/* Category Items - Always Visible */}
                    <div className="ml-3 space-y-1 mt-1 mb-4">
                      {category.items.map((item) => {
                        const isActive = isItemActive(item.href);
                        return (
                          <Link
                            key={item.name}
                            href={item.href}
                            onClick={handleNavClick}
                            className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${
                              isActive
                                ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-500'
                                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                            }`}
                          >
                            <item.icon
                              className={`mr-3 h-4 w-4 ${
                                isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                              }`}
                            />
                            <span className="text-sm font-normal">{item.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </nav>

          {/* Bottom Spacer for better scrolling experience */}
          <div className="h-6"></div>
        </div>
      </div>
    </>
  );
}
