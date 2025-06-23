import Link from 'next/link';
import { HomeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="text-8xl font-bold text-orange-500 mb-4">404</div>
          <div className="w-24 h-24 mx-auto mb-6 bg-orange-100 rounded-full flex items-center justify-center">
            <svg 
              className="w-12 h-12 text-orange-500" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-3-8a8 8 0 018 8 8 8 0 01-8 8 8 8 0 01-8-8 8 8 0 018-8z" 
              />
            </svg>
          </div>
        </div>

        {/* Content */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Page Not Found
        </h1>
        <p className="text-gray-600 mb-8">
          Sorry, we couldn't find the page you're looking for. 
          It might have been moved, deleted, or you entered the wrong URL.
        </p>

        {/* Actions */}
        <div className="space-y-4">
          <Link
            href="/"
            className="inline-flex items-center justify-center w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            {React.createElement(HomeIcon as any, { className: "w-5 h-5 mr-2" })}
            Go Home
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            {React.createElement(ArrowLeftIcon as any, { className: "w-5 h-5 mr-2" })}
            Go Back
          </button>
        </div>

        {/* Help Links */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">Need help?</p>
          <div className="flex justify-center space-x-6 text-sm">
            <Link 
              href="/search" 
              className="text-orange-500 hover:text-orange-600 transition-colors"
            >
              Search
            </Link>
            <Link 
              href="/vendors" 
              className="text-orange-500 hover:text-orange-600 transition-colors"
            >
              Restaurants
            </Link>
            <Link 
              href="/profile" 
              className="text-orange-500 hover:text-orange-600 transition-colors"
            >
              Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
