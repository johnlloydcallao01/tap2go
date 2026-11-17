'use client';

import React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { SidebarProps } from '@/types';
import { SidebarItem, SidebarDropdownGroup } from '@/components/ui';
import Link from '@/components/ui/LinkWrapper';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useAuth } from '@/hooks/useAuth';

const dropdownActive = (pathname: string | null, startsWith: string) =>
  pathname === startsWith || pathname?.startsWith(startsWith + '/') || false;

const exactActive = (pathname: string | null, href: string) =>
  pathname === href;

function SidebarSectionLabel({ children, isOpen }: { children: React.ReactNode; isOpen: boolean }) {
  if (!isOpen) return null;
  return (
    <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-[#a1a1aa]">
      {children}
    </div>
  );
}

function renderChildLink(
  item: { label: string; href: string; isActive: boolean },
) {
  return (
    <div key={item.href}>
      <Link
        href={item.href as any}
        className={`flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors ${
          item.isActive
            ? 'bg-gray-100 font-medium text-gray-900 dark:bg-gray-800 dark:text-gray-100'
            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100'
        }`}
      >
        <span className="truncate">{item.label}</span>
      </Link>
    </div>
  );
}

export function Sidebar({ isOpen, onToggle: _onToggle, mobileOpen = false, onCloseMobile, onScroll }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { logout } = useAuth();
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const expanded = isDesktop ? isOpen : true;

  const [isTagsExpanded, setIsTagsExpanded] = React.useState(false);

  const hasActiveTagsChild = dropdownActive(pathname, '/catalog/tags') || dropdownActive(pathname, '/catalog/tag-groups');

  React.useEffect(() => { if (hasActiveTagsChild) setIsTagsExpanded(true); }, [hasActiveTagsChild]);

  const accountTab = searchParams.get('tab');
  const handleLogout = async () => {
    await logout();
    router.refresh();
    router.replace('/signin');
  };

  return (
    <>
      {/* Mobile backdrop overlay - only visible on small screens when drawer is open */}
      {mobileOpen && (
        <div
          className="fixed inset-x-0 top-[57px] sm:top-[65px] bottom-0 bg-black/50 z-40 lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}
      <aside
        data-sidebar="merchant"
        className={`fixed left-0 top-[57px] sm:top-[65px] bg-white dark:bg-[#171717] border-r border-gray-200 dark:border-[#262626] transition-all duration-300 overflow-y-auto sidebar-scroll z-50 lg:z-40
          w-64 h-[calc(100vh-57px)] sm:h-[calc(100vh-65px)] ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 ${isOpen ? 'lg:w-60' : 'lg:w-20'}`}
        onScroll={onScroll}
      >
      <div className="p-3 pb-20">
        <nav className="space-y-4">

          {/* Overview */}
          <div className="space-y-1">
            <SidebarSectionLabel isOpen={expanded}>Overview</SidebarSectionLabel>
 <SidebarItem icon="dashboard" label="Overview" active={exactActive(pathname, '/dashboard/overview') || exactActive(pathname, '/')} collapsed={!expanded} href="/dashboard/overview" />
 <SidebarItem icon="reports" label="Reports" active={dropdownActive(pathname, '/dashboard/reports')} collapsed={!expanded} href="/dashboard/reports" />
 <SidebarItem icon="outlets" label="Outlets" active={dropdownActive(pathname, '/outlets')} collapsed={!expanded} href="/outlets" />
 <SidebarItem icon="orders" label="All Orders" active={exactActive(pathname, '/orders')} collapsed={!expanded} href="/orders" />
          </div>

          {expanded && <hr className="border-gray-200 dark:border-[#262626]" />}

          {/* Menu & Products */}
          <div className="space-y-1">
            <SidebarSectionLabel isOpen={expanded}>Menu & Products</SidebarSectionLabel>

            <SidebarItem icon="products" label="Products" active={dropdownActive(pathname, '/products')} collapsed={!expanded} href="/products" />

            <SidebarItem icon="tags" label="Attributes" active={dropdownActive(pathname, '/attributes')} collapsed={!expanded} href="/attributes" />

            <SidebarItem icon="categories" label="Product Categories" active={dropdownActive(pathname, '/product-categories')} collapsed={!expanded} href="/product-categories" />

            <SidebarDropdownGroup
              icon="tags"
              label="Tags"
              isOpen={expanded}
              isExpanded={isTagsExpanded}
              onToggle={() => setIsTagsExpanded((c) => !c)}
              active={hasActiveTagsChild}
            >
              {renderChildLink({ label: 'Product Tags', href: '/catalog/tags', isActive: dropdownActive(pathname, '/catalog/tags') })}
              {renderChildLink({ label: 'Tag Groups', href: '/catalog/tag-groups', isActive: dropdownActive(pathname, '/catalog/tag-groups') })}
            </SidebarDropdownGroup>
          </div>

          {expanded && <hr className="border-gray-200 dark:border-[#262626]" />}

          {/* Account */}
          <div className="space-y-1">
            <SidebarSectionLabel isOpen={expanded}>Account</SidebarSectionLabel>
            <SidebarItem icon="profile" label="Your Profile" active={exactActive(pathname, '/profile') && accountTab !== 'settings'} collapsed={!expanded} href="/profile" />
            <SidebarItem icon="logout" label="Logout" collapsed={!expanded} onClick={handleLogout} />
          </div>

        </nav>
      </div>
    </aside>
    </>
  );
}
