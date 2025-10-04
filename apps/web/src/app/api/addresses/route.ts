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
  console.log('🏠 === ADDRESS CREATION STARTED ===');
  
  try {
    console.log('📥 Parsing request body...');
    const body: CreateAddressRequest = await request.json();
    console.log('✅ Request body parsed:', {
      hasPlace: !!body.place,
      addressType: body.address_type,
      isDefault: body.is_default,
      hasNotes: !!body.notes
    });

    const { place, address_type = 'other', is_default = false, notes } = body;

    // Get user token from Authorization header
    console.log('🔑 Checking authorization header...');
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('❌ No authorization token provided');
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    console.log('✅ Authorization token extracted:', token ? 'Token present' : 'No token');

    // Parse Google Maps place data
    console.log('🗺️ Parsing Google Maps place data...');
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

    console.log('📋 Initial address data:', {
      formatted_address: addressData.formatted_address,
      google_place_id: addressData.google_place_id,
      latitude: addressData.latitude,
      longitude: addressData.longitude,
      address_type: addressData.address_type,
      is_default: addressData.is_default
    });

    // Parse address components from Google Maps
    console.log('🔍 Parsing address components...');
    if (place.address_components) {
      console.log('📍 Found', place.address_components.length, 'address components');
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
      console.log('✅ Address components parsed successfully');
    } else {
      console.warn('⚠️ No address components found in place data');
    }

    // Get current user to associate the address
    console.log('👤 Fetching current user...');
    console.log('🌐 API Base URL:', API_BASE_URL);
    
    const userResponse = await fetch(`${API_BASE_URL}/users/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('📡 User API response status:', userResponse.status);
    console.log('📡 User API response ok:', userResponse.ok);

    if (!userResponse.ok) {
      console.error('❌ Failed to authenticate user:', userResponse.status);
      const errorText = await userResponse.text();
      console.error('❌ User API error response:', errorText);
      return NextResponse.json(
        { error: 'Failed to authenticate user' },
        { status: 401 }
      );
    }

    let userData;
    try {
      const responseText = await userResponse.text();
      if (!responseText.trim()) {
        console.error('❌ Empty response from user API');
        return NextResponse.json(
          { error: 'Invalid response from user service' },
          { status: 502 }
        );
      }
      userData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ Failed to parse user response:', parseError);
      const responseText = await userResponse.text();
      console.error('❌ Raw user response:', responseText);
      return NextResponse.json(
        { error: 'Invalid response from user service' },
        { status: 502 }
      );
    }
    console.log('👤 User data received:', {
      hasUser: !!userData.user,
      userId: userData.user?.id,
      userEmail: userData.user?.email
    });
    
    const userId = userData.user?.id;

    if (!userId) {
      console.error('❌ User ID not found in response');
      return NextResponse.json(
        { error: 'User ID not found' },
        { status: 400 }
      );
    }

    console.log('✅ User authenticated successfully, ID:', userId);

    // If this is set as default, unset other default addresses for this user
    if (is_default) {
      console.log('🔄 Unsetting other default addresses...');
      try {
        const updateResponse = await fetch(`${API_BASE_URL}/addresses`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            where: {
              and: [
                { user: { equals: userId } },
                { is_default: { equals: true } }
              ]
            },
            data: {
              is_default: false
            }
          }),
        });
        console.log('📡 Update default addresses response:', updateResponse.status);
      } catch (updateError) {
        console.warn('⚠️ Failed to update default addresses:', updateError);
      }
    }

    // Create the address in PayloadCMS
    console.log('💾 Creating address in PayloadCMS...');
    const addressPayload = {
      ...addressData,
      user: userId,
    };
    
    console.log('📋 Final address payload:', addressPayload);
    
    const createResponse = await fetch(`${API_BASE_URL}/addresses`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(addressPayload),
    });

    console.log('📡 Create address response status:', createResponse.status);
    console.log('📡 Create address response ok:', createResponse.ok);

    if (!createResponse.ok) {
      console.error('❌ Failed to create address:', createResponse.status);
      let errorData;
      try {
        const errorText = await createResponse.text();
        errorData = errorText ? JSON.parse(errorText) : { error: 'Unknown error' };
      } catch (parseError) {
        console.error('❌ Failed to parse error response:', parseError);
        errorData = { error: 'Invalid error response' };
      }
      console.error('❌ Create address error response:', errorData);
      return NextResponse.json(
        { error: 'Failed to create address', details: errorData },
        { status: createResponse.status }
      );
    }

    let createdAddress;
    try {
      const responseText = await createResponse.text();
      if (!responseText.trim()) {
        console.error('❌ Empty response from create address API');
        return NextResponse.json(
          { error: 'Invalid response from address service' },
          { status: 502 }
        );
      }
      createdAddress = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ Failed to parse create address response:', parseError);
      const responseText = await createResponse.text();
      console.error('❌ Raw create address response:', responseText);
      return NextResponse.json(
        { error: 'Invalid response from address service' },
        { status: 502 }
      );
    }
    console.log('✅ Address created successfully:', {
      id: createdAddress.doc?.id,
      formatted_address: createdAddress.doc?.formatted_address
    });

    console.log('🏠 === ADDRESS CREATION COMPLETED ===');

    return NextResponse.json({
      success: true,
      address: createdAddress,
      message: 'Address saved successfully',
    });

  } catch (error) {
    console.error('💥 === ADDRESS CREATION ERROR ===');
    console.error('❌ Error creating address:', error);
    
    if (error instanceof Error) {
      console.error('❌ Error name:', error.name);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error stack:', error.stack);
    }
    
    console.error('💥 === END ADDRESS ERROR ===');
    
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
      const errorText = await addressesResponse.text();
      console.error('Failed to fetch addresses:', errorText);
      return NextResponse.json(
        { error: 'Failed to fetch addresses' },
        { status: addressesResponse.status }
      );
    }

    let addressesData;
    try {
      const responseText = await addressesResponse.text();
      if (!responseText.trim()) {
        console.warn('Empty response from addresses API');
        return NextResponse.json({
          success: true,
          addresses: [],
          total: 0,
        });
      }
      addressesData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse addresses response:', parseError);
      const responseText = await addressesResponse.text();
      console.error('Raw response:', responseText);
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
    console.error('Error fetching addresses:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}