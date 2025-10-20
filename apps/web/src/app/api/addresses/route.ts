import { NextRequest, NextResponse } from 'next/server';

/**
 * API endpoint for managing user addresses
 * Stores addresses in the PayloadCMS addresses collection
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://cms.tap2goph.com/api';

interface AddressData {
  // Raw Google Maps data
  formatted_address: string;
  google_place_id: string;
  
  // Parsed address components
  street_number?: string;
  route?: string;
  barangay?: string;
  locality?: string;
  administrative_area_level_1?: string;
  country?: string;
  postal_code?: string;
  
  // Geolocation
  latitude?: number;
  longitude?: number;
  
  // Metadata
  address_type?: 'home' | 'work' | 'other';
  is_default?: boolean;
  notes?: string;
}

interface CreateAddressRequest {
  place: google.maps.places.PlaceResult;
  address_type?: 'home' | 'work' | 'other';
  is_default?: boolean;
  notes?: string;
}

/**
 * POST /api/addresses
 * Create a new address for the authenticated user
 */
export async function POST(request: NextRequest) {
  try {
    const body: CreateAddressRequest = await request.json();
    const { place, address_type = 'other', is_default = false, notes } = body;

    // Get user token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];

    // Parse Google Maps place data
    const addressData: AddressData = {
      // Raw Google Maps data
      formatted_address: place.formatted_address || '',
      google_place_id: place.place_id || '',
      
      // Geolocation - Handle both function-based and direct property access
      latitude: typeof place.geometry?.location?.lat === 'function' 
        ? place.geometry.location.lat() 
        : (place.geometry?.location?.lat as number | undefined),
      longitude: typeof place.geometry?.location?.lng === 'function' 
        ? place.geometry.location.lng() 
        : (place.geometry?.location?.lng as number | undefined),
      
      // Metadata
      address_type,
      is_default,
      notes,
      country: 'Philippines', // Default to Philippines as per collection config
    };

    // Parse address components from Google Maps
    if (place.address_components) {
      for (const component of place.address_components) {
        const types = component.types;
        
        if (types.includes('street_number')) {
          addressData.street_number = component.long_name;
        } else if (types.includes('route')) {
          addressData.route = component.long_name;
        } else if (types.includes('sublocality_level_1') || types.includes('neighborhood')) {
          addressData.barangay = component.long_name;
        } else if (types.includes('locality') || types.includes('administrative_area_level_2')) {
          addressData.locality = component.long_name;
        } else if (types.includes('administrative_area_level_1')) {
          addressData.administrative_area_level_1 = component.long_name;
        } else if (types.includes('country')) {
          addressData.country = component.long_name;
        } else if (types.includes('postal_code')) {
          addressData.postal_code = component.long_name;
        }
      }
    }

    // Get current user to associate the address
    const userResponse = await fetch(`${API_BASE_URL}/users/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!userResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to authenticate user' },
        { status: 401 }
      );
    }

    const user = await userResponse.json();

    // If this is set as default, unset other default addresses first
    if (is_default) {
      try {
        await fetch(`${API_BASE_URL}/addresses?where[user][equals]=${user.user.id}&where[is_default][equals]=true`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            is_default: false
          })
        });
      } catch (error) {
        // Continue even if this fails
      }
    }

    // Create the address in PayloadCMS
    const createResponse = await fetch(`${API_BASE_URL}/addresses`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...addressData,
        user: user.user.id,
      }),
    });

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: 'Failed to create address' };
      }
      return NextResponse.json(
        { error: 'Failed to create address', details: errorData },
        { status: createResponse.status }
      );
    }

    const createdAddress = await createResponse.json();

    return NextResponse.json({
      success: true,
      address: createdAddress,
      message: 'Address created successfully'
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/addresses
 * Get all addresses for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    // Get user token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];

    // Get current user
    const userResponse = await fetch(`${API_BASE_URL}/users/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!userResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to authenticate user' },
        { status: 401 }
      );
    }

    const userData = await userResponse.json();
    const userId = userData.user?.id;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID not found' },
        { status: 400 }
      );
    }

    // Fetch user's addresses
    const addressesResponse = await fetch(`${API_BASE_URL}/addresses?where[user][equals]=${userId}&sort=-createdAt`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!addressesResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch addresses' },
        { status: addressesResponse.status }
      );
    }

    let addressesData;
    try {
      const responseText = await addressesResponse.text();
      if (!responseText.trim()) {
        return NextResponse.json({
          success: true,
          addresses: [],
          total: 0,
        });
      }
      addressesData = JSON.parse(responseText);
    } catch (parseError) {
      return NextResponse.json(
        { error: 'Invalid response from backend service' },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      addresses: addressesData.docs || [],
      total: addressesData.totalDocs || 0,
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}