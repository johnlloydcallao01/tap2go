'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  HomeIcon,
  BuildingStorefrontIcon,
  MagnifyingGlassIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  BuildingStorefrontIcon as BuildingStorefrontIconSolid,
  MagnifyingGlassIcon as MagnifyingGlassIconSolid,
  UserIcon as UserIconSolid,
} from '@heroicons/react/24/solid';

const navigation = [
  {
    name: 'Foods',
    href: '/',
    icon: HomeIcon,
    activeIcon: HomeIconSolid,
  },
  {
    name: 'Restaurants',
    href: '/restaurants',
    icon: BuildingStorefrontIcon,
    activeIcon: BuildingStorefrontIconSolid,
  },
  {
    name: 'Search',
    href: '/search',
    icon: MagnifyingGlassIcon,
    activeIcon: MagnifyingGlassIconSolid,
  },
  {
    name: 'Account',
    href: '/profile',
    icon: UserIcon,
    activeIcon: UserIconSolid,
  },
];

export default function MobileFooterNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  // Don't show footer nav on admin, vendor dashboard, or auth pages
  if (!pathname ||
      pathname.startsWith('/admin') ||
      pathname.startsWith('/vendor/') ||
      pathname === '/vendor' ||
      pathname.startsWith('/auth') ||
      pathname.startsWith('/test-')) {
    return null;
  }

  // Don't show for non-customer users when they're on role-specific pages
  if (user && user.role !== 'customer' && user.role !== 'admin') {
    return null;
  }

  const getAccountHref = () => {
    if (!user) {
      return '/auth/signin';
    }
    return '/account';
  };

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/' || (pathname.startsWith('/restaurant/') && !pathname.startsWith('/restaurants'));
    }
    if (href === '/restaurants') {
      return pathname === '/restaurants';
    }
    if (href === '/profile') {
      return pathname === '/account' || pathname === '/profile' || pathname === '/orders' || (!user && pathname === '/auth/signin');
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="grid grid-cols-4 h-16">
        {navigation.map((item) => {
          const href = item.name === 'Account' ? getAccountHref() : item.href;
          const active = isActive(item.href);
          const IconComponent = active ? item.activeIcon : item.icon;

          return (
            <Link
              key={item.name}
              href={href}
              className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
                active
                  ? 'text-gray-500 hover:text-gray-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              style={active ? { color: '#f3a823' } : {}}
            >
              <IconComponent className="h-6 w-6" />
              <span className="text-xs font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
