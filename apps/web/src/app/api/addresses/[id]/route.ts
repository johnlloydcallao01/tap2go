import { NextRequest, NextResponse } from 'next/server';

/**
 * API endpoint for individual address operations
 * Proxies requests to PayloadCMS addresses collection
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://cms.tap2goph.com/api';

/**
 * DELETE /api/addresses/[id]
 * Delete a specific address
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  console.log('🗑️ === ADDRESS DELETE STARTED ===');
  console.log('📋 Address ID:', id);
  
  try {
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
    console.log('✅ Authorization token extracted');

    // Delete the address from PayloadCMS
    console.log('🌐 Deleting address from PayloadCMS...');
    console.log('🔗 API URL:', `${API_BASE_URL}/addresses/${id}`);
    
    const deleteResponse = await fetch(`${API_BASE_URL}/addresses/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('📡 Delete response status:', deleteResponse.status);
    console.log('📡 Delete response ok:', deleteResponse.ok);

    if (!deleteResponse.ok) {
      console.error('❌ Failed to delete address:', deleteResponse.status);
      let errorData;
      try {
        const errorText = await deleteResponse.text();
        errorData = errorText ? JSON.parse(errorText) : { error: 'Unknown error' };
      } catch (parseError) {
        console.error('❌ Failed to parse error response:', parseError);
        errorData = { error: 'Invalid error response' };
      }
      console.error('❌ Delete address error response:', errorData);
      return NextResponse.json(
        { error: 'Failed to delete address', details: errorData },
        { status: deleteResponse.status }
      );
    }

    let deletedAddress;
    try {
      const responseText = await deleteResponse.text();
      if (responseText.trim()) {
        deletedAddress = JSON.parse(responseText);
      } else {
        // Some APIs return empty response on successful delete
        deletedAddress = { message: 'Address deleted successfully' };
      }
    } catch (parseError) {
      console.warn('⚠️ Could not parse delete response, assuming success');
      deletedAddress = { message: 'Address deleted successfully' };
    }

    console.log('✅ Address deleted successfully');
    console.log('🗑️ === ADDRESS DELETE COMPLETED ===');

    return NextResponse.json({
      success: true,
      message: 'Address deleted successfully',
      data: deletedAddress,
    });

  } catch (error) {
    console.error('💥 === ADDRESS DELETE ERROR ===');
    console.error('❌ Error deleting address:', error);
    
    if (error instanceof Error) {
      console.error('❌ Error name:', error.name);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error stack:', error.stack);
    }
    
    console.error('💥 === END DELETE ERROR ===');
    
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/addresses/[id]
 * Update a specific address
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  console.log('✏️ === ADDRESS UPDATE STARTED ===');
  console.log('📋 Address ID:', id);
  
  try {
    console.log('📥 Parsing request body...');
    const body = await request.json();
    console.log('✅ Request body parsed');

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
    console.log('✅ Authorization token extracted');

    // Update the address in PayloadCMS
    console.log('🌐 Updating address in PayloadCMS...');
    console.log('🔗 API URL:', `${API_BASE_URL}/addresses/${id}`);
    
    const updateResponse = await fetch(`${API_BASE_URL}/addresses/${id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    console.log('📡 Update response status:', updateResponse.status);
    console.log('📡 Update response ok:', updateResponse.ok);

    if (!updateResponse.ok) {
      console.error('❌ Failed to update address:', updateResponse.status);
      let errorData;
      try {
        const errorText = await updateResponse.text();
        errorData = errorText ? JSON.parse(errorText) : { error: 'Unknown error' };
      } catch (parseError) {
        console.error('❌ Failed to parse error response:', parseError);
        errorData = { error: 'Invalid error response' };
      }
      console.error('❌ Update address error response:', errorData);
      return NextResponse.json(
        { error: 'Failed to update address', details: errorData },
        { status: updateResponse.status }
      );
    }

    let updatedAddress;
    try {
      const responseText = await updateResponse.text();
      if (!responseText.trim()) {
        console.error('❌ Empty response from update address API');
        return NextResponse.json(
          { error: 'Invalid response from address service' },
          { status: 502 }
        );
      }
      updatedAddress = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ Failed to parse update address response:', parseError);
      const responseText = await updateResponse.text();
      console.error('❌ Raw update address response:', responseText);
      return NextResponse.json(
        { error: 'Invalid response from address service' },
        { status: 502 }
      );
    }

    console.log('✅ Address updated successfully');
    console.log('✏️ === ADDRESS UPDATE COMPLETED ===');

    return NextResponse.json({
      success: true,
      address: updatedAddress,
      message: 'Address updated successfully',
    });

  } catch (error) {
    console.error('💥 === ADDRESS UPDATE ERROR ===');
    console.error('❌ Error updating address:', error);
    
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
 * GET /api/addresses/[id]
 * Get a specific address
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  console.log('📖 === ADDRESS GET STARTED ===');
  console.log('📋 Address ID:', id);
  
  try {
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
    console.log('✅ Authorization token extracted');

    // Get the address from PayloadCMS
    console.log('🌐 Fetching address from PayloadCMS...');
    console.log('🔗 API URL:', `${API_BASE_URL}/addresses/${id}`);
    
    const getResponse = await fetch(`${API_BASE_URL}/addresses/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('📡 Get response status:', getResponse.status);
    console.log('📡 Get response ok:', getResponse.ok);

    if (!getResponse.ok) {
      console.error('❌ Failed to get address:', getResponse.status);
      let errorData;
      try {
        const errorText = await getResponse.text();
        errorData = errorText ? JSON.parse(errorText) : { error: 'Unknown error' };
      } catch (parseError) {
        console.error('❌ Failed to parse error response:', parseError);
        errorData = { error: 'Invalid error response' };
      }
      console.error('❌ Get address error response:', errorData);
      return NextResponse.json(
        { error: 'Failed to get address', details: errorData },
        { status: getResponse.status }
      );
    }

    let address;
    try {
      const responseText = await getResponse.text();
      if (!responseText.trim()) {
        console.error('❌ Empty response from get address API');
        return NextResponse.json(
          { error: 'Invalid response from address service' },
          { status: 502 }
        );
      }
      address = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ Failed to parse get address response:', parseError);
      const responseText = await getResponse.text();
      console.error('❌ Raw get address response:', responseText);
      return NextResponse.json(
        { error: 'Invalid response from address service' },
        { status: 502 }
      );
    }

    console.log('✅ Address fetched successfully');
    console.log('📖 === ADDRESS GET COMPLETED ===');

    return NextResponse.json({
      success: true,
      address: address,
    });

  } catch (error) {
    console.error('💥 === ADDRESS GET ERROR ===');
    console.error('❌ Error getting address:', error);
    
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