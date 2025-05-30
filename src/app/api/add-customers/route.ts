import { NextResponse } from 'next/server';
import { doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function POST() {
  try {
    console.log('🚀 Adding customers collection to Firebase...');

    // Add customers structure documentation
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
            address: {
              street: "string",
              city: "string",
              state: "string",
              zipCode: "string",
              country: "string",
              apartmentNumber: "string (optional)",
              floor: "string (optional)",
              landmark: "string (optional)",
              deliveryInstructions: "string (optional)"
            },
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
            selectedModifiers: {
              groupId: "string",
              selectedOptions: "string[] - optionIds"
            },
            itemPrice: "number - snapshot at time of adding",
            totalPrice: "number - including modifiers",
            addedAt: "timestamp"
          }
        }
      },
      setupDate: Timestamp.now(),
      version: "1.0.0"
    };

    // Add to _system/customers_structure
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
            subcollections: {
              addresses: "Customer delivery addresses",
              paymentMethods: "Customer payment methods",
              favorites: "Customer favorite restaurants and items",
              cart: "Customer shopping cart"
            }
          }
        },
        lastUpdated: Timestamp.now(),
        updatedBy: "api_route",
        version: "1.1.0"
      };

      await setDoc(collectionsStructureRef, updatedData);
    }

    return NextResponse.json({
      success: true,
      message: 'Customers collection successfully added to Firebase'
    });

  } catch (error: unknown) {
    console.error('Failed to add customers collection:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({
      success: false,
      error: errorMessage
    }, { status: 500 });
  }
}
