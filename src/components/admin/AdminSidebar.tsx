'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  UsersIcon,
  BuildingStorefrontIcon,
  TruckIcon,
  ShoppingBagIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CogIcon,
  BellIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  PresentationChartLineIcon,
  BanknotesIcon,
  ShieldCheckIcon,
  MegaphoneIcon,
  PhotoIcon,
  PencilSquareIcon,
  TagIcon,
  GiftIcon,
  StarIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  MapPinIcon,
  CreditCardIcon,
  ChartPieIcon,
  DocumentChartBarIcon,
  AdjustmentsHorizontalIcon,
  KeyIcon,
  UserCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon as ChevronRightIconSolid,
} from '@heroicons/react/24/outline';

// Professional menu categorization structure with category icons
const navigationCategories = [
  {
    name: 'Overview',
    icon: HomeIcon,
    items: [
      { name: 'Dashboard', href: '/admin/dashboard', icon: HomeIcon },
    ]
  },
  {
    name: 'User Management',
    icon: UsersIcon,
    items: [
      { name: 'All Users', href: '/admin/users', icon: UsersIcon },
      { name: 'Customers', href: '/admin/customers', icon: UserGroupIcon },
      { name: 'Vendors', href: '/admin/vendors', icon: BuildingStorefrontIcon },
      { name: 'Drivers', href: '/admin/drivers', icon: TruckIcon },
    ]
  },
  {
    name: 'Operations',
    icon: ShoppingBagIcon,
    items: [
      { name: 'Orders', href: '/admin/orders', icon: ShoppingBagIcon },
      { name: 'Disputes', href: '/admin/disputes', icon: ExclamationTriangleIcon },
      { name: 'Notifications', href: '/admin/notifications', icon: BellIcon },
      { name: 'Reviews', href: '/admin/reviews', icon: StarIcon },
      { name: 'Support Chat', href: '/admin/support', icon: ChatBubbleLeftRightIcon },
    ]
  },
  {
    name: 'Content Management',
    icon: PencilSquareIcon,
    items: [
      { name: 'CMS Dashboard', href: '/admin/cms-dashboard', icon: PencilSquareIcon },
      { name: 'Media Library', href: '/admin/cms/media', icon: PhotoIcon },
      { name: 'Promotions', href: '/admin/cms/promotions', icon: MegaphoneIcon },
      { name: 'Banners', href: '/admin/cms/banners', icon: TagIcon },
    ]
  },
  {
    name: 'Marketing',
    icon: MegaphoneIcon,
    items: [
      { name: 'Campaigns', href: '/admin/marketing/campaigns', icon: MegaphoneIcon },
      { name: 'Coupons', href: '/admin/marketing/coupons', icon: GiftIcon },
      { name: 'Loyalty Program', href: '/admin/marketing/loyalty', icon: StarIcon },
      { name: 'Push Notifications', href: '/admin/marketing/push', icon: BellIcon },
    ]
  },
  {
    name: 'Analytics & Reports',
    icon: ChartBarIcon,
    items: [
      { name: 'Overview Analytics', href: '/admin/analytics', icon: ChartBarIcon },
      { name: 'Sales Reports', href: '/admin/reports/sales', icon: DocumentChartBarIcon },
      { name: 'User Reports', href: '/admin/reports/users', icon: ChartPieIcon },
      { name: 'Performance', href: '/admin/reports/performance', icon: PresentationChartLineIcon },
      { name: 'Custom Reports', href: '/admin/reports/custom', icon: DocumentTextIcon },
    ]
  },
  {
    name: 'Financial',
    icon: CurrencyDollarIcon,
    items: [
      { name: 'Payouts', href: '/admin/payouts', icon: CurrencyDollarIcon },
      { name: 'Transactions', href: '/admin/financial/transactions', icon: CreditCardIcon },
      { name: 'Revenue', href: '/admin/financial/revenue', icon: BanknotesIcon },
      { name: 'Commissions', href: '/admin/financial/commissions', icon: ChartPieIcon },
    ]
  },
  {
    name: 'Logistics',
    icon: TruckIcon,
    items: [
      { name: 'Delivery Zones', href: '/admin/logistics/zones', icon: MapPinIcon },
      { name: 'Delivery Times', href: '/admin/logistics/times', icon: ClockIcon },
      { name: 'Fleet Management', href: '/admin/logistics/fleet', icon: TruckIcon },
    ]
  },
  {
    name: 'System',
    icon: CogIcon,
    items: [
      { name: 'General Settings', href: '/admin/settings', icon: CogIcon },
      { name: 'API Configuration', href: '/admin/settings/api', icon: AdjustmentsHorizontalIcon },
      { name: 'Security', href: '/admin/settings/security', icon: ShieldCheckIcon },
      { name: 'Admin Accounts', href: '/admin/settings/admins', icon: UserCircleIcon },
      { name: 'Access Keys', href: '/admin/settings/keys', icon: KeyIcon },
    ]
  }
];

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onExpandAndNavigate?: (href: string, categoryName: string) => void;
}

export default function AdminSidebar({
  isOpen,
  onClose,
  isCollapsed = false,
  onToggleCollapse,
  onExpandAndNavigate
}: AdminSidebarProps) {
  const pathname = usePathname();
  const [expandedCategories, setExpandedCategories] = useState<string[]>([
    'Overview', 'User Management', 'Operations' // Default expanded categories for immediate access
  ]);

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryName)
        ? prev.filter(name => name !== categoryName)
        : [...prev, categoryName]
    );
  };

  const isItemActive = (href: string) => {
    return pathname === href || (href === '/admin/dashboard' && pathname === '/admin');
  };

  const isCategoryActive = (category: any) => {
    return category.items.some((item: any) => isItemActive(item.href));
  };

  const handleCollapsedCategoryClick = (category: any) => {
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
        <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200 bg-white relative z-10">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            {!isCollapsed && (
              <span className="text-xl font-bold text-gray-900">Tap2Go Admin</span>
            )}
          </div>

          {/* Desktop collapse toggle */}
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="hidden lg:block p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? (
                <ChevronRightIconSolid className="h-5 w-5" />
              ) : (
                <ChevronLeftIcon className="h-5 w-5" />
              )}
            </button>
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
          <nav className={`py-6 ${isCollapsed ? 'px-2' : 'px-4'}`}>
            <div className="space-y-1">
              {navigationCategories.map((category) => {
                const isExpanded = expandedCategories.includes(category.name);
                const categoryActive = isCategoryActive(category);

                if (isCollapsed) {
                  // Collapsed view - show only category icons (interactive)
                  return (
                    <div key={category.name} className="relative group">
                      <button
                        onClick={() => handleCollapsedCategoryClick(category)}
                        className={`w-full flex items-center justify-center p-3 rounded-md transition-all duration-200 hover:scale-105 ${
                          categoryActive
                            ? 'bg-orange-100 text-orange-700 shadow-md'
                            : 'text-gray-600 hover:bg-orange-50 hover:text-orange-600 hover:shadow-sm'
                        }`}
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

                // Expanded view - show full categories and items
                return (
                  <div key={category.name} className="space-y-1">
                    {/* Category Header */}
                    <button
                      onClick={() => toggleCategory(category.name)}
                      className={`category-button w-full flex items-start justify-between px-3 py-2 text-sm font-semibold rounded-md transition-colors ${
                        categoryActive
                          ? 'bg-orange-50 text-orange-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <div className="flex items-start space-x-2 flex-1 min-w-0">
                        <category.icon className="category-icon h-4 w-4 flex-shrink-0" />
                        <span className="category-text uppercase tracking-wider text-xs text-left leading-tight">
                          {category.name}
                        </span>
                      </div>
                      <div className="flex-shrink-0 ml-2">
                        {isExpanded ? (
                          <ChevronDownIcon className="h-4 w-4 mt-0.5" />
                        ) : (
                          <ChevronRightIcon className="h-4 w-4 mt-0.5" />
                        )}
                      </div>
                    </button>

                    {/* Category Items */}
                    {isExpanded && (
                      <div className="ml-2 space-y-1">
                        {category.items.map((item) => {
                          const isActive = isItemActive(item.href);
                          return (
                            <Link
                              key={item.name}
                              href={item.href}
                              onClick={onClose}
                              className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                                isActive
                                  ? 'bg-orange-100 text-orange-700 border-r-2 border-orange-500'
                                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                              }`}
                            >
                              <item.icon
                                className={`mr-3 h-5 w-5 ${
                                  isActive ? 'text-orange-500' : 'text-gray-400 group-hover:text-gray-500'
                                }`}
                              />
                              {item.name}
                            </Link>
                          );
                        })}
                      </div>
                    )}
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
