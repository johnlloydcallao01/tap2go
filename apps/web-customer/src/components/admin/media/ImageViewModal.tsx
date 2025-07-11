'use client';

import React from 'react';

import { useEffect } from 'react';
import Image from 'next/image';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import type { MediaFile } from '@/lib/services/mediaLibraryService';

interface ImageViewModalProps {
  file: MediaFile | null;
  isOpen: boolean;
  onClose: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
}

export default function ImageViewModal({
  file,
  isOpen,
  onClose,
  onPrevious,
  onNext,
  hasPrevious = false,
  hasNext = false
}: ImageViewModalProps) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!file) return null;

  return (
    <Transition appear show={isOpen} as="div">
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as="div"
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-90" />
        </Transition.Child>

        <div className="fixed inset-0">
          <div className="flex min-h-full items-center justify-center p-6">
            <Transition.Child
              as="div"
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full h-full max-w-[95vw] max-h-[95vh] transform overflow-hidden rounded-lg bg-white shadow-xl transition-all flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b bg-white">
                  <div className="flex items-center space-x-4">
                    <Dialog.Title as="h3" className="text-lg font-semibold text-gray-900">
                      Attachment details
                    </Dialog.Title>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Previous/Next Navigation */}
                    {(hasPrevious || hasNext) && (
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={onPrevious}
                          disabled={!hasPrevious}
                          className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Previous"
                        >
                          <ChevronLeftIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={onNext}
                          disabled={!hasNext}
                          className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Next"
                        >
                          <ChevronRightIcon className="h-5 w-5" />
                        </button>
                      </div>
                    )}

                    {/* Close Button */}
                    <button
                      type="button"
                      className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      onClick={onClose}
                    >
                      <span className="sr-only">Close</span>
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex overflow-hidden">
                  {/* Left Side - Image */}
                  <div className="flex-1 flex items-center justify-center bg-gray-50 p-6">
                    <div className="max-w-full max-h-full flex items-center justify-center">
                      <Image
                        src={file.file_url}
                        alt={file.alt_text || file.filename}
                        width={file.width || 800}
                        height={file.height || 600}
                        className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                        unoptimized
                      />
                    </div>
                  </div>

                  {/* Right Side - Details */}
                  <div className="w-80 bg-white border-l overflow-y-auto">
                    <div className="p-6 space-y-6">
                      {/* File Info */}
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700">Uploaded on:</label>
                          <p className="text-sm text-gray-600">{formatDate(file.created_at)}</p>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-gray-700">Uploaded by:</label>
                          <p className="text-sm text-gray-600">{file.uploaded_by}</p>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-gray-700">File name:</label>
                          <p className="text-sm text-gray-600 break-all">{file.filename}</p>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-gray-700">File type:</label>
                          <p className="text-sm text-gray-600">{file.mime_type}</p>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-gray-700">File size:</label>
                          <p className="text-sm text-gray-600">{formatFileSize(file.file_size)}</p>
                        </div>

                        {file.width && file.height && (
                          <div>
                            <label className="text-sm font-medium text-gray-700">Dimensions:</label>
                            <p className="text-sm text-gray-600">{file.width} by {file.height} pixels</p>
                          </div>
                        )}
                      </div>

                      {/* Alternative Text */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Alternative Text
                        </label>
                        <textarea
                          value={file.alt_text || ''}
                          placeholder="Leave empty if the image is purely decorative."
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-orange-500 focus:border-orange-500"
                          rows={3}
                          readOnly
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Learn how to describe the purpose of the image
                        </p>
                      </div>

                      {/* Title */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Title
                        </label>
                        <input
                          type="text"
                          value={file.title || file.filename}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-orange-500 focus:border-orange-500"
                          readOnly
                        />
                      </div>

                      {/* Caption */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Caption
                        </label>
                        <textarea
                          value={file.caption || ''}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-orange-500 focus:border-orange-500"
                          rows={3}
                          readOnly
                        />
                      </div>

                      {/* Description */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description
                        </label>
                        <textarea
                          value={file.description || ''}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-orange-500 focus:border-orange-500"
                          rows={4}
                          readOnly
                        />
                      </div>

                      {/* File URL */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          File URL
                        </label>
                        <input
                          type="text"
                          value={file.file_url}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-orange-500 focus:border-orange-500 bg-gray-50"
                          readOnly
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

// Helper functions
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}
