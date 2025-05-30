'use client';

import React from 'react';
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
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: HomeIcon },
  { name: 'Users', href: '/admin/users', icon: UsersIcon },
  { name: 'Vendors', href: '/admin/vendors', icon: BuildingStorefrontIcon },
  { name: 'Drivers', href: '/admin/drivers', icon: TruckIcon },
  { name: 'Customers', href: '/admin/customers', icon: UserGroupIcon },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingBagIcon },
  { name: 'Analytics', href: '/admin/analytics', icon: ChartBarIcon },
  { name: 'Disputes', href: '/admin/disputes', icon: ExclamationTriangleIcon },
  { name: 'Notifications', href: '/admin/notifications', icon: BellIcon },
  { name: 'Payouts', href: '/admin/payouts', icon: CurrencyDollarIcon },
  { name: 'Reports', href: '/admin/reports', icon: DocumentTextIcon },
  { name: 'Settings', href: '/admin/settings', icon: CogIcon },
];

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

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
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Tap2Go Admin</span>
          </div>
          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-8 px-4">
          <ul className="space-y-2">
            {navigation.map((item) => {
              // Special handling for Dashboard - active when on /admin or /admin/dashboard
              const isActive = pathname === item.href ||
                              (item.href === '/admin/dashboard' && pathname === '/admin');
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    onClick={onClose} // Close sidebar on mobile when link is clicked
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
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </>
  );
}
