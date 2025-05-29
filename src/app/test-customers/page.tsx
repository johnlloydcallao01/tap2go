'use client';

import { useState, useEffect } from 'react';
import { collection, doc, getDoc, getDocs, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function TestCustomersPage() {
  const [systemDocs, setSystemDocs] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [setupLoading, setSetupLoading] = useState(false);

  useEffect(() => {
    loadSystemDocumentation();
  }, []);

  const loadSystemDocumentation = async () => {
    try {
      setLoading(true);

      // Get customers structure documentation
      const customersStructureRef = doc(db, '_system', 'customers_structure');
      const customersStructureSnap = await getDoc(customersStructureRef);

      // Get main collections structure
      const collectionsStructureRef = doc(db, '_system', 'collections_structure');
      const collectionsStructureSnap = await getDoc(collectionsStructureRef);

      // Get all system docs
      const systemRef = collection(db, '_system');
      const systemSnapshot = await getDocs(systemRef);

      const docs: any = {};
      for (const docSnap of systemSnapshot.docs) {
        docs[docSnap.id] = docSnap.data();
      }

      setSystemDocs({
        customersStructure: customersStructureSnap.exists() ? customersStructureSnap.data() : null,
        collectionsStructure: collectionsStructureSnap.exists() ? collectionsStructureSnap.data() : null,
        allSystemDocs: docs
      });
    } catch (error: any) {
      setError(error.message);
      console.error('Error loading system documentation:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupCustomersCollection = async () => {
    try {
      setSetupLoading(true);

      // Setup customers structure documentation
      const customersStructure = {
        collection: "customers",
        purpose: "End users who place orders",
        docIdFormat: "Customer's Auth UID",
        fields: {
          userRef: "string - path to users/{uid}",
          firstName: "string",
          lastName: "string",
          dateOfBirth: "timestamp (optional)",
          gender: "string (optional) - male | female | other | prefer_not_to_say",
          loyaltyPoints: "number",
          loyaltyTier: "string - bronze | silver | gold | platinum",
          totalOrders: "number",
          totalSpent: "number",
          avgOrderValue: "number",
          preferredCuisines: "string[] (optional)",
          dietaryRestrictions: "string[] (optional)",
          allergies: "string[] (optional)",
          marketingConsent: "boolean",
          smsConsent: "boolean",
          emailConsent: "boolean",
          referralCode: "string - unique referral code",
          referredBy: "string (optional) - customer UID who referred",
          createdAt: "timestamp",
          updatedAt: "timestamp",
          lastOrderAt: "timestamp (optional)"
        },
        subcollections: {
          addresses: {
            path: "customers/{customerUid}/addresses/{addressId}",
            purpose: "Customer delivery addresses",
            fields: {
              addressId: "string - auto-generated",
              label: "string - Home, Office, Other",
              recipientName: "string",
              recipientPhone: "string",
              address: "map - street, city, state, zipCode, country, apartmentNumber, floor, landmark, deliveryInstructions",
              location: "GeoPoint - {latitude: number, longitude: number}",
              formattedAddress: "string",
              isDefault: "boolean",
              isActive: "boolean",
              createdAt: "timestamp",
              updatedAt: "timestamp"
            }
          },
          paymentMethods: {
            path: "customers/{customerUid}/paymentMethods/{paymentMethodId}",
            purpose: "Customer payment methods",
            fields: {
              paymentMethodId: "string - auto-generated",
              type: "string - card | wallet | bank_account | cod",
              provider: "string - stripe, paypal, cash",
              last4: "string (optional) - for cards",
              cardBrand: "string (optional) - visa, mastercard, etc.",
              expiryMonth: "number (optional)",
              expiryYear: "number (optional)",
              walletProvider: "string (optional) - apple_pay, google_pay",
              isDefault: "boolean",
              isActive: "boolean",
              createdAt: "timestamp"
            }
          },
          favorites: {
            path: "customers/{customerUid}/favorites/{favoriteId}",
            purpose: "Customer favorite restaurants and items",
            fields: {
              favoriteId: "string - auto-generated",
              type: "string - restaurant | item",
              restaurantRef: "string (optional) - path to restaurants/{restId}",
              menuItemRef: "string (optional) - path to restaurants/{restId}/menuItems/{itemId}",
              createdAt: "timestamp"
            }
          },
          cart: {
            path: "customers/{customerUid}/cart/{cartItemId}",
            purpose: "Customer shopping cart",
            fields: {
              cartItemId: "string - auto-generated",
              restaurantRef: "string - path to restaurants/{restId}",
              menuItemRef: "string - path to menuItems/{itemId}",
              quantity: "number",
              specialInstructions: "string (optional)",
              selectedModifiers: "array (optional) - {groupId: string, selectedOptions: string[]}[]",
              itemPrice: "number - snapshot at time of adding",
              totalPrice: "number - including modifiers",
              addedAt: "timestamp"
            }
          }
        },
        setupDate: Timestamp.now(),
        version: "1.0.0"
      };

      await setDoc(doc(db, '_system', 'customers_structure'), customersStructure);

      // Update main collections structure
      const collectionsStructureRef = doc(db, '_system', 'collections_structure');
      const collectionsStructureSnap = await getDoc(collectionsStructureRef);

      if (collectionsStructureSnap.exists()) {
        const data = collectionsStructureSnap.data();
        const updatedData = {
          ...data,
          collections: {
            ...data.collections,
            customers: {
              purpose: "End users who place orders",
              docIdFormat: "Customer's Auth UID (same as users UID)",
              fields: {
                userRef: "string - path to users/{uid}",
                firstName: "string",
                lastName: "string",
                dateOfBirth: "timestamp (optional)",
                gender: "string (optional) - male | female | other | prefer_not_to_say",
                loyaltyPoints: "number",
                loyaltyTier: "string - bronze | silver | gold | platinum",
                totalOrders: "number",
                totalSpent: "number",
                avgOrderValue: "number",
                preferredCuisines: "string[] (optional)",
                dietaryRestrictions: "string[] (optional)",
                allergies: "string[] (optional)",
                marketingConsent: "boolean",
                smsConsent: "boolean",
                emailConsent: "boolean",
                referralCode: "string - unique referral code",
                referredBy: "string (optional) - customer UID who referred",
                createdAt: "timestamp",
                updatedAt: "timestamp",
                lastOrderAt: "timestamp (optional)"
              },
              subcollections: {
                addresses: "Customer delivery addresses",
                paymentMethods: "Customer payment methods",
                favorites: "Customer favorite restaurants and items",
                cart: "Customer shopping cart"
              }
            }
          },
          lastUpdated: Timestamp.now(),
          updatedBy: "manual_setup_from_test_page",
          version: "1.1.0"
        };

        await setDoc(collectionsStructureRef, updatedData);
      }

      // Reload documentation
      await loadSystemDocumentation();

    } catch (error: any) {
      setError(`Setup failed: ${error.message}`);
      console.error('Setup error:', error);
    } finally {
      setSetupLoading(false);
    }
  };

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    if (timestamp.toDate) {
      return timestamp.toDate().toLocaleString();
    }
    return timestamp.toString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading system documentation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">Error loading documentation</div>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={loadSystemDocumentation}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Customers Collection Test</h1>
          <p className="mt-2 text-gray-600">Verify customers collection setup and documentation</p>
          <div className="mt-4 flex space-x-4">
            <button
              onClick={loadSystemDocumentation}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              disabled={loading}
            >
              Refresh
            </button>
            <button
              onClick={setupCustomersCollection}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              disabled={setupLoading}
            >
              {setupLoading ? 'Setting up...' : 'Setup Customers Collection'}
            </button>
          </div>
        </div>

        {/* Customers Structure Status */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Customers Structure Status</h2>
          {systemDocs?.customersStructure ? (
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span className="text-green-700 font-medium">Customers structure documented</span>
              </div>
              <div className="bg-gray-50 p-4 rounded">
                <p><strong>Purpose:</strong> {systemDocs.customersStructure.purpose}</p>
                <p><strong>Version:</strong> {systemDocs.customersStructure.version}</p>
                <p><strong>Setup Date:</strong> {formatTimestamp(systemDocs.customersStructure.setupDate)}</p>
                <p><strong>Subcollections:</strong> {Object.keys(systemDocs.customersStructure.subcollections || {}).join(', ')}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
              <span className="text-red-700 font-medium">Customers structure not found</span>
            </div>
          )}
        </div>

        {/* Main Collections Structure Status */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Main Collections Structure Status</h2>
          {systemDocs?.collectionsStructure?.collections?.customers ? (
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span className="text-green-700 font-medium">Customers included in main collections</span>
              </div>
              <div className="bg-gray-50 p-4 rounded">
                <p><strong>Purpose:</strong> {systemDocs.collectionsStructure.collections.customers.purpose}</p>
                <p><strong>Doc ID Format:</strong> {systemDocs.collectionsStructure.collections.customers.docIdFormat}</p>
                <p><strong>Subcollections:</strong> {Object.keys(systemDocs.collectionsStructure.collections.customers.subcollections || {}).join(', ')}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
              <span className="text-red-700 font-medium">Customers not found in main collections</span>
            </div>
          )}
        </div>

        {/* All System Documents */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">All System Documents</h2>
          <div className="space-y-4">
            {Object.keys(systemDocs?.allSystemDocs || {}).map((docId) => (
              <div key={docId} className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-medium text-gray-900">{docId}</h3>
                <p className="text-sm text-gray-600">
                  Last updated: {formatTimestamp(systemDocs.allSystemDocs[docId].lastUpdated || systemDocs.allSystemDocs[docId].setupDate)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Customers Structure */}
        {systemDocs?.customersStructure && (
          <div className="bg-white shadow rounded-lg p-6 mt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Customers Structure Details</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(systemDocs.customersStructure, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
