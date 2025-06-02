'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

interface UploadedImage {
  url: string;
  publicId: string;
}

// Cloudinary Upload Widget types (using types from CloudinaryUploadWidget component)

export default function CloudinaryTestPage() {
  const [lastUploadedImage, setLastUploadedImage] = useState<UploadedImage | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isWidgetLoaded, setIsWidgetLoaded] = useState(false);
  const widgetRef = useRef<any>(null);

  // Load Cloudinary Upload Widget script
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.cloudinary) {
      const script = document.createElement('script');
      script.src = 'https://upload-widget.cloudinary.com/global/all.js';
      script.async = true;
      script.onload = () => {
        console.log('Cloudinary Upload Widget loaded');
        setIsWidgetLoaded(true);
      };
      script.onerror = () => {
        console.error('Failed to load Cloudinary Upload Widget');
        setError('Failed to load upload widget');
      };
      document.body.appendChild(script);
    } else if (window.cloudinary) {
      setIsWidgetLoaded(true);
    }
  }, []);

  // Initialize upload widget
  useEffect(() => {
    if (!isWidgetLoaded || !window.cloudinary || widgetRef.current) return;

    try {
      widgetRef.current = window.cloudinary.createUploadWidget(
        {
          cloudName: 'dpekh75yi',
          uploadPreset: 'tap2go_test', // We'll create this preset
          sources: ['local', 'camera'],
          multiple: false,
          maxFiles: 1,
          maxFileSize: 10000000, // 10MB
          folder: 'test-uploads',
          resourceType: 'image',
          clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
          cropping: false,
          showAdvancedOptions: false,
          theme: 'minimal',
          styles: {
            palette: {
              window: '#FFFFFF',
              windowBorder: '#90A0B3',
              tabIcon: '#f3a823',
              menuIcons: '#5A616A',
              textDark: '#000000',
              textLight: '#FFFFFF',
              link: '#f3a823',
              action: '#f3a823',
              inactiveTabIcon: '#0E2F5A',
              error: '#F44235',
              inProgress: '#0078FF',
              complete: '#20B832',
              sourceBg: '#E4EBF1'
            }
          }
        },
        (error: any, result: any) => {
          console.log('Widget callback - Error:', error, 'Result:', result);

          if (error) {
            console.error('Upload error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            setError(`Upload failed: ${errorMessage}`);
            setIsLoading(false);
            return;
          }

          if (result && result.event === 'upload-added') {
            console.log('Upload started');
            setIsLoading(true);
            setError(null);
          }

          if (result && result.event === 'success' && result.info) {
            console.log('Upload successful:', result.info);
            setLastUploadedImage({
              url: result.info.secure_url,
              publicId: result.info.public_id
            });
            setIsLoading(false);
          }

          if (result && result.event === 'close') {
            console.log('Widget closed');
            setIsLoading(false);
          }

          if (result && result.event === 'error') {
            console.error('Upload failed:', result.info);
            setError(`Upload failed: ${result.info?.error?.message || 'Unknown error'}`);
            setIsLoading(false);
          }
        }
      );
      console.log('Upload widget initialized');
    } catch (err) {
      console.error('Error initializing widget:', err);
      setError('Failed to initialize upload widget');
    }
  }, [isWidgetLoaded]);

  const handleUploadClick = () => {
    if (!widgetRef.current) {
      setError('Upload widget not ready');
      return;
    }

    setError(null);
    widgetRef.current.open();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            🌤️ Cloudinary Image Upload Test
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Test image uploads using server-side API with automatic optimization and transformations.
          </p>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
            📤 Cloudinary Image Upload Test
          </h2>

          <div className="flex flex-col items-center">
            <button
              onClick={handleUploadClick}
              disabled={isLoading || !isWidgetLoaded}
              className={`
                px-8 py-4 rounded-lg font-semibold text-white transition-all duration-200
                ${isLoading || !isWidgetLoaded
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-[#f3a823] hover:bg-[#ef7b06] shadow-lg hover:shadow-xl'
                }
              `}
            >
              {!isWidgetLoaded ? (
                'Loading Upload Widget...'
              ) : isLoading ? (
                <div className="flex items-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Uploading...
                </div>
              ) : (
                '📁 Select Image to Upload'
              )}
            </button>

            <p className="text-sm text-gray-500 mt-4 text-center">
              Supports: JPG, PNG, WebP, GIF (max 10MB)<br />
              Uses Cloudinary Upload Widget
            </p>

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg max-w-md">
                <p className="text-red-600 text-sm">
                  <strong>Error:</strong> {error}
                </p>
                <p className="text-red-500 text-xs mt-2">
                  If you see &quot;Upload preset not found&quot;, you need to create an upload preset named &quot;tap2go_test&quot; in your Cloudinary dashboard.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Last Uploaded Image Section */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
            🖼️ That Last Uploaded Test Image
          </h2>

          {lastUploadedImage ? (
            <div className="space-y-6">
              {/* Image Display */}
              <div className="flex justify-center">
                <div className="relative w-full max-w-md aspect-square rounded-lg overflow-hidden shadow-lg">
                  <Image
                    src={lastUploadedImage.url}
                    alt="Last uploaded image"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
              </div>

              {/* Image Details */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Upload Details:</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Public ID:</span>
                    <span className="ml-2 text-gray-600 font-mono break-all">{lastUploadedImage.publicId}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Cloudinary URL:</span>
                    <span className="ml-2 text-blue-600 font-mono break-all">{lastUploadedImage.url}</span>
                  </div>
                  <div className="pt-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      ✅ Successfully uploaded to Cloudinary
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-4xl text-gray-400">📷</span>
              </div>
              <p className="text-gray-500 text-lg">No image uploaded yet</p>
              <p className="text-gray-400 text-sm mt-2">
                Upload an image above to see it displayed here
              </p>
            </div>
          )}
        </div>
      </div>
    </div>

  );
}
