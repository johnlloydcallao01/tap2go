'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import {
  ArrowLeftIcon,
  BellIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  QuestionMarkCircleIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

export default function SettingsPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container-custom py-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Please sign in to view settings</h1>
            <Link href="/auth/signin" className="btn-primary">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const settingsGroups = [
    {
      title: 'Account',
      items: [
        {
          icon: BellIcon,
          label: 'Notifications',
          href: '/account/settings/notifications',
          description: 'Manage your notification preferences'
        },
        {
          icon: ShieldCheckIcon,
          label: 'Privacy & Security',
          href: '/account/settings/privacy',
          description: 'Password, data, and security settings'
        },
        {
          icon: GlobeAltIcon,
          label: 'Language & Region',
          href: '/account/settings/language',
          description: 'Change language and location settings'
        }
      ]
    },
    {
      title: 'Support',
      items: [
        {
          icon: QuestionMarkCircleIcon,
          label: 'Help Center',
          href: '/help',
          description: 'Get help and support'
        },
        {
          icon: DocumentTextIcon,
          label: 'Terms & Conditions',
          href: '/terms',
          description: 'Read our terms and conditions'
        },
        {
          icon: ExclamationTriangleIcon,
          label: 'Report a Problem',
          href: '/report',
          description: 'Report issues or provide feedback'
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="px-4 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/account" className="p-1">
              <ArrowLeftIcon className="h-6 w-6 text-gray-600" />
            </Link>
            <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
          </div>
        </div>
      </header>

      <div className="px-4 py-6">
        {settingsGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{group.title}</h2>
            <div className="space-y-2">
              {group.items.map((item, itemIndex) => (
                <Link
                  key={itemIndex}
                  href={item.href}
                  className="bg-white rounded-lg p-4 flex items-center justify-between hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center space-x-3">
                    <item.icon className="h-6 w-6 text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-900">{item.label}</p>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                  </div>
                  <span className="text-gray-400">›</span>
                </Link>
              ))}
            </div>
          </div>
        ))}

        {/* App Version */}
        <div className="text-center text-gray-500 text-sm mt-8">
          <p>Tap2Go v1.0.0</p>
          <p>© 2024 Tap2Go. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
