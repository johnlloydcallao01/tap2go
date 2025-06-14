'use client';

import React, { useState, useEffect } from 'react';
import {
  StarIcon,
  ChatBubbleLeftRightIcon,
  FunnelIcon,
  MagnifyingGlassIcon,

  CheckCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import Link from 'next/link';

interface Review {
  id: string;
  customerName: string;
  customerAvatar?: string;
  rating: number;
  title: string;
  comment: string;
  orderNumber: string;
  orderItems: string[];
  reviewDate: string;
  isVerified: boolean;
  hasResponse: boolean;
  response?: {
    message: string;
    responseDate: string;
  };
  isHelpful: number;
  isReported: boolean;
}

interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: Array<{ rating: number; count: number; percentage: number }>;
  responseRate: number;
  recentTrend: 'up' | 'down' | 'stable';
}

const mockReviews: Review[] = [
  {
    id: '1',
    customerName: 'Sarah Johnson',
    customerAvatar: '/api/placeholder/40/40',
    rating: 5,
    title: 'Excellent pizza and fast delivery!',
    comment: 'Ordered the Margherita pizza and it was absolutely delicious. The crust was perfect, toppings were fresh, and delivery was faster than expected. Will definitely order again!',
    orderNumber: 'ORD-2024-001',
    orderItems: ['Margherita Pizza', 'Caesar Salad'],
    reviewDate: '2024-01-20',
    isVerified: true,
    hasResponse: true,
    response: {
      message: 'Thank you so much for your wonderful review, Sarah! We\'re thrilled you enjoyed our Margherita pizza. We look forward to serving you again soon!',
      responseDate: '2024-01-21',
    },
    isHelpful: 12,
    isReported: false,
  },
  {
    id: '2',
    customerName: 'Mike Davis',
    rating: 4,
    title: 'Good food, delivery was a bit slow',
    comment: 'The pizza was really good and the wings were crispy. However, the delivery took longer than the estimated time. Food was still warm when it arrived though.',
    orderNumber: 'ORD-2024-002',
    orderItems: ['Pepperoni Pizza', 'Chicken Wings'],
    reviewDate: '2024-01-19',
    isVerified: true,
    hasResponse: false,
    isHelpful: 8,
    isReported: false,
  },
  {
    id: '3',
    customerName: 'Emily Wilson',
    customerAvatar: '/api/placeholder/40/40',
    rating: 5,
    title: 'Amazing vegetarian options!',
    comment: 'As a vegetarian, I was impressed with the variety and quality of veggie options. The vegetarian pizza was loaded with fresh vegetables and the garlic bread was perfect.',
    orderNumber: 'ORD-2024-003',
    orderItems: ['Vegetarian Pizza', 'Garlic Bread'],
    reviewDate: '2024-01-18',
    isVerified: true,
    hasResponse: true,
    response: {
      message: 'We\'re so happy you enjoyed our vegetarian options, Emily! We take pride in offering fresh, quality ingredients for all our customers.',
      responseDate: '2024-01-19',
    },
    isHelpful: 15,
    isReported: false,
  },
  {
    id: '4',
    customerName: 'John Smith',
    rating: 2,
    title: 'Order arrived cold',
    comment: 'Unfortunately, my order arrived cold and the pizza was soggy. The driver seemed to have trouble finding my address. Not the experience I was hoping for.',
    orderNumber: 'ORD-2024-004',
    orderItems: ['Hawaiian Pizza'],
    reviewDate: '2024-01-17',
    isVerified: true,
    hasResponse: true,
    response: {
      message: 'We sincerely apologize for this experience, John. This is not the standard we strive for. We\'ve addressed the delivery issue and would love to make it right. Please contact us directly.',
      responseDate: '2024-01-18',
    },
    isHelpful: 3,
    isReported: false,
  },
  {
    id: '5',
    customerName: 'Lisa Brown',
    rating: 5,
    title: 'Best pizza in town!',
    comment: 'I\'ve tried many pizza places, but this one is definitely the best. The meat lovers pizza was incredible and the tiramisu was the perfect ending to the meal.',
    orderNumber: 'ORD-2024-005',
    orderItems: ['Meat Lovers Pizza', 'Tiramisu'],
    reviewDate: '2024-01-16',
    isVerified: true,
    hasResponse: false,
    isHelpful: 20,
    isReported: false,
  },
];

const mockStats: ReviewStats = {
  totalReviews: 247,
  averageRating: 4.3,
  ratingDistribution: [
    { rating: 5, count: 128, percentage: 51.8 },
    { rating: 4, count: 74, percentage: 30.0 },
    { rating: 3, count: 28, percentage: 11.3 },
    { rating: 2, count: 12, percentage: 4.9 },
    { rating: 1, count: 5, percentage: 2.0 },
  ],
  responseRate: 78.5,
  recentTrend: 'up',
};

export default function VendorReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [responseFilter, setResponseFilter] = useState('all');

  useEffect(() => {
    const loadReviews = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setReviews(mockReviews);
        setStats(mockStats);
      } catch (error) {
        console.error('Error loading reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    loadReviews();
  }, []);

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = review.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         review.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         review.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRating = ratingFilter === 'all' || review.rating.toString() === ratingFilter;
    const matchesResponse = responseFilter === 'all' || 
                           (responseFilter === 'responded' && review.hasResponse) ||
                           (responseFilter === 'not_responded' && !review.hasResponse);
    return matchesSearch && matchesRating && matchesResponse;
  });

  const renderStars = (rating: number, size: 'sm' | 'md' = 'sm') => {
    const sizeClass = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
    return Array.from({ length: 5 }, (_, i) => (
      i < rating ? (
        <StarIconSolid key={i} className={`${sizeClass} text-yellow-400`} />
      ) : (
        <StarIcon key={i} className={`${sizeClass} text-gray-300`} />
      )
    ));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-300 rounded w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
        <div className="bg-white rounded-lg p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow-sm rounded-lg">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Reviews</h1>
              <p className="text-gray-600">Manage customer reviews and feedback</p>
            </div>
            <div className="flex space-x-3">
              <Link href="/vendor/dashboard" className="btn-secondary">
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Review Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <StarIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Average Rating</p>
                <div className="flex items-center space-x-2">
                  <p className="text-2xl font-bold text-gray-900">{stats.averageRating}</p>
                  <div className="flex">{renderStars(Math.floor(stats.averageRating))}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ChatBubbleLeftRightIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Reviews</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalReviews}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Response Rate</p>
                <p className="text-2xl font-bold text-gray-900">{stats.responseRate}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <ClockIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Needs Response</p>
                <p className="text-2xl font-bold text-gray-900">
                  {reviews.filter(r => !r.hasResponse).length}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rating Distribution */}
      {stats && (
        <div className="bg-white shadow-sm rounded-lg">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Rating Distribution</h2>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {stats.ratingDistribution.map((item) => (
                <div key={item.rating} className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1 w-16">
                    <span className="text-sm font-medium text-gray-900">{item.rating}</span>
                    <StarIconSolid className="h-4 w-4 text-yellow-400" />
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center space-x-2 w-20">
                    <span className="text-sm text-gray-600">{item.count}</span>
                    <span className="text-sm text-gray-500">({item.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white shadow-sm rounded-lg">
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search reviews..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              
              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="all">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
              
              <select
                value={responseFilter}
                onChange={(e) => setResponseFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="all">All Reviews</option>
                <option value="responded">Responded</option>
                <option value="not_responded">Needs Response</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <FunnelIcon className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-600">{filteredReviews.length} reviews</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-white shadow-sm rounded-lg">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Customer Reviews</h2>
        </div>
        <div className="p-6">
          {filteredReviews.length === 0 ? (
            <div className="text-center py-12">
              <StarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No reviews found matching your criteria</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredReviews.map((review) => (
                <div key={review.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4">
                      {review.customerAvatar ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={review.customerAvatar}
                            alt={review.customerName}
                            className="w-10 h-10 rounded-full"
                          />
                        </>
                      ) : (
                        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600">
                            {review.customerName.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-medium text-gray-900">{review.customerName}</h3>
                          {review.isVerified && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircleIcon className="h-3 w-3 mr-1" />
                              Verified
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="flex">{renderStars(review.rating)}</div>
                          <span className="text-sm text-gray-500">{formatDate(review.reviewDate)}</span>
                        </div>
                        <p className="text-sm text-gray-600">Order: {review.orderNumber}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {!review.hasResponse && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Needs Response
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">{review.title}</h4>
                    <p className="text-gray-700">{review.comment}</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {review.orderItems.map((item, index) => (
                      <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {item}
                      </span>
                    ))}
                  </div>
                  
                  {review.hasResponse && review.response && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-orange-600">R</span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-sm font-medium text-blue-900">Restaurant Response</span>
                            <span className="text-xs text-blue-600">{formatDate(review.response.responseDate)}</span>
                          </div>
                          <p className="text-sm text-blue-800">{review.response.message}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>{review.isHelpful} people found this helpful</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {!review.hasResponse && (
                        <button className="btn-primary text-sm">
                          Respond
                        </button>
                      )}
                      {review.hasResponse && (
                        <button className="btn-secondary text-sm">
                          Edit Response
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
