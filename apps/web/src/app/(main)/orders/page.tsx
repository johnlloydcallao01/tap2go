'use client';

import React, { useState } from 'react';
import Image from '@/components/ui/ImageWrapper';

/**
 * Mock data for orders with high-quality food images from Pexels
 */
const mockOrders = [
  {
    id: 'ORD-2024-001',
    orderNumber: '#12345',
    date: '2024-01-15',
    status: 'delivered',
    total: '$45.99',
    items: [
      {
        id: 1,
        name: 'Gourmet Burger Deluxe',
        quantity: 2,
        price: '$15.99',
        image: 'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&w=400'
      },
      {
        id: 2,
        name: 'Crispy French Fries',
        quantity: 1,
        price: '$8.99',
        image: 'https://images.pexels.com/photos/1893556/pexels-photo-1893556.jpeg?auto=compress&cs=tinysrgb&w=400'
      }
    ],
    restaurant: 'Burger Palace',
    deliveryTime: '25 mins',
    rating: 4.8
  },
  {
    id: 'ORD-2024-002',
    orderNumber: '#12346',
    date: '2024-01-14',
    status: 'preparing',
    total: '$32.50',
    items: [
      {
        id: 3,
        name: 'Margherita Pizza',
        quantity: 1,
        price: '$18.99',
        image: 'https://images.pexels.com/photos/2147491/pexels-photo-2147491.jpeg?auto=compress&cs=tinysrgb&w=400'
      },
      {
        id: 4,
        name: 'Caesar Salad',
        quantity: 1,
        price: '$13.51',
        image: 'https://images.pexels.com/photos/2097090/pexels-photo-2097090.jpeg?auto=compress&cs=tinysrgb&w=400'
      }
    ],
    restaurant: 'Bella Italia',
    deliveryTime: '35 mins',
    rating: 4.6
  },
  {
    id: 'ORD-2024-003',
    orderNumber: '#12347',
    date: '2024-01-13',
    status: 'cancelled',
    total: '$28.75',
    items: [
      {
        id: 5,
        name: 'Chicken Teriyaki Bowl',
        quantity: 1,
        price: '$16.99',
        image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400'
      },
      {
        id: 6,
        name: 'Miso Soup',
        quantity: 2,
        price: '$5.88',
        image: 'https://images.pexels.com/photos/5938567/pexels-photo-5938567.jpeg?auto=compress&cs=tinysrgb&w=400'
      }
    ],
    restaurant: 'Tokyo Kitchen',
    deliveryTime: '40 mins',
    rating: 4.5
  },
  {
    id: 'ORD-2024-004',
    orderNumber: '#12348',
    date: '2024-01-12',
    status: 'delivered',
    total: '$52.30',
    items: [
      {
        id: 7,
        name: 'Grilled Salmon',
        quantity: 1,
        price: '$24.99',
        image: 'https://images.pexels.com/photos/1516415/pexels-photo-1516415.jpeg?auto=compress&cs=tinysrgb&w=400'
      },
      {
        id: 8,
        name: 'Roasted Vegetables',
        quantity: 1,
        price: '$12.99',
        image: 'https://images.pexels.com/photos/1640770/pexels-photo-1640770.jpeg?auto=compress&cs=tinysrgb&w=400'
      },
      {
        id: 9,
        name: 'Chocolate Dessert',
        quantity: 1,
        price: '$14.32',
        image: 'https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg?auto=compress&cs=tinysrgb&w=400'
      }
    ],
    restaurant: 'Ocean Grill',
    deliveryTime: '30 mins',
    rating: 4.9
  },
  {
    id: 'ORD-2024-005',
    orderNumber: '#12349',
    date: '2024-01-11',
    status: 'delivered',
    total: '$19.99',
    items: [
      {
        id: 10,
        name: 'Avocado Toast',
        quantity: 2,
        price: '$9.99',
        image: 'https://images.pexels.com/photos/566566/pexels-photo-566566.jpeg?auto=compress&cs=tinysrgb&w=400'
      }
    ],
    restaurant: 'Healthy Bites',
    deliveryTime: '20 mins',
    rating: 4.7
  }
];

const statusOptions = [
  { id: 'all', label: 'All Orders', count: mockOrders.length },
  { id: 'delivered', label: 'Delivered', count: mockOrders.filter(order => order.status === 'delivered').length },
  { id: 'preparing', label: 'Preparing', count: mockOrders.filter(order => order.status === 'preparing').length },
  { id: 'cancelled', label: 'Cancelled', count: mockOrders.filter(order => order.status === 'cancelled').length }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'delivered':
      return 'bg-green-100 text-green-800';
    case 'preparing':
      return 'bg-blue-100 text-blue-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'delivered':
      return 'fas fa-check-circle';
    case 'preparing':
      return 'fas fa-clock';
    case 'cancelled':
      return 'fas fa-times-circle';
    default:
      return 'fas fa-question-circle';
  }
};

export default function OrdersPage() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter orders based on active filter and search query
  const filteredOrders = mockOrders.filter(order => {
    const matchesFilter = 
      activeFilter === 'all' || order.status === activeFilter;
    
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.restaurant.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesFilter && matchesSearch;
  });

  const handleReorder = (orderId: string) => {
    console.log('Reordering:', orderId);
    // Reorder logic here
  };

  const handleTrackOrder = (orderId: string) => {
    console.log('Tracking order:', orderId);
    // Track order logic here
  };

  const handleRateOrder = (orderId: string) => {
    console.log('Rating order:', orderId);
    // Rate order logic here
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-2.5 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Orders</h1>
              <p className="text-gray-600 mt-1 text-base">Track and manage your food orders</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <button className="px-4 py-2 rounded-lg hover:opacity-90 transition-colors font-medium text-sm" style={{color: '#eba236', backgroundColor: '#eba236' + '20'}}>
                <i className="fas fa-receipt mr-2"></i>
                Order History
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-2.5 py-4">
        {/* Search and Filter Section */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1">
              <div className="relative">
                <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm"></i>
                <input
                  type="text"
                  placeholder="Search orders by number, restaurant, or item..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 rounded-lg focus:ring-2 focus:bg-white transition-all text-sm"
                  style={{'--tw-ring-color': '#eba236'} as any}
                />
              </div>
            </div>

            {/* Status Filter Tabs */}
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`px-3 py-2 rounded-lg font-medium transition-all text-sm ${
                    activeFilter === filter.id
                      ? 'text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  style={activeFilter === filter.id ? {backgroundColor: '#eba236'} : {}}
                >
                  {filter.label}
                  <span className="ml-1 text-xs opacity-75">({filter.count})</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
                {/* Order Header */}
                <div className="p-4 bg-gray-50">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-4">
                      <div>
                        <h3 className="font-bold text-gray-900 text-base">{order.orderNumber}</h3>
                        <p className="text-xs text-gray-500">{order.date} • {order.restaurant}</p>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        <i className={`${getStatusIcon(order.status)} mr-1`}></i>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900 text-base">{order.total}</p>
                      <p className="text-xs text-gray-500">{order.deliveryTime}</p>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={60}
                          height={60}
                          className="w-15 h-15 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 text-sm">{item.name}</h4>
                          <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900 text-sm">{item.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Actions */}
                  <div className="flex flex-col sm:flex-row gap-2 mt-4 pt-4">
                    {order.status === 'delivered' && (
                      <>
                        <button
                          onClick={() => handleReorder(order.id)}
                          className="flex-1 py-2 px-4 text-white rounded-lg hover:opacity-90 transition-colors font-medium text-sm"
                          style={{backgroundColor: '#eba236'}}
                        >
                          <i className="fas fa-redo mr-2"></i>
                          Reorder
                        </button>
                        <button
                          onClick={() => handleRateOrder(order.id)}
                          className="flex-1 py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
                        >
                          <i className="fas fa-star mr-2"></i>
                          Rate Order
                        </button>
                      </>
                    )}
                    {order.status === 'preparing' && (
                      <button
                        onClick={() => handleTrackOrder(order.id)}
                        className="flex-1 py-2 px-4 text-white rounded-lg hover:opacity-90 transition-colors font-medium text-sm"
                        style={{backgroundColor: '#eba236'}}
                      >
                        <i className="fas fa-map-marker-alt mr-2"></i>
                        Track Order
                      </button>
                    )}
                    {order.status === 'cancelled' && (
                      <button
                        onClick={() => handleReorder(order.id)}
                        className="flex-1 py-2 px-4 text-white rounded-lg hover:opacity-90 transition-colors font-medium text-sm"
                        style={{backgroundColor: '#eba236'}}
                      >
                        <i className="fas fa-redo mr-2"></i>
                        Order Again
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <i className="fas fa-shopping-bag text-3xl text-gray-400"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {searchQuery ? 'No orders found' : 'No orders yet'}
              </h3>
              <p className="text-gray-600 mb-6 text-base">
                {searchQuery 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Your food orders will appear here once you place them'
                }
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-6 py-2 text-white rounded-lg hover:opacity-90 transition-colors font-medium text-sm shadow-md"
                  style={{backgroundColor: '#eba236'}}
                >
                  Clear Search
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}