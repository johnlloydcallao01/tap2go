'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

// Import all native account content components
import DashboardContent from '@/components/account/DashboardContent';
import ProfileContent from '@/components/account/ProfileContent';
import OrdersContent from '@/components/account/OrdersContent';
import TrackOrderContent from '@/components/account/TrackOrderContent';
import FavoritesContent from '@/components/account/FavoritesContent';
import ReviewsContent from '@/components/account/ReviewsContent';
import AddressesContent from '@/components/account/AddressesContent';
import PaymentContent from '@/components/account/PaymentContent';
import LoyaltyContent from '@/components/account/LoyaltyContent';
import PromotionsContent from '@/components/account/PromotionsContent';
import ReferralsContent from '@/components/account/ReferralsContent';
import HelpCenterContent from '@/components/account/HelpCenterContent';
import ContactSupportContent from '@/components/account/ContactSupportContent';
import NotificationsContent from '@/components/account/NotificationsContent';
import SettingsContent from '@/components/account/SettingsContent';



export default function AccountContent() {
  const pathname = usePathname();

  // Render the appropriate account content based on the current path
  const renderAccountContent = () => {
    switch (pathname) {
      case '/account':
      case '/account/dashboard':
        return <DashboardContent />;
      case '/account/profile':
        return <ProfileContent />;
      case '/account/orders':
        return <OrdersContent />;
      case '/account/orders/track':
        return <TrackOrderContent />;
      case '/account/favorites':
        return <FavoritesContent />;
      case '/account/reviews':
        return <ReviewsContent />;
      case '/account/addresses':
        return <AddressesContent />;
      case '/account/payment':
        return <PaymentContent />;
      case '/account/loyalty':
        return <LoyaltyContent />;
      case '/account/promotions':
        return <PromotionsContent />;
      case '/account/referrals':
        return <ReferralsContent />;
      case '/account/help':
        return <HelpCenterContent />;
      case '/account/support':
        return <ContactSupportContent />;
      case '/account/notifications':
        return <NotificationsContent />;
      case '/account/settings':
        return <SettingsContent />;
      default:
        return <DashboardContent />; // Default to dashboard
    }
  };

  return (
    <div className="space-y-8">
      {renderAccountContent()}
    </div>
  );
}
