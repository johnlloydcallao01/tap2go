'use client';

import React, { useState, useEffect } from 'react';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  StarIcon,
  EyeIcon,

  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

interface Review {
  id: string;
  customerName: string;
  customerEmail: string;
  restaurantName: string;
  orderId: string;
  rating: number;
  comment: string;
  status: 'pending' | 'approved' | 'flagged' | 'hidden';
  createdAt: string;
  isVerified: boolean;
  helpfulVotes: number;
  reportCount: number;
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedRating, setSelectedRating] = useState('all');

  useEffect(() => {
    const loadReviews = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));

        const mockReviews: Review[] = [
          {
            id: '1',
            customerName: 'Sarah Johnson',
            customerEmail: 'sarah.j@email.com',
            restaurantName: 'Pizza Palace',
            orderId: 'ORD-2024-001',
            rating: 5,
            comment: 'Amazing pizza! The delivery was super fast and the food arrived hot. Definitely ordering again!',
            status: 'approved',
            createdAt: '2024-01-15T10:30:00Z',
            isVerified: true,
            helpfulVotes: 12,
            reportCount: 0,
          },
          {
            id: '2',
            customerName: 'Mike Chen',
            customerEmail: 'mike.chen@email.com',
            restaurantName: 'Burger Barn',
            orderId: 'ORD-2024-002',
            rating: 2,
            comment: 'Food was cold when it arrived. The burger was overcooked and fries were soggy. Very disappointed.',
            status: 'flagged',
            createdAt: '2024-01-14T18:45:00Z',
            isVerified: true,
            helpfulVotes: 8,
            reportCount: 2,
          },
          {
            id: '3',
            customerName: 'Emily Rodriguez',
            customerEmail: 'emily.r@email.com',
            restaurantName: 'Sushi Zen',
            orderId: 'ORD-2024-003',
            rating: 4,
            comment: 'Fresh sushi and great presentation. Only complaint is the delivery took longer than expected.',
            status: 'approved',
            createdAt: '2024-01-14T14:20:00Z',
            isVerified: true,
            helpfulVotes: 15,
            reportCount: 0,
          },
          {
            id: '4',
            customerName: 'David Wilson',
            customerEmail: 'david.w@email.com',
            restaurantName: 'Taco Fiesta',
            orderId: 'ORD-2024-004',
            rating: 1,
            comment: 'This place is terrible! Worst food ever! Never order from here!!!',
            status: 'pending',
            createdAt: '2024-01-13T20:15:00Z',
            isVerified: false,
            helpfulVotes: 3,
            reportCount: 5,
          },
          {
            id: '5',
            customerName: 'Lisa Thompson',
            customerEmail: 'lisa.t@email.com',
            restaurantName: 'Mediterranean Delight',
            orderId: 'ORD-2024-005',
            rating: 5,
            comment: 'Absolutely delicious! The hummus was creamy and the lamb was perfectly seasoned. Highly recommend!',
            status: 'approved',
            createdAt: '2024-01-13T16:30:00Z',
            isVerified: true,
            helpfulVotes: 20,
            reportCount: 0,
          },
        ];

        setReviews(mockReviews);
      } catch (error) {
        console.error('Error loading reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    loadReviews();
  }, []);

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = 
      review.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.restaurantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.comment.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || review.status === selectedStatus;
    const matchesRating = selectedRating === 'all' || review.rating.toString() === selectedRating;
    
    return matchesSearch && matchesStatus && matchesRating;
  });

  const getStatusBadge = (status: Review['status']) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      flagged: 'bg-red-100 text-red-800',
      hidden: 'bg-gray-100 text-gray-800',
    };
    
    return badges[status] || badges.pending;
  };

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

  const handleStatusChange = (reviewId: string, newStatus: Review['status']) => {
    setReviews(prev => 
      prev.map(review => 
        review.id === reviewId ? { ...review, status: newStatus } : review
      )
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
        <div className="mb-4 sm:mb-0">
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Reviews Management</h1>
          <p className="text-sm lg:text-base text-gray-600">Monitor and moderate customer reviews and ratings.</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <span>Total Reviews: {reviews.length}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-lg font-semibold text-gray-900">
                {reviews.filter(r => r.status === 'approved').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-lg font-semibold text-gray-900">
                {reviews.filter(r => r.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircleIcon className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Flagged</p>
              <p className="text-lg font-semibold text-gray-900">
                {reviews.filter(r => r.status === 'flagged').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <StarIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Avg Rating</p>
              <p className="text-lg font-semibold text-gray-900">
                {(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow border mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search reviews, customers, or restaurants..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <FunnelIcon className="h-5 w-5 text-gray-400" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="flagged">Flagged</option>
              <option value="hidden">Hidden</option>
            </select>
          </div>

          {/* Rating Filter */}
          <div className="flex items-center space-x-2">
            <StarIcon className="h-5 w-5 text-gray-400" />
            <select
              value={selectedRating}
              onChange={(e) => setSelectedRating(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-white rounded-lg shadow border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Reviews ({filteredReviews.length})
          </h3>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredReviews.map((review) => (
            <div key={review.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Review Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-orange-500 flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {review.customerName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{review.customerName}</h4>
                        <p className="text-xs text-gray-500">{review.customerEmail}</p>
                      </div>
                      {review.isVerified && (
                        <CheckCircleIcon className="h-4 w-4 text-green-500" />
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(review.status)}`}>
                        {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Restaurant & Order Info */}
                  <div className="flex items-center space-x-4 mb-3 text-sm text-gray-600">
                    <span><strong>Restaurant:</strong> {review.restaurantName}</span>
                    <span><strong>Order:</strong> {review.orderId}</span>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center space-x-2 mb-3">
                    {renderStars(review.rating)}
                    <span className="text-sm font-medium text-gray-900">{review.rating}/5</span>
                  </div>

                  {/* Comment */}
                  <p className="text-gray-700 mb-3">{review.comment}</p>

                  {/* Engagement Stats */}
                  <div className="flex items-center space-x-4 text-xs text-gray-500 mb-4">
                    <span>{review.helpfulVotes} helpful votes</span>
                    {review.reportCount > 0 && (
                      <span className="text-red-500">{review.reportCount} reports</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    {review.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleStatusChange(review.id, 'approved')}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircleIcon className="h-3 w-3 mr-1" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleStatusChange(review.id, 'flagged')}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700"
                        >
                          <XCircleIcon className="h-3 w-3 mr-1" />
                          Flag
                        </button>
                      </>
                    )}

                    {review.status === 'approved' && (
                      <button
                        onClick={() => handleStatusChange(review.id, 'hidden')}
                        className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Hide
                      </button>
                    )}

                    {review.status === 'flagged' && (
                      <>
                        <button
                          onClick={() => handleStatusChange(review.id, 'approved')}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleStatusChange(review.id, 'hidden')}
                          className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                        >
                          Hide
                        </button>
                      </>
                    )}

                    <button className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50">
                      <EyeIcon className="h-3 w-3 mr-1" />
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredReviews.length === 0 && (
          <div className="p-12 text-center">
            <StarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
