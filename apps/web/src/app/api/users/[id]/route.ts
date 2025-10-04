import { NextRequest, NextResponse } from 'next/server';

/**
 * API endpoint for user operations
 * Proxies requests to PayloadCMS users collection
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://cms.tap2goph.com/api';

/**
 * PATCH /api/users/[id]
 * Update a specific user (e.g., set active address)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  console.log('👤 === USER UPDATE STARTED ===');
  console.log('📋 User ID:', id);
  
  try {
    console.log('📥 Parsing request body...');
    const body = await request.json();
    console.log('✅ Request body parsed:', body);

    // Get user token from Authorization header
    console.log('🔑 Checking authorization header...');
    const authHeader = request.headers.get('authorization');
    
    let headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      headers['Authorization'] = `Bearer ${token}`;
      console.log('✅ Bearer token authorization added');
    } else if (authHeader && authHeader.startsWith('users API-Key ')) {
      headers['Authorization'] = authHeader;
      console.log('✅ API Key authorization added');
    } else {
      console.error('❌ No valid authorization provided');
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      );
    }

    // Update the user in PayloadCMS
    console.log('🌐 Updating user in PayloadCMS...');
    console.log('🔗 API URL:', `${API_BASE_URL}/users/${id}`);
    
    const updateResponse = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(body),
    });

    console.log('📡 Update response status:', updateResponse.status);
    console.log('📡 Update response ok:', updateResponse.ok);

    if (!updateResponse.ok) {
      console.error('❌ Failed to update user:', updateResponse.status);
      let errorData;
      try {
        const errorText = await updateResponse.text();
        errorData = errorText ? JSON.parse(errorText) : { error: 'Unknown error' };
      } catch (parseError) {
        console.error('❌ Failed to parse error response:', parseError);
        errorData = { error: 'Invalid error response' };
      }
      console.error('❌ Update user error response:', errorData);
      return NextResponse.json(
        { error: 'Failed to update user', details: errorData },
        { status: updateResponse.status }
      );
    }

    let updatedUser;
    try {
      const responseText = await updateResponse.text();
      if (!responseText.trim()) {
        console.error('❌ Empty response from update user API');
        return NextResponse.json(
          { error: 'Invalid response from user service' },
          { status: 502 }
        );
      }
      updatedUser = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ Failed to parse update user response:', parseError);
      const responseText = await updateResponse.text();
      console.error('❌ Raw update user response:', responseText);
      return NextResponse.json(
        { error: 'Invalid response from user service' },
        { status: 502 }
      );
    }
    console.log('✅ User updated successfully:', {
      id: updatedUser.doc?.id || updatedUser.id,
      activeAddress: updatedUser.doc?.activeAddress || updatedUser.activeAddress
    });

    console.log('👤 === USER UPDATE COMPLETED ===');

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: 'User updated successfully',
    });

  } catch (error) {
    console.error('💥 === USER UPDATE ERROR ===');
    console.error('❌ Error updating user:', error);
    
    if (error instanceof Error) {
      console.error('❌ Error name:', error.name);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error stack:', error.stack);
    }
    
    console.error('💥 === END UPDATE ERROR ===');
    
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/users/[id]
 * Get a specific user
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  console.log('📖 === USER GET STARTED ===');
  console.log('📋 User ID:', id);
  
  try {
    // Get user token from Authorization header
    console.log('🔑 Checking authorization header...');
    const authHeader = request.headers.get('authorization');
    
    let headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      headers['Authorization'] = `Bearer ${token}`;
      console.log('✅ Bearer token authorization added');
    } else if (authHeader && authHeader.startsWith('users API-Key ')) {
      headers['Authorization'] = authHeader;
      console.log('✅ API Key authorization added');
    } else {
      console.error('❌ No valid authorization provided');
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      );
    }

    // Get the user from PayloadCMS
    console.log('🌐 Fetching user from PayloadCMS...');
    console.log('🔗 API URL:', `${API_BASE_URL}/users/${id}`);
    
    const getResponse = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'GET',
      headers,
    });

    console.log('📡 Get response status:', getResponse.status);
    console.log('📡 Get response ok:', getResponse.ok);

    if (!getResponse.ok) {
      console.error('❌ Failed to get user:', getResponse.status);
      let errorData;
      try {
        const errorText = await getResponse.text();
        errorData = errorText ? JSON.parse(errorText) : { error: 'Unknown error' };
      } catch (parseError) {
        console.error('❌ Failed to parse error response:', parseError);
        errorData = { error: 'Invalid error response' };
      }
      console.error('❌ Get user error response:', errorData);
      return NextResponse.json(
        { error: 'Failed to get user', details: errorData },
        { status: getResponse.status }
      );
    }

    let userData;
    try {
      const responseText = await getResponse.text();
      if (!responseText.trim()) {
        console.error('❌ Empty response from get user API');
        return NextResponse.json(
          { error: 'Invalid response from user service' },
          { status: 502 }
        );
      }
      userData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ Failed to parse get user response:', parseError);
      const responseText = await getResponse.text();
      console.error('❌ Raw get user response:', responseText);
      return NextResponse.json(
        { error: 'Invalid response from user service' },
        { status: 502 }
      );
    }
    console.log('✅ User fetched successfully:', {
      id: userData.id,
      activeAddress: userData.activeAddress
    });

    console.log('📖 === USER GET COMPLETED ===');

    return NextResponse.json({
      success: true,
      user: userData,
      message: 'User fetched successfully',
    });

  } catch (error) {
    console.error('💥 === USER GET ERROR ===');
    console.error('❌ Error getting user:', error);
    
    if (error instanceof Error) {
      console.error('❌ Error name:', error.name);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error stack:', error.stack);
    }
    
    console.error('💥 === END GET ERROR ===');
    
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}