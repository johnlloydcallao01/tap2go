'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  StarIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

interface Review {
  id: string;
  restaurantName: string;
  restaurantId: string;
  orderNumber: string;
  rating: number;
  title: string;
  comment: string;
  images?: string[];
  date: Date;
  helpful: number;
  response?: {
    text: string;
    date: Date;
  };
}

export default function ReviewsContent() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'published'>('all');

  useEffect(() => {
    // Simulate loading reviews data
    setTimeout(() => {
      setReviews([
        {
          id: '1',
          restaurantName: 'Pizza Palace',
          restaurantId: 'rest_1',
          orderNumber: 'ORD-2024-001',
          rating: 5,
          title: 'Amazing pizza and fast delivery!',
          comment: 'The Margherita pizza was absolutely delicious. Fresh ingredients, perfect crust, and arrived hot. The garlic bread was also fantastic. Will definitely order again!',
          images: ['/api/placeholder/200/150', '/api/placeholder/200/150'],
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          helpful: 12,
          response: {
            text: 'Thank you so much for your wonderful review! We\'re thrilled you enjoyed our Margherita pizza. We look forward to serving you again soon!',
            date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          },
        },
        {
          id: '2',
          restaurantName: 'Burger Junction',
          restaurantId: 'rest_2',
          orderNumber: 'ORD-2024-002',
          rating: 4,
          title: 'Great burgers, could be warmer',
          comment: 'The Classic Burger was really tasty with fresh ingredients. The fries were crispy and well-seasoned. Only issue was that the food arrived a bit lukewarm, but still enjoyable overall.',
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          helpful: 8,
        },
        {
          id: '3',
          restaurantName: 'Sushi Zen',
          restaurantId: 'rest_3',
          orderNumber: 'ORD-2024-003',
          rating: 5,
          title: 'Best sushi in town!',
          comment: 'Absolutely incredible sushi! The fish was incredibly fresh, the rice was perfectly seasoned, and the presentation was beautiful. The delivery was also very fast.',
          images: ['/api/placeholder/200/150'],
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          helpful: 15,
          response: {
            text: 'Arigato gozaimasu! We\'re honored to be your favorite sushi spot. Our chefs take great pride in using only the freshest ingredients.',
            date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
          },
        },
        {
          id: '4',
          restaurantName: 'Taco Fiesta',
          restaurantId: 'rest_4',
          orderNumber: 'ORD-2024-004',
          rating: 3,
          title: 'Decent tacos, room for improvement',
          comment: 'The tacos were okay but not exceptional. The meat was a bit dry and could use more seasoning. The guacamole was fresh though. Service was quick.',
          date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          helpful: 3,
        },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIconSolid
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const filteredReviews = reviews.filter(review => {
    if (filter === 'all') return true;
    if (filter === 'pending') return !review.response;
    if (filter === 'published') return !!review.response;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Reviews</h1>
            <p className="text-gray-600">Share your dining experiences and help others discover great food</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-orange-600">{reviews.length}</p>
            <p className="text-sm text-gray-500">Total Reviews</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {[
            { key: 'all', label: 'All Reviews', count: reviews.length },
            { key: 'published', label: 'Published', count: reviews.filter(r => r.response).length },
            { key: 'pending', label: 'Pending Response', count: reviews.filter(r => !r.response).length },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as 'all' | 'pending' | 'published')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                filter === tab.key
                  ? 'bg-white text-orange-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.length > 0 ? (
          filteredReviews.map((review) => (
            <div key={review.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              {/* Review Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-semibold text-gray-900">{review.restaurantName}</h3>
                    {renderStars(review.rating)}
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">{formatDate(review.date)}</span>
                  </div>
                  <p className="text-sm text-gray-500">Order #{review.orderNumber}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Review Content */}
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">{review.title}</h4>
                <p className="text-gray-700 leading-relaxed">{review.comment}</p>
              </div>

              {/* Review Images */}
              {review.images && review.images.length > 0 && (
                <div className="flex space-x-3 mb-4">
                  {review.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <Image
                        src={image}
                        alt={`Review image ${index + 1}`}
                        width={80}
                        height={80}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-opacity flex items-center justify-center">
                        <EyeIcon className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Review Stats */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <button className="flex items-center space-x-1 text-gray-500 hover:text-red-600 transition-colors">
                    <HeartIcon className="h-4 w-4" />
                    <span className="text-sm">{review.helpful} helpful</span>
                  </button>
                </div>
              </div>

              {/* Restaurant Response */}
              {review.response && (
                <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-orange-500">
                  <div className="flex items-start space-x-3">
                    <ChatBubbleLeftIcon className="h-5 w-5 text-orange-600 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-gray-900">Restaurant Response</span>
                        <span className="text-sm text-gray-500">•</span>
                        <span className="text-sm text-gray-500">{formatDate(review.response.date)}</span>
                      </div>
                      <p className="text-gray-700">{review.response.text}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <StarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
            <p className="text-gray-500 mb-6">
              {filter === 'all' 
                ? 'Start ordering and share your experiences with others!'
                : `No ${filter} reviews found.`}
            </p>
            <a
              href="/restaurants"
              className="inline-block bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Start Ordering
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
