'use client';

import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Restaurant {
  id: string;
  vendorRef: string;
  outletName: string;
  brandName: string;
  address: any;
  location: any;
  formattedAddress: string;
  outletPhone: string;
  coverImageUrl: string;
  cuisineTags: string[];
  priceRange?: string;
  avgRating?: number;
  totalReviews?: number;
  estimatedDeliveryRange: string;
  deliveryFees: any;
  isAcceptingOrders: boolean;
  platformStatus: string;
  operatingHours: any;
  preparationTime: any;
  staffContact: any;
}

export default function TestRestaurantPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [menuCategories, setMenuCategories] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [promotions, setPromotions] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadRestaurants();
  }, []);

  const loadRestaurants = async () => {
    try {
      setLoading(true);
      const restaurantsRef = collection(db, 'restaurants');
      const snapshot = await getDocs(restaurantsRef);
      
      const restaurantData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Restaurant[];
      
      setRestaurants(restaurantData);
    } catch (error: any) {
      setError(error.message);
      console.error('Error loading restaurants:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRestaurantDetails = async (restaurant: Restaurant) => {
    try {
      setSelectedRestaurant(restaurant);
      
      // Load menu categories
      const categoriesRef = collection(db, 'restaurants', restaurant.id, 'menuCategories');
      const categoriesSnapshot = await getDocs(categoriesRef);
      const categoriesData = categoriesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMenuCategories(categoriesData);

      // Load menu items
      const itemsRef = collection(db, 'restaurants', restaurant.id, 'menuItems');
      const itemsSnapshot = await getDocs(itemsRef);
      const itemsData = itemsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMenuItems(itemsData);

      // Load promotions
      const promotionsRef = collection(db, 'restaurants', restaurant.id, 'promotions');
      const promotionsSnapshot = await getDocs(promotionsRef);
      const promotionsData = promotionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPromotions(promotionsData);

      // Load reviews
      const reviewsRef = collection(db, 'restaurants', restaurant.id, 'reviews');
      const reviewsSnapshot = await getDocs(reviewsRef);
      const reviewsData = reviewsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setReviews(reviewsData);

    } catch (error: any) {
      setError(error.message);
      console.error('Error loading restaurant details:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Test Restaurants Collection</h1>
          
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading restaurants...</p>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {!loading && restaurants.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-600">No restaurants found in the database.</p>
            </div>
          )}

          {!loading && restaurants.length > 0 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-800">
                Found {restaurants.length} restaurant(s)
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {restaurants.map((restaurant) => (
                  <div
                    key={restaurant.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => loadRestaurantDetails(restaurant)}
                  >
                    <div className="space-y-2">
                      <h3 className="font-semibold text-gray-900">{restaurant.outletName}</h3>
                      <p className="text-sm text-gray-600">{restaurant.brandName}</p>
                      <p className="text-xs text-gray-500">{restaurant.formattedAddress}</p>
                      
                      <div className="flex items-center space-x-2">
                        {restaurant.cuisineTags.map((tag, index) => (
                          <span
                            key={index}
                            className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">
                          {restaurant.priceRange}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          restaurant.isAcceptingOrders 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {restaurant.isAcceptingOrders ? 'Open' : 'Closed'}
                        </span>
                      </div>

                      <div className="text-xs text-gray-500">
                        <p>Delivery: {restaurant.estimatedDeliveryRange}</p>
                        <p>Rating: {restaurant.avgRating || 'N/A'} ({restaurant.totalReviews || 0} reviews)</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {selectedRestaurant && (
                <div className="mt-8 border-t pt-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">
                    Restaurant Details: {selectedRestaurant.outletName}
                  </h2>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Restaurant Info */}
                    <div className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-gray-800 mb-2">Basic Information</h3>
                        <div className="space-y-1 text-sm">
                          <p><strong>ID:</strong> {selectedRestaurant.id}</p>
                          <p><strong>Brand:</strong> {selectedRestaurant.brandName}</p>
                          <p><strong>Phone:</strong> {selectedRestaurant.outletPhone}</p>
                          <p><strong>Status:</strong> {selectedRestaurant.platformStatus}</p>
                          <p><strong>Prep Time:</strong> {selectedRestaurant.preparationTime?.average} min avg</p>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-gray-800 mb-2">Delivery Info</h3>
                        <div className="space-y-1 text-sm">
                          <p><strong>Base Fee:</strong> ${selectedRestaurant.deliveryFees?.base}</p>
                          <p><strong>Per KM:</strong> ${selectedRestaurant.deliveryFees?.perKm}</p>
                          <p><strong>Small Order Fee:</strong> ${selectedRestaurant.deliveryFees?.smallOrderFee}</p>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-gray-800 mb-2">Staff Contact</h3>
                        <div className="space-y-1 text-sm">
                          <p><strong>Manager:</strong> {selectedRestaurant.staffContact?.managerName}</p>
                          <p><strong>Phone:</strong> {selectedRestaurant.staffContact?.managerPhone}</p>
                          <p><strong>Email:</strong> {selectedRestaurant.staffContact?.managerEmail}</p>
                        </div>
                      </div>
                    </div>

                    {/* Subcollections */}
                    <div className="space-y-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-blue-800 mb-2">
                          Menu Categories ({menuCategories.length})
                        </h3>
                        {menuCategories.map((category) => (
                          <div key={category.id} className="text-sm text-blue-700 mb-1">
                            • {category.name} {category.isActive ? '✅' : '❌'}
                          </div>
                        ))}
                      </div>

                      <div className="bg-green-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-green-800 mb-2">
                          Menu Items ({menuItems.length})
                        </h3>
                        {menuItems.slice(0, 3).map((item) => (
                          <div key={item.id} className="text-sm text-green-700 mb-1">
                            • {item.name} - ${item.basePrice} {item.isAvailable ? '✅' : '❌'}
                          </div>
                        ))}
                        {menuItems.length > 3 && (
                          <p className="text-xs text-green-600">...and {menuItems.length - 3} more</p>
                        )}
                      </div>

                      <div className="bg-purple-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-purple-800 mb-2">
                          Promotions ({promotions.length})
                        </h3>
                        {promotions.map((promo) => (
                          <div key={promo.id} className="text-sm text-purple-700 mb-1">
                            • {promo.title} ({promo.type}) {promo.isActive ? '✅' : '❌'}
                          </div>
                        ))}
                      </div>

                      <div className="bg-yellow-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-yellow-800 mb-2">
                          Reviews ({reviews.length})
                        </h3>
                        {reviews.map((review) => (
                          <div key={review.id} className="text-sm text-yellow-700 mb-1">
                            • {review.rating}⭐ - {review.comment?.substring(0, 50)}...
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="mt-8 p-4 bg-gray-50 rounded-md">
            <h3 className="font-medium text-gray-800 mb-2">Test Information:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• This page displays all restaurants from the Firestore database</li>
              <li>• Click on a restaurant to view its subcollections</li>
              <li>• Shows menu categories, items, promotions, and reviews</li>
              <li>• Demonstrates the complete restaurant data structure</li>
              <li>• Includes location data (GeoPoint), operating hours, and delivery settings</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
