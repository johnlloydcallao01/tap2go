'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  UserIcon,
  ShoppingBagIcon,
  HeartIcon,
  MapPinIcon,
  CreditCardIcon,
  BellIcon,
  Cog6ToothIcon,
  GiftIcon,
  StarIcon,
  ClockIcon,
  DocumentTextIcon,
  QuestionMarkCircleIcon,
  ChatBubbleLeftRightIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

interface NavigationCategory {
  name: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  items: NavigationItem[];
}

const navigationCategories: NavigationCategory[] = [
  {
    name: 'Account',
    icon: HomeIcon,
    items: [
      { name: 'Dashboard', href: '/account/dashboard', icon: HomeIcon },
      { name: 'Profile', href: '/account/profile', icon: UserIcon },
    ]
  },
  {
    name: 'Orders & Favorites',
    icon: ShoppingBagIcon,
    items: [
      { name: 'Order History', href: '/account/orders', icon: ShoppingBagIcon },
      { name: 'Track Order', href: '/account/orders/track', icon: ClockIcon },
      { name: 'Favorites', href: '/account/favorites', icon: HeartIcon },
      { name: 'Reviews', href: '/account/reviews', icon: StarIcon },
    ]
  },
  {
    name: 'Delivery & Payment',
    icon: MapPinIcon,
    items: [
      { name: 'Addresses', href: '/account/addresses', icon: MapPinIcon },
      { name: 'Payment Methods', href: '/account/payment', icon: CreditCardIcon },
    ]
  },
  {
    name: 'Rewards & Offers',
    icon: GiftIcon,
    items: [
      { name: 'Loyalty Points', href: '/account/loyalty', icon: GiftIcon },
      { name: 'Promotions', href: '/account/promotions', icon: DocumentTextIcon },
      { name: 'Referrals', href: '/account/referrals', icon: UserIcon },
    ]
  },
  {
    name: 'Support & Settings',
    icon: Cog6ToothIcon,
    items: [
      { name: 'Help Center', href: '/account/help', icon: QuestionMarkCircleIcon },
      { name: 'Contact Support', href: '/account/support', icon: ChatBubbleLeftRightIcon },
      { name: 'Notifications', href: '/account/notifications', icon: BellIcon },
      { name: 'Settings', href: '/account/settings', icon: Cog6ToothIcon },
    ]
  }
];

interface CustomerSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onExpandAndNavigate?: (href: string, categoryName: string) => void;
}

export default function CustomerSidebar({
  isOpen,
  onClose,
  isCollapsed = false,
  onToggleCollapse,
  onExpandAndNavigate
}: CustomerSidebarProps) {
  const pathname = usePathname();

  const isItemActive = (href: string) => {
    return pathname === href || (href === '/account/dashboard' && pathname === '/account');
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
                <UserIcon className="h-5 w-5 text-white" />
              </div>
              {!isCollapsed && (
                <span className="text-xl font-bold text-gray-900">My Account</span>
              )}
            </button>
          ) : (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <UserIcon className="h-5 w-5 text-white" />
              </div>
              {!isCollapsed && (
                <span className="text-xl font-bold text-gray-900">My Account</span>
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

                // Expanded view - show full categories and items
                return (
                  <div key={category.name}>
                    {/* Category Header */}
                    <div className="px-3 py-2">
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {category.name}
                      </h3>
                    </div>
                    
                    {/* Category Items */}
                    <div className="ml-3 space-y-1 mt-1 mb-4">
                      {category.items.map((item) => {
                        const isActive = isItemActive(item.href);
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={onClose}
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
