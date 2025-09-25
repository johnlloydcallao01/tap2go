'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  UsersIcon,
  BuildingStorefrontIcon,
  ChartBarIcon,
  DocumentTextIcon,
  UserGroupIcon,
  XMarkIcon,
  PresentationChartLineIcon,
  MegaphoneIcon,
  PhotoIcon,
  PencilSquareIcon,
  TagIcon,
  ChartPieIcon,
  DocumentChartBarIcon,
} from '@heroicons/react/24/outline';

// Local types for navigation (independent from shared-types)
type IconComponent = React.ComponentType<{
  className?: string;
}>;

type NavigationItem = {
  name: string;
  href: string;
  icon: IconComponent;
};

type NavigationCategory = {
  name: string;
  icon: IconComponent;
  items: NavigationItem[];
};

// Type assertion helper for any icon component
const asIconComponent = (icon: React.ComponentType<React.SVGProps<SVGSVGElement>>): IconComponent => icon as IconComponent;

// Professional menu categorization structure with category icons
const navigationCategories: NavigationCategory[] = [
  {
    name: 'Overview',
    icon: asIconComponent(HomeIcon),
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: asIconComponent(HomeIcon) },
    ]
  },
  {
    name: 'User Management',
    icon: asIconComponent(UsersIcon),
    items: [
      { name: 'All Users', href: '/users', icon: asIconComponent(UsersIcon) },
      { name: 'Customers', href: '/customers', icon: asIconComponent(UserGroupIcon) },
      { name: 'Vendors', href: '/vendors', icon: asIconComponent(BuildingStorefrontIcon) },
    ]
  },
  {
    name: 'Content Management',
    icon: asIconComponent(PencilSquareIcon),
    items: [
      { name: 'CMS Dashboard', href: '/cms-dashboard', icon: asIconComponent(PencilSquareIcon) },
      { name: 'Media Library', href: '/cms/media', icon: asIconComponent(PhotoIcon) },
      { name: 'Promotions', href: '/cms/promotions', icon: asIconComponent(MegaphoneIcon) },
      { name: 'Banners', href: '/cms/banners', icon: asIconComponent(TagIcon) },
    ]
  },
  {
    name: 'Analytics & Reports',
    icon: asIconComponent(ChartBarIcon),
    items: [
      { name: 'Overview Analytics', href: '/analytics', icon: asIconComponent(ChartBarIcon) },
      { name: 'Sales Reports', href: '/reports/sales', icon: asIconComponent(DocumentChartBarIcon) },
      { name: 'User Reports', href: '/reports/users', icon: asIconComponent(ChartPieIcon) },
      { name: 'Performance', href: '/reports/performance', icon: asIconComponent(PresentationChartLineIcon) },
      { name: 'Custom Reports', href: '/reports/custom', icon: asIconComponent(DocumentTextIcon) },
    ]
  },


];

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed?: boolean;
  onExpandAndNavigate?: (href: string, categoryName: string) => void;
}

export default function AdminSidebar({
  isOpen,
  onClose,
  isCollapsed = false,
  onExpandAndNavigate
}: AdminSidebarProps) {
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
                        className="w-full flex items-center justify-center p-3 rounded-md transition-all duration-200 hover:scale-105 text-gray-600 hover:bg-orange-50 hover:text-orange-600 hover:shadow-sm"
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
                                ? 'bg-orange-100 text-orange-700 border-r-2 border-orange-500'
                                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                            }`}
                          >
                            <item.icon
                              className={`mr-3 h-4 w-4 ${
                                isActive ? 'text-orange-500' : 'text-gray-400 group-hover:text-gray-500'
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
