'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import SearchField from '@/components/ui/SearchField';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function SearchModal({ isOpen, onClose }: Props) {
  const [isMobile, setIsMobile] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const checkScreenSize = () => setIsMobile(window.innerWidth < 1024);
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    if (isOpen && isMobile) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [isOpen, isMobile]);

  if (!isOpen || !isMobile) return null;

  const overlay = (
    <div
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh', backgroundColor: 'white', zIndex: 99999 }}
    >
      <div className="w-full h-full flex flex-col bg-white" data-modal-content>
        <div className="px-4 py-3 border-b border-gray-100 flex items-center">
          <button
            onClick={onClose}
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors mr-3"
            aria-label="Close"
          >
            <svg className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex-1">
            <SearchField
              placeholder="Search for restaurants and foods"
              value={query}
              onChange={setQuery}
              inputClassName="pl-10 pr-4 py-3 bg-gray-50 border-0 rounded-xl text-base placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white"
            />
          </div>
        </div>
        <div className="flex-1 px-4 py-4 overflow-y-auto" />
      </div>
    </div>
  );

  return createPortal(overlay as any, document.body as any) as any;
}
