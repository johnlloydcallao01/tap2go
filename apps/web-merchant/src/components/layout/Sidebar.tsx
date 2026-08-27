'use client';

import React from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import type { SidebarProps } from '@/types';
import { SidebarItem, SidebarDropdownGroup } from '@/components/ui';
import Link from '@/components/ui/LinkWrapper';
import { useMediaQuery } from '@/hooks/useMediaQuery';

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
            ? 'bg-gray-100 dark:bg-[#262626] font-medium text-gray-900 dark:text-white'
            : 'text-gray-700 dark:text-[#a1a1aa] hover:bg-gray-100 dark:hover:bg-[#262626] hover:text-gray-900 dark:hover:text-white'
        }`}
      >
        <span className="truncate">{item.label}</span>
      </Link>
    </div>
  );
}

export function Sidebar({ isOpen, onToggle: _onToggle, mobileOpen = false, onCloseMobile, onScroll }: SidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const expanded = isDesktop ? isOpen : true;

  const [isOutletsExpanded, setIsOutletsExpanded] = React.useState(false);
  const [isBusinessProfileExpanded, setIsBusinessProfileExpanded] = React.useState(false);
  const [isProductsExpanded, setIsProductsExpanded] = React.useState(false);
  const [isOutletListingsExpanded, setIsOutletListingsExpanded] = React.useState(false);
  const [isCustomizationsExpanded, setIsCustomizationsExpanded] = React.useState(false);
  const [isOrderQueueExpanded, setIsOrderQueueExpanded] = React.useState(false);
  const [isFulfillmentExpanded, setIsFulfillmentExpanded] = React.useState(false);
  const [isNotificationsExpanded, setIsNotificationsExpanded] = React.useState(false);

  const hasActiveOutletsChild = dropdownActive(pathname, '/outlets');
  const hasActiveBusinessProfileChild = dropdownActive(pathname, '/business');
  const hasActiveProductsChild = dropdownActive(pathname, '/products');
  const hasActiveOutletListingsChild = dropdownActive(pathname, '/listings');
  const hasActiveCustomizationsChild = dropdownActive(pathname, '/customizations');
  const hasActiveOrderQueueChild = dropdownActive(pathname, '/orders/active') || dropdownActive(pathname, '/orders/ready') || dropdownActive(pathname, '/orders/on-delivery');
  const hasActiveFulfillmentChild = dropdownActive(pathname, '/fulfillment');
  const hasActiveNotificationsChild = dropdownActive(pathname, '/notifications');

  React.useEffect(() => { if (hasActiveOutletsChild) setIsOutletsExpanded(true); }, [hasActiveOutletsChild]);
  React.useEffect(() => { if (hasActiveBusinessProfileChild) setIsBusinessProfileExpanded(true); }, [hasActiveBusinessProfileChild]);
  React.useEffect(() => { if (hasActiveProductsChild) setIsProductsExpanded(true); }, [hasActiveProductsChild]);
  React.useEffect(() => { if (hasActiveOutletListingsChild) setIsOutletListingsExpanded(true); }, [hasActiveOutletListingsChild]);
  React.useEffect(() => { if (hasActiveCustomizationsChild) setIsCustomizationsExpanded(true); }, [hasActiveCustomizationsChild]);
  React.useEffect(() => { if (hasActiveOrderQueueChild) setIsOrderQueueExpanded(true); }, [hasActiveOrderQueueChild]);
  React.useEffect(() => { if (hasActiveFulfillmentChild) setIsFulfillmentExpanded(true); }, [hasActiveFulfillmentChild]);
  React.useEffect(() => { if (hasActiveNotificationsChild) setIsNotificationsExpanded(true); }, [hasActiveNotificationsChild]);

  const accountTab = searchParams.get('tab');

  return (
    <>
      {/* Mobile backdrop overlay - only visible on small screens when drawer is open */}
      {mobileOpen && (
        <div
          className="fixed inset-x-0 top-[49px] sm:top-[57px] bottom-0 bg-black/50 z-40 lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}
      <aside
        data-sidebar="merchant"
        className={`fixed left-0 top-[49px] sm:top-[57px] bg-white dark:bg-[#171717] border-r border-gray-200 dark:border-[#262626] transition-all duration-300 overflow-y-auto sidebar-scroll z-50 lg:z-40
          w-64 h-[calc(100vh-49px)] sm:h-[calc(100vh-57px)] ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 ${isOpen ? 'lg:w-60' : 'lg:w-20'}`}
        onScroll={onScroll}
      >
      <div className="p-3 pb-20">
        <nav className="space-y-4">

          {/* Dashboard & Analytics */}
          <div className="space-y-1">
            <SidebarSectionLabel isOpen={expanded}>Dashboard & Analytics</SidebarSectionLabel>
            <SidebarItem icon="dashboard" label="Overview" active={exactActive(pathname, '/dashboard') || exactActive(pathname, '/')} collapsed={!expanded} href="/dashboard" />
            <SidebarItem icon="analytics" label="Analytics" active={dropdownActive(pathname, '/analytics')} collapsed={!expanded} href="/analytics" />
            <SidebarItem icon="reports" label="Reports" active={dropdownActive(pathname, '/reports')} collapsed={!expanded} href="/reports" />
          </div>

          {expanded && <hr className="border-gray-200 dark:border-[#262626]" />}

          {/* My Business */}
          <div className="space-y-1">
            <SidebarSectionLabel isOpen={expanded}>My Business</SidebarSectionLabel>

            <SidebarDropdownGroup
              icon="outlets"
              label="Outlets"
              isOpen={expanded}
              isExpanded={isOutletsExpanded}
              onToggle={() => setIsOutletsExpanded((c) => !c)}
              active={hasActiveOutletsChild}
            >
              {renderChildLink({ label: 'All Outlets', href: '/outlets', isActive: exactActive(pathname, '/outlets') })}
              {renderChildLink({ label: 'Status & Operating Hours', href: '/outlets/hours', isActive: dropdownActive(pathname, '/outlets/hours') })}
              {renderChildLink({ label: 'Delivery Settings', href: '/outlets/delivery', isActive: dropdownActive(pathname, '/outlets/delivery') })}
              {renderChildLink({ label: 'Service Areas & Radius', href: '/outlets/service-area', isActive: dropdownActive(pathname, '/outlets/service-area') })}
              {renderChildLink({ label: 'Photos & Branding', href: '/outlets/media', isActive: dropdownActive(pathname, '/outlets/media') })}
            </SidebarDropdownGroup>

            <SidebarDropdownGroup
              icon="business"
              label="Business Profile"
              isOpen={expanded}
              isExpanded={isBusinessProfileExpanded}
              onToggle={() => setIsBusinessProfileExpanded((c) => !c)}
              active={hasActiveBusinessProfileChild}
            >
              {renderChildLink({ label: 'Company Information', href: '/business/profile', isActive: dropdownActive(pathname, '/business/profile') })}
              {renderChildLink({ label: 'Registration & Verification', href: '/business/verification', isActive: dropdownActive(pathname, '/business/verification') })}
              {renderChildLink({ label: 'Contacts & Managers', href: '/business/contacts', isActive: dropdownActive(pathname, '/business/contacts') })}
            </SidebarDropdownGroup>
          </div>

          {expanded && <hr className="border-gray-200 dark:border-[#262626]" />}

          {/* Menu & Products */}
          <div className="space-y-1">
            <SidebarSectionLabel isOpen={expanded}>Menu & Products</SidebarSectionLabel>

            <SidebarDropdownGroup
              icon="products"
              label="Products"
              isOpen={expanded}
              isExpanded={isProductsExpanded}
              onToggle={() => setIsProductsExpanded((c) => !c)}
              active={hasActiveProductsChild}
            >
              {renderChildLink({ label: 'All Products', href: '/products', isActive: exactActive(pathname, '/products') })}
              {renderChildLink({ label: 'Create New', href: '/products/new', isActive: exactActive(pathname, '/products/new') })}
              {renderChildLink({ label: 'Push to All Outlets', href: '/products/distribute', isActive: dropdownActive(pathname, '/products/distribute') })}
            </SidebarDropdownGroup>

            <SidebarDropdownGroup
              icon="inventory"
              label="Outlet Listings"
              isOpen={expanded}
              isExpanded={isOutletListingsExpanded}
              onToggle={() => setIsOutletListingsExpanded((c) => !c)}
              active={hasActiveOutletListingsChild}
            >
              {renderChildLink({ label: 'Per-Outlet Menus', href: '/listings', isActive: exactActive(pathname, '/listings') })}
              {renderChildLink({ label: 'Sold-Out Toggles', href: '/listings/availability', isActive: dropdownActive(pathname, '/listings/availability') })}
              {renderChildLink({ label: 'Price Overrides', href: '/listings/pricing', isActive: dropdownActive(pathname, '/listings/pricing') })}
              {renderChildLink({ label: 'Stock Levels', href: '/listings/stock', isActive: dropdownActive(pathname, '/listings/stock') })}
            </SidebarDropdownGroup>

            <SidebarDropdownGroup
              icon="settings"
              label="Customizations"
              isOpen={expanded}
              isExpanded={isCustomizationsExpanded}
              onToggle={() => setIsCustomizationsExpanded((c) => !c)}
              active={hasActiveCustomizationsChild}
            >
              {renderChildLink({ label: 'Modifier Overrides (per outlet)', href: '/customizations/modifiers', isActive: dropdownActive(pathname, '/customizations/modifiers') })}
              {renderChildLink({ label: 'Variation-Specific Rules', href: '/customizations/variation-rules', isActive: dropdownActive(pathname, '/customizations/variation-rules') })}
              {renderChildLink({ label: 'Effective Preview', href: '/customizations/preview', isActive: dropdownActive(pathname, '/customizations/preview') })}
            </SidebarDropdownGroup>

            <SidebarItem icon="categories" label="Categories" active={dropdownActive(pathname, '/categories')} collapsed={!expanded} href="/categories" />
          </div>

          {expanded && <hr className="border-gray-200 dark:border-[#262626]" />}

          {/* Orders */}
          <div className="space-y-1">
            <SidebarSectionLabel isOpen={expanded}>Orders</SidebarSectionLabel>

            <SidebarItem icon="orders" label="New Orders" active={dropdownActive(pathname, '/orders/pending')} collapsed={!expanded} href="/orders/pending" />

            <SidebarDropdownGroup
              icon="orders"
              label="Order Queue"
              isOpen={expanded}
              isExpanded={isOrderQueueExpanded}
              onToggle={() => setIsOrderQueueExpanded((c) => !c)}
              active={hasActiveOrderQueueChild}
            >
              {renderChildLink({ label: 'Accepted & Preparing', href: '/orders/active', isActive: dropdownActive(pathname, '/orders/active') })}
              {renderChildLink({ label: 'Ready for Pickup', href: '/orders/ready', isActive: dropdownActive(pathname, '/orders/ready') })}
              {renderChildLink({ label: 'On Delivery', href: '/orders/on-delivery', isActive: dropdownActive(pathname, '/orders/on-delivery') })}
            </SidebarDropdownGroup>

            <SidebarItem icon="pages" label="Order History" active={dropdownActive(pathname, '/orders/history')} collapsed={!expanded} href="/orders/history" />
            <SidebarItem icon="audit" label="Cancelled & Issues" active={dropdownActive(pathname, '/orders/cancelled')} collapsed={!expanded} href="/orders/cancelled" />
          </div>

          {expanded && <hr className="border-gray-200 dark:border-[#262626]" />}

          {/* Fulfillment */}
          <div className="space-y-1">
            <SidebarSectionLabel isOpen={expanded}>Fulfillment</SidebarSectionLabel>

            <SidebarDropdownGroup
              icon="fulfillment"
              label="Deliveries"
              isOpen={expanded}
              isExpanded={isFulfillmentExpanded}
              onToggle={() => setIsFulfillmentExpanded((c) => !c)}
              active={hasActiveFulfillmentChild}
            >
              {renderChildLink({ label: 'Active Bookings', href: '/fulfillment/deliveries', isActive: dropdownActive(pathname, '/fulfillment/deliveries') })}
              {renderChildLink({ label: 'Booking Issues', href: '/fulfillment/issues', isActive: dropdownActive(pathname, '/fulfillment/issues') })}
            </SidebarDropdownGroup>

            <SidebarItem icon="integrations" label="Live Tracking" active={dropdownActive(pathname, '/fulfillment/tracking')} collapsed={!expanded} href="/fulfillment/tracking" />
            <SidebarItem icon="shipping" label="Pickup Handoffs" active={dropdownActive(pathname, '/fulfillment/pickups')} collapsed={!expanded} href="/fulfillment/pickups" />
          </div>

          {expanded && <hr className="border-gray-200 dark:border-[#262626]" />}

          {/* Reputation */}
          <div className="space-y-1">
            <SidebarSectionLabel isOpen={expanded}>Reputation</SidebarSectionLabel>
            <SidebarItem icon="reviews" label="Reviews & Ratings" active={dropdownActive(pathname, '/reviews')} collapsed={!expanded} href="/reviews" />
            <SidebarItem icon="analytics" label="Rating Overview" active={dropdownActive(pathname, '/reviews/summary')} collapsed={!expanded} href="/reviews/summary" />
          </div>

          {expanded && <hr className="border-gray-200 dark:border-[#262626]" />}

          {/* Payments */}
          <div className="space-y-1">
            <SidebarSectionLabel isOpen={expanded}>Payments</SidebarSectionLabel>
            <SidebarItem icon="payments" label="Transactions" active={dropdownActive(pathname, '/payments/transactions')} collapsed={!expanded} href="/payments/transactions" />
            <SidebarItem icon="billing" label="Refunds" active={dropdownActive(pathname, '/payments/refunds')} collapsed={!expanded} href="/payments/refunds" />
            <SidebarItem icon="payments" label="Settlements (Future)" active={dropdownActive(pathname, '/payments/settlements')} collapsed={!expanded} href="/payments/settlements" />
          </div>

          {expanded && <hr className="border-gray-200 dark:border-[#262626]" />}

          {/* Communications */}
          <div className="space-y-1">
            <SidebarSectionLabel isOpen={expanded}>Communications</SidebarSectionLabel>

            <SidebarDropdownGroup
              icon="notifications"
              label="Notifications"
              isOpen={expanded}
              isExpanded={isNotificationsExpanded}
              onToggle={() => setIsNotificationsExpanded((c) => !c)}
              active={hasActiveNotificationsChild}
            >
              {renderChildLink({ label: 'My Inbox', href: '/notifications/inbox', isActive: dropdownActive(pathname, '/notifications/inbox') })}
            </SidebarDropdownGroup>

            <SidebarItem icon="campaigns" label="Announcements" active={dropdownActive(pathname, '/announcements')} collapsed={!expanded} href="/announcements" />
          </div>

          {expanded && <hr className="border-gray-200 dark:border-[#262626]" />}

          {/* Account */}
          <div className="space-y-1">
            <SidebarSectionLabel isOpen={expanded}>Account</SidebarSectionLabel>
            <SidebarItem icon="profile" label="Your Profile" active={exactActive(pathname, '/profile') && accountTab !== 'settings'} collapsed={!expanded} href="/profile" />
            <SidebarItem icon="settings" label="Account Settings" active={exactActive(pathname, '/profile') && accountTab === 'settings'} collapsed={!expanded} href="/profile?tab=settings" />
          </div>

        </nav>
      </div>
    </aside>
    </>
  );
}
