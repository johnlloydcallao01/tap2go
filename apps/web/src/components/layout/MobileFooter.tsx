'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

/**
 * Mobile app-like sticky footer navigation
 * Only visible on mobile devices (hidden on tablet and desktop)
 */
export function MobileFooter() {
  const router = useRouter();
  const pathname = usePathname();
  const [quantity, setQuantity] = useState(1);
  const isProductPage = pathname.startsWith('/merchant/') && pathname.split('/').length === 4;

  const navigationItems = [
    {
      id: 'home',
      label: 'Home',
      icon: <i className="fa fa-home text-lg"></i>,
      path: '/',
    },
    {
      id: 'wishlists',
      label: 'Wishlists',
      icon: <i className="fa fa-heart text-lg"></i>,
      path: '/wishlists',
    },
    {
      id: 'cart',
      label: 'Cart', // Cart label for shopping
      icon: <i className="fa fa-shopping-cart text-lg text-gray-600"></i>,
      path: '/cart',
      isHelp: true,
    },
    {
      id: 'orders',
      label: 'Orders',
      icon: <i className="fa fa-receipt text-lg"></i>,
      path: '/orders',
    },
    {
      id: 'menu',
      label: 'Menu',
      icon: <i className="fa fa-layer-group text-lg"></i>,
      path: '/menu',
    },
  ];

  const handleNavigation = (path: string) => {
    router.push(path as any);
  };

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(path);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden h-[55px]">
      {isProductPage ? (
        <div className="flex items-center justify-between h-full px-4 gap-4">
          <div className="flex items-center">
            <button
              type="button"
              aria-label="Decrease quantity"
              onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
              className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center text-gray-700"
            >
              <span className="text-lg leading-none">−</span>
            </button>
            <span className="mx-3 text-base font-medium text-gray-900">{quantity}</span>
            <button
              type="button"
              aria-label="Increase quantity"
              onClick={() => setQuantity((prev) => Math.min(99, prev + 1))}
              className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center text-gray-700"
            >
              <span className="text-lg leading-none">+</span>
            </button>
          </div>
          <button
            type="button"
            className="flex-1 h-11 rounded-full font-semibold text-white text-sm shadow-md hover:shadow-lg transition-colors text-center"
            style={{ backgroundColor: '#eba236' }}
          >
            Add to cart
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-around h-full px-1">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.path)}
              className={`flex flex-col items-center justify-center transition-all duration-200 ${
                item.isHelp
                  ? 'relative'
                  : 'p-1'
              }`}
              aria-label={item.label || 'Help'}
            >
              {item.isHelp ? (
                <div className="flex flex-col items-center justify-center -mt-2">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg" style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb' }}>
                    {item.icon}
                  </div>
                  <span className="text-xs font-medium leading-none text-gray-600 mt-1">
                    {item.label}
                  </span>
                </div>
              ) : (
                <>
                  <div className={`mb-1 ${
                    isActive(item.path) ? 'text-black' : 'text-gray-600'
                  }`}>
                    {item.icon}
                  </div>
                  {item.label && (
                    <span className={`text-xs font-medium leading-none ${
                      isActive(item.path) ? 'text-black' : 'text-gray-600'
                    }`}>
                      {item.label}
                    </span>
                  )}
                </>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
