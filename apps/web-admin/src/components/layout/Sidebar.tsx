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
  const searchParams = useSearchParams();
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  // On mobile the drawer should always render expanded (labels visible).
  // On desktop, honor the collapse state.
  const expanded = isDesktop ? isOpen : true;

  const [isVendorsExpanded, setIsVendorsExpanded] = React.useState(false);
  const [isMerchantsExpanded, setIsMerchantsExpanded] = React.useState(false);
  const [isDriversExpanded, setIsDriversExpanded] = React.useState(false);
  const [isProductsExpanded, setIsProductsExpanded] = React.useState(false);
  const [isMerchantListingsExpanded, setIsMerchantListingsExpanded] = React.useState(false);
  const [isAttributesExpanded, setIsAttributesExpanded] = React.useState(false);
  const [isModifiersExpanded, setIsModifiersExpanded] = React.useState(false);
  const [isTagsExpanded, setIsTagsExpanded] = React.useState(false);
  const [isOrderQueueExpanded, setIsOrderQueueExpanded] = React.useState(false);
  const [isDeliveryExpanded, setIsDeliveryExpanded] = React.useState(false);
  const [isReviewsExpanded, setIsReviewsExpanded] = React.useState(false);
  const [isPromotionsExpanded, setIsPromotionsExpanded] = React.useState(false);
  const [isCustomerActivityExpanded, setIsCustomerActivityExpanded] = React.useState(false);
  const [isNotificationsExpanded, setIsNotificationsExpanded] = React.useState(false);
  const [isPlatformConfigExpanded, setIsPlatformConfigExpanded] = React.useState(false);

  const hasActiveVendorsChild = dropdownActive(pathname, '/vendors');
  const hasActiveMerchantsChild = dropdownActive(pathname, '/merchants');
  const hasActiveDriversChild = dropdownActive(pathname, '/drivers');
  const hasActiveProductsChild = dropdownActive(pathname, '/products');
  const hasActiveMerchantListingsChild = dropdownActive(pathname, '/merchant-products');
  const hasActiveAttributesChild = dropdownActive(pathname, '/catalog/attributes') || dropdownActive(pathname, '/catalog/attribute-terms') || dropdownActive(pathname, '/catalog/variations') || dropdownActive(pathname, '/catalog/variation-values') || dropdownActive(pathname, '/catalog/grouped-items');
  const hasActiveModifiersChild = dropdownActive(pathname, '/catalog/modifier-groups') || dropdownActive(pathname, '/catalog/modifier-options') || dropdownActive(pathname, '/catalog/variation-modifiers') || dropdownActive(pathname, '/catalog/modifier-overrides');
  const hasActiveTagsChild = dropdownActive(pathname, '/catalog/tags') || dropdownActive(pathname, '/catalog/tag-groups');
  const hasActiveOrderQueueChild = dropdownActive(pathname, '/orders/pending') || dropdownActive(pathname, '/orders/preparing') || dropdownActive(pathname, '/orders/ready-for-pickup') || dropdownActive(pathname, '/orders/on-delivery') || dropdownActive(pathname, '/orders/cancelled');
  const hasActiveDeliveryChild = dropdownActive(pathname, '/delivery/bookings') || dropdownActive(pathname, '/delivery/locations') || dropdownActive(pathname, '/delivery/tracking');
  const hasActiveReviewsChild = dropdownActive(pathname, '/reviews');
  const hasActivePromotionsChild = dropdownActive(pathname, '/promotions');
  const hasActiveCustomerActivityChild = dropdownActive(pathname, '/activity');
  const hasActiveNotificationsChild = dropdownActive(pathname, '/notifications');
  const hasActivePlatformConfigChild = dropdownActive(pathname, '/settings/general') || dropdownActive(pathname, '/settings/delivery') || dropdownActive(pathname, '/settings/payments');

  React.useEffect(() => { if (hasActiveVendorsChild) setIsVendorsExpanded(true); }, [hasActiveVendorsChild]);
  React.useEffect(() => { if (hasActiveMerchantsChild) setIsMerchantsExpanded(true); }, [hasActiveMerchantsChild]);
  React.useEffect(() => { if (hasActiveDriversChild) setIsDriversExpanded(true); }, [hasActiveDriversChild]);
  React.useEffect(() => { if (hasActiveProductsChild) setIsProductsExpanded(true); }, [hasActiveProductsChild]);
  React.useEffect(() => { if (hasActiveMerchantListingsChild) setIsMerchantListingsExpanded(true); }, [hasActiveMerchantListingsChild]);
  React.useEffect(() => { if (hasActiveAttributesChild) setIsAttributesExpanded(true); }, [hasActiveAttributesChild]);
  React.useEffect(() => { if (hasActiveModifiersChild) setIsModifiersExpanded(true); }, [hasActiveModifiersChild]);
  React.useEffect(() => { if (hasActiveTagsChild) setIsTagsExpanded(true); }, [hasActiveTagsChild]);
  React.useEffect(() => { if (hasActiveOrderQueueChild) setIsOrderQueueExpanded(true); }, [hasActiveOrderQueueChild]);
  React.useEffect(() => { if (hasActiveDeliveryChild) setIsDeliveryExpanded(true); }, [hasActiveDeliveryChild]);
  React.useEffect(() => { if (hasActiveReviewsChild) setIsReviewsExpanded(true); }, [hasActiveReviewsChild]);
  React.useEffect(() => { if (hasActivePromotionsChild) setIsPromotionsExpanded(true); }, [hasActivePromotionsChild]);
  React.useEffect(() => { if (hasActiveCustomerActivityChild) setIsCustomerActivityExpanded(true); }, [hasActiveCustomerActivityChild]);
  React.useEffect(() => { if (hasActiveNotificationsChild) setIsNotificationsExpanded(true); }, [hasActiveNotificationsChild]);
  React.useEffect(() => { if (hasActivePlatformConfigChild) setIsPlatformConfigExpanded(true); }, [hasActivePlatformConfigChild]);

  const productType = searchParams.get('type');
  const accountTab = searchParams.get('tab');

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
        data-sidebar="admin"
        className={`fixed left-0 top-[57px] sm:top-[65px] bg-white dark:bg-[#171717] border-r border-gray-200 dark:border-[#262626] transition-all duration-300 overflow-y-auto sidebar-scroll z-50 lg:z-40
          w-64 h-[calc(100vh-57px)] sm:h-[calc(100vh-65px)] ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 ${isOpen ? 'lg:w-60' : 'lg:w-20'}`}
        onScroll={onScroll}
      >
      <div className="p-3 pb-20">
        <nav className="space-y-4">

          {/* Dashboard & Analytics */}
          <div className="space-y-1">
            <SidebarSectionLabel isOpen={expanded}>Dashboard & Analytics</SidebarSectionLabel>
            <SidebarItem icon="dashboard" label="Overview" active={exactActive(pathname, '/dashboard/overview') || exactActive(pathname, '/')} collapsed={!expanded} href="/dashboard/overview" />
            <SidebarItem icon="analytics" label="Analytics" active={dropdownActive(pathname, '/dashboard/analytics')} collapsed={!expanded} href="/dashboard/analytics" />
            <SidebarItem icon="reports" label="Reports" active={dropdownActive(pathname, '/dashboard/reports')} collapsed={!expanded} href="/dashboard/reports" />
          </div>

          {expanded && <hr className="border-gray-200 dark:border-[#262626]" />}

          {/* Vendors & Merchants */}
          <div className="space-y-1">
            <SidebarSectionLabel isOpen={expanded}>Vendors & Merchants</SidebarSectionLabel>

            <SidebarDropdownGroup
              icon="vendors"
              label="Vendors"
              isOpen={expanded}
              isExpanded={isVendorsExpanded}
              onToggle={() => setIsVendorsExpanded((c) => !c)}
              active={hasActiveVendorsChild}
            >
              {renderChildLink({ label: 'All Vendors', href: '/vendors', isActive: exactActive(pathname, '/vendors') })}
              {renderChildLink({ label: 'Verification & Compliance', href: '/vendors/verification', isActive: dropdownActive(pathname, '/vendors/verification') })}
              {renderChildLink({ label: 'Vendor Payouts Overview', href: '/vendors/payouts', isActive: dropdownActive(pathname, '/vendors/payouts') })}
            </SidebarDropdownGroup>

            <SidebarDropdownGroup
              icon="merchants"
              label="Merchants (Outlets)"
              isOpen={expanded}
              isExpanded={isMerchantsExpanded}
              onToggle={() => setIsMerchantsExpanded((c) => !c)}
              active={hasActiveMerchantsChild}
            >
              {renderChildLink({ label: 'All Outlets', href: '/merchants', isActive: exactActive(pathname, '/merchants') })}
              {renderChildLink({ label: 'Live Order Status', href: '/merchants/order-status', isActive: dropdownActive(pathname, '/merchants/order-status') })}
              {renderChildLink({ label: 'Operating Hours', href: '/merchants/operating-hours', isActive: dropdownActive(pathname, '/merchants/operating-hours') })}
              {renderChildLink({ label: 'Location & Coverage', href: '/merchants/locations', isActive: dropdownActive(pathname, '/merchants/locations') })}
            </SidebarDropdownGroup>

            <SidebarItem icon="categories" label="Merchant Categories" active={dropdownActive(pathname, '/merchant-categories')} collapsed={!expanded} href="/merchant-categories" />

            <SidebarDropdownGroup
              icon="shipping"
              label="Drivers (Fleet)"
              isOpen={expanded}
              isExpanded={isDriversExpanded}
              onToggle={() => setIsDriversExpanded((c) => !c)}
              active={hasActiveDriversChild}
            >
              {renderChildLink({ label: 'All Drivers', href: '/drivers', isActive: exactActive(pathname, '/drivers') })}
              {renderChildLink({ label: 'Driver Assignments', href: '/drivers/assignments', isActive: dropdownActive(pathname, '/drivers/assignments') })}
              {renderChildLink({ label: 'Availability Board', href: '/drivers/availability', isActive: dropdownActive(pathname, '/drivers/availability') })}
            </SidebarDropdownGroup>
          </div>

          {expanded && <hr className="border-gray-200 dark:border-[#262626]" />}

          {/* Catalog */}
          <div className="space-y-1">
            <SidebarSectionLabel isOpen={expanded}>Catalog</SidebarSectionLabel>

            <SidebarDropdownGroup
              icon="products"
              label="Product Manager"
              isOpen={expanded}
              isExpanded={isProductsExpanded}
              onToggle={() => setIsProductsExpanded((c) => !c)}
              active={hasActiveProductsChild}
            >
              {renderChildLink({ label: 'All Products', href: '/products', isActive: exactActive(pathname, '/products') })}
              {renderChildLink({ label: 'Simple Products', href: '/products?type=simple', isActive: exactActive(pathname, '/products') && productType === 'simple' })}
              {renderChildLink({ label: 'Variable Products', href: '/products?type=variable', isActive: exactActive(pathname, '/products') && productType === 'variable' })}
              {renderChildLink({ label: 'Grouped Products', href: '/products?type=grouped', isActive: exactActive(pathname, '/products') && productType === 'grouped' })}
            </SidebarDropdownGroup>

            <SidebarDropdownGroup
              icon="inventory"
              label="Merchant Listings"
              isOpen={expanded}
              isExpanded={isMerchantListingsExpanded}
              onToggle={() => setIsMerchantListingsExpanded((c) => !c)}
              active={hasActiveMerchantListingsChild}
            >
              {renderChildLink({ label: 'Merchant Products', href: '/merchant-products', isActive: exactActive(pathname, '/merchant-products') })}
              {renderChildLink({ label: 'Listing Approvals', href: '/merchant-products/pending', isActive: dropdownActive(pathname, '/merchant-products/pending') })}
            </SidebarDropdownGroup>

            <SidebarItem icon="categories" label="Product Categories" active={dropdownActive(pathname, '/product-categories')} collapsed={!expanded} href="/product-categories" />

            <SidebarDropdownGroup
              icon="settings"
              label="Attributes & Variations"
              isOpen={expanded}
              isExpanded={isAttributesExpanded}
              onToggle={() => setIsAttributesExpanded((c) => !c)}
              active={hasActiveAttributesChild}
            >
              {renderChildLink({ label: 'Attributes', href: '/catalog/attributes', isActive: dropdownActive(pathname, '/catalog/attributes') })}
              {renderChildLink({ label: 'Attribute Terms', href: '/catalog/attribute-terms', isActive: dropdownActive(pathname, '/catalog/attribute-terms') })}
              {renderChildLink({ label: 'Variations', href: '/catalog/variations', isActive: dropdownActive(pathname, '/catalog/variations') })}
              {renderChildLink({ label: 'Variation Values', href: '/catalog/variation-values', isActive: dropdownActive(pathname, '/catalog/variation-values') })}
              {renderChildLink({ label: 'Grouped Items', href: '/catalog/grouped-items', isActive: dropdownActive(pathname, '/catalog/grouped-items') })}
            </SidebarDropdownGroup>

            <SidebarDropdownGroup
              icon="modifiers"
              label="Modifiers (Add-ons)"
              isOpen={expanded}
              isExpanded={isModifiersExpanded}
              onToggle={() => setIsModifiersExpanded((c) => !c)}
              active={hasActiveModifiersChild}
            >
              {renderChildLink({ label: 'Modifier Groups', href: '/catalog/modifier-groups', isActive: dropdownActive(pathname, '/catalog/modifier-groups') })}
              {renderChildLink({ label: 'Modifier Options', href: '/catalog/modifier-options', isActive: dropdownActive(pathname, '/catalog/modifier-options') })}
              {renderChildLink({ label: 'Variation Modifier Rules', href: '/catalog/variation-modifiers', isActive: dropdownActive(pathname, '/catalog/variation-modifiers') })}
              {renderChildLink({ label: 'Global Overrides', href: '/catalog/modifier-overrides', isActive: dropdownActive(pathname, '/catalog/modifier-overrides') })}
            </SidebarDropdownGroup>

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

          {/* Orders */}
          <div className="space-y-1">
            <SidebarSectionLabel isOpen={expanded}>Orders</SidebarSectionLabel>

            <SidebarItem icon="orders" label="All Orders" active={exactActive(pathname, '/orders')} collapsed={!expanded} href="/orders" />

            <SidebarDropdownGroup
              icon="orders"
              label="Order Queue"
              isOpen={expanded}
              isExpanded={isOrderQueueExpanded}
              onToggle={() => setIsOrderQueueExpanded((c) => !c)}
              active={hasActiveOrderQueueChild}
            >
              {renderChildLink({ label: 'Pending', href: '/orders/pending', isActive: dropdownActive(pathname, '/orders/pending') })}
              {renderChildLink({ label: 'Preparing', href: '/orders/preparing', isActive: dropdownActive(pathname, '/orders/preparing') })}
              {renderChildLink({ label: 'Ready for Pickup', href: '/orders/ready-for-pickup', isActive: dropdownActive(pathname, '/orders/ready-for-pickup') })}
              {renderChildLink({ label: 'On Delivery', href: '/orders/on-delivery', isActive: dropdownActive(pathname, '/orders/on-delivery') })}
              {renderChildLink({ label: 'Cancelled / Issues', href: '/orders/cancelled', isActive: dropdownActive(pathname, '/orders/cancelled') })}
            </SidebarDropdownGroup>

            <SidebarItem icon="pages" label="Order Items" active={dropdownActive(pathname, '/order-items')} collapsed={!expanded} href="/order-items" />
            <SidebarItem icon="audit" label="Order Tracking History" active={dropdownActive(pathname, '/order-tracking')} collapsed={!expanded} href="/order-tracking" />

            <SidebarDropdownGroup
              icon="shipping"
              label="Delivery & Logistics"
              isOpen={expanded}
              isExpanded={isDeliveryExpanded}
              onToggle={() => setIsDeliveryExpanded((c) => !c)}
              active={hasActiveDeliveryChild}
            >
              {renderChildLink({ label: 'Delivery Bookings (Lalamove)', href: '/delivery/bookings', isActive: dropdownActive(pathname, '/delivery/bookings') })}
              {renderChildLink({ label: 'Delivery Locations', href: '/delivery/locations', isActive: dropdownActive(pathname, '/delivery/locations') })}
              {renderChildLink({ label: 'Live Tracking', href: '/delivery/tracking', isActive: dropdownActive(pathname, '/delivery/tracking') })}
            </SidebarDropdownGroup>

            <SidebarDropdownGroup
              icon="reviews"
              label="Reviews & Ratings"
              isOpen={expanded}
              isExpanded={isReviewsExpanded}
              onToggle={() => setIsReviewsExpanded((c) => !c)}
              active={hasActiveReviewsChild}
            >
              {renderChildLink({ label: 'All Reviews', href: '/reviews', isActive: exactActive(pathname, '/reviews') })}
              {renderChildLink({ label: 'Flagged Reviews', href: '/reviews/flagged', isActive: dropdownActive(pathname, '/reviews/flagged') })}
            </SidebarDropdownGroup>
          </div>

          {expanded && <hr className="border-gray-200 dark:border-[#262626]" />}

          {/* Finance */}
          <div className="space-y-1">
            <SidebarSectionLabel isOpen={expanded}>Finance</SidebarSectionLabel>

            <SidebarItem icon="payments" label="Transactions" active={dropdownActive(pathname, '/transactions')} collapsed={!expanded} href="/transactions" />
            <SidebarItem icon="billing" label="Refunds & Failures" active={dropdownActive(pathname, '/transactions/refunds')} collapsed={!expanded} href="/transactions/refunds" />

            <SidebarDropdownGroup
              icon="campaigns"
              label="Promotions"
              isOpen={expanded}
              isExpanded={isPromotionsExpanded}
              onToggle={() => setIsPromotionsExpanded((c) => !c)}
              active={hasActivePromotionsChild}
            >
              {renderChildLink({ label: 'Order Discounts', href: '/promotions/discounts', isActive: dropdownActive(pathname, '/promotions/discounts') })}
              {renderChildLink({ label: 'Coupon Usage Report', href: '/promotions/usage', isActive: dropdownActive(pathname, '/promotions/usage') })}
            </SidebarDropdownGroup>
          </div>

          {expanded && <hr className="border-gray-200 dark:border-[#262626]" />}

          {/* Customers */}
          <div className="space-y-1">
            <SidebarSectionLabel isOpen={expanded}>Customers</SidebarSectionLabel>

            <SidebarItem icon="customers" label="All Customers" active={exactActive(pathname, '/customers')} collapsed={!expanded} href="/customers" />
            <SidebarItem icon="pages" label="Customer Addresses" active={dropdownActive(pathname, '/customers/addresses')} collapsed={!expanded} href="/customers/addresses" />
            <SidebarItem icon="support" label="Emergency Contacts" active={dropdownActive(pathname, '/customers/emergency-contacts')} collapsed={!expanded} href="/customers/emergency-contacts" />

            <SidebarDropdownGroup
              icon="activity"
              label="Customer Activity"
              isOpen={expanded}
              isExpanded={isCustomerActivityExpanded}
              onToggle={() => setIsCustomerActivityExpanded((c) => !c)}
              active={hasActiveCustomerActivityChild}
            >
              {renderChildLink({ label: 'Wishlists', href: '/activity/wishlists', isActive: dropdownActive(pathname, '/activity/wishlists') })}
              {renderChildLink({ label: 'Carts (Abandoned)', href: '/activity/carts', isActive: dropdownActive(pathname, '/activity/carts') })}
              {renderChildLink({ label: 'Recent Searches', href: '/activity/searches', isActive: dropdownActive(pathname, '/activity/searches') })}
              {renderChildLink({ label: 'Recently Viewed', href: '/activity/views', isActive: dropdownActive(pathname, '/activity/views') })}
            </SidebarDropdownGroup>
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
              {renderChildLink({ label: 'User Notifications', href: '/notifications', isActive: exactActive(pathname, '/notifications') })}
              {renderChildLink({ label: 'Templates', href: '/notifications/templates', isActive: dropdownActive(pathname, '/notifications/templates') })}
              {renderChildLink({ label: 'Event Log', href: '/notifications/events', isActive: dropdownActive(pathname, '/notifications/events') })}
            </SidebarDropdownGroup>

            <SidebarItem icon="campaigns" label="Announcements" active={dropdownActive(pathname, '/announcements')} collapsed={!expanded} href="/announcements" />
          </div>

          {expanded && <hr className="border-gray-200 dark:border-[#262626]" />}

          {/* Content & Media */}
          <div className="space-y-1">
            <SidebarSectionLabel isOpen={expanded}>Content & Media</SidebarSectionLabel>
            <SidebarItem icon="media" label="Media Library" active={dropdownActive(pathname, '/media')} collapsed={!expanded} href="/media" />
            <SidebarItem icon="posts" label="Blog Posts" active={dropdownActive(pathname, '/posts')} collapsed={!expanded} href="/posts" />
          </div>

          {expanded && <hr className="border-gray-200 dark:border-[#262626]" />}

          {/* Account */}
          <div className="space-y-1">
            <SidebarSectionLabel isOpen={expanded}>Account</SidebarSectionLabel>
            <SidebarItem icon="profile" label="Your Profile" active={exactActive(pathname, '/profile') && accountTab !== 'settings'} collapsed={!expanded} href="/profile" />
            <SidebarItem icon="settings" label="Account Settings" active={exactActive(pathname, '/profile') && accountTab === 'settings'} collapsed={!expanded} href="/profile?tab=settings" />
            <SidebarItem icon="users" label="Admin Accounts" active={dropdownActive(pathname, '/admins')} collapsed={!expanded} href="/admins" />
          </div>

          {expanded && <hr className="border-gray-200 dark:border-[#262626]" />}

          {/* System Settings */}
          <div className="space-y-1">
            <SidebarSectionLabel isOpen={expanded}>System Settings</SidebarSectionLabel>

            <SidebarDropdownGroup
              icon="integrations"
              label="Platform Configuration"
              isOpen={expanded}
              isExpanded={isPlatformConfigExpanded}
              onToggle={() => setIsPlatformConfigExpanded((c) => !c)}
              active={hasActivePlatformConfigChild}
            >
              {renderChildLink({ label: 'General & Maintenance Mode', href: '/settings/general', isActive: dropdownActive(pathname, '/settings/general') })}
              {renderChildLink({ label: 'Delivery Provider (Lalamove/Native)', href: '/settings/delivery', isActive: dropdownActive(pathname, '/settings/delivery') })}
              {renderChildLink({ label: 'Payment Gateway (PayMongo)', href: '/settings/payments', isActive: dropdownActive(pathname, '/settings/payments') })}
            </SidebarDropdownGroup>

            <SidebarItem icon="security" label="Security" active={dropdownActive(pathname, '/settings/security')} collapsed={!expanded} href="/settings/security" />
            <SidebarItem icon="audit" label="User Events / Audit Logs" active={dropdownActive(pathname, '/settings/audit')} collapsed={!expanded} href="/settings/audit" />
          </div>

        </nav>
      </div>
    </aside>
    </>
  );
}
