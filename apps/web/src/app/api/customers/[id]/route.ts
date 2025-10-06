import { NextRequest, NextResponse } from 'next/server';

/**
 * API endpoint for customer operations
 * Proxies requests to PayloadCMS customers collection
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://cms.tap2goph.com/api';

/**
 * PATCH /api/customers/[id]
 * Update a specific customer (e.g., set active address)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  console.log('🏪 === CUSTOMER UPDATE STARTED ===');
  console.log('📋 Customer ID:', id);
  
  try {
    console.log('📥 Parsing request body...');
    const body = await request.json();
    console.log('✅ Request body parsed:', body);

    // Verify user authentication first
    console.log('🔑 Checking user authorization...');
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || (!authHeader.startsWith('Bearer ') && !authHeader.startsWith('users API-Key '))) {
      console.error('❌ No valid user authorization provided');
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      );
    }
    console.log('✅ User authorization verified');

    // Use service account API key for PayloadCMS access (Customers collection requires service/admin role)
    const apiKey = process.env.NEXT_PUBLIC_PAYLOAD_API_KEY;
    if (!apiKey) {
      console.error('❌ Service account API key not configured');
      return NextResponse.json(
        { error: 'Service configuration error' },
        { status: 500 }
      );
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Authorization': `users API-Key ${apiKey}`,
    };
    console.log('✅ Service account authorization configured for PayloadCMS');

    // Update the customer in PayloadCMS
    console.log('🌐 Updating customer in PayloadCMS...');
    console.log('🔗 API URL:', `${API_BASE_URL}/customers/${id}`);
    
    const updateResponse = await fetch(`${API_BASE_URL}/customers/${id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(body),
    });

    console.log('📡 Update response status:', updateResponse.status);
    console.log('📡 Update response ok:', updateResponse.ok);

    if (!updateResponse.ok) {
      console.error('❌ Failed to update customer:', updateResponse.status);
      let errorData;
      try {
        const errorText = await updateResponse.text();
        errorData = errorText ? JSON.parse(errorText) : { error: 'Unknown error' };
      } catch (parseError) {
        console.error('❌ Failed to parse error response:', parseError);
        errorData = { error: 'Invalid error response' };
      }
      console.error('❌ Update customer error response:', errorData);
      return NextResponse.json(
        { error: 'Failed to update customer', details: errorData },
        { status: updateResponse.status }
      );
    }

    let updatedCustomer;
    try {
      const responseText = await updateResponse.text();
      if (!responseText.trim()) {
        console.error('❌ Empty response from update customer API');
        return NextResponse.json(
          { error: 'Invalid response from customer service' },
          { status: 502 }
        );
      }
      updatedCustomer = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ Failed to parse update customer response:', parseError);
      const responseText = await updateResponse.text();
      console.error('❌ Raw update customer response:', responseText);
      return NextResponse.json(
        { error: 'Invalid response from customer service' },
        { status: 502 }
      );
    }

    console.log('✅ Customer updated successfully:', {
      id: updatedCustomer.doc?.id || updatedCustomer.id,
      activeAddress: updatedCustomer.doc?.activeAddress || updatedCustomer.activeAddress
    });

    console.log('🎉 === CUSTOMER UPDATE COMPLETED ===');
    return NextResponse.json({
      success: true,
      customer: updatedCustomer.doc || updatedCustomer,
    });

  } catch (error) {
    console.error('💥 === CUSTOMER UPDATE ERROR ===');
    console.error('❌ Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      customerId: id
    });
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/customers/[id]
 * Get a specific customer
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  console.log('📖 === CUSTOMER GET STARTED ===');
  console.log('📋 Customer ID:', id);
  
  try {
    // Verify user authentication first
    console.log('🔑 Checking user authorization...');
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || (!authHeader.startsWith('Bearer ') && !authHeader.startsWith('users API-Key '))) {
      console.error('❌ No valid user authorization provided');
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      );
    }
    console.log('✅ User authorization verified');

    // Use service account API key for PayloadCMS access (Customers collection requires service/admin role)
    const apiKey = process.env.NEXT_PUBLIC_PAYLOAD_API_KEY;
    if (!apiKey) {
      console.error('❌ Service account API key not configured');
      return NextResponse.json(
        { error: 'Service configuration error' },
        { status: 500 }
      );
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Authorization': `users API-Key ${apiKey}`,
    };
    console.log('✅ Service account authorization configured for PayloadCMS');

    // Get the customer from PayloadCMS
    console.log('🌐 Fetching customer from PayloadCMS...');
    console.log('🔗 API URL:', `${API_BASE_URL}/customers/${id}?populate=activeAddress`);
    
    const getResponse = await fetch(`${API_BASE_URL}/customers/${id}?populate=activeAddress`, {
      method: 'GET',
      headers,
    });

    console.log('📡 Get response status:', getResponse.status);
    console.log('📡 Get response ok:', getResponse.ok);

    if (!getResponse.ok) {
      console.error('❌ Failed to get customer:', getResponse.status);
      let errorData;
      try {
        const errorText = await getResponse.text();
        errorData = errorText ? JSON.parse(errorText) : { error: 'Unknown error' };
      } catch (parseError) {
        console.error('❌ Failed to parse error response:', parseError);
        errorData = { error: 'Invalid error response' };
      }
      console.error('❌ Get customer error response:', errorData);
      return NextResponse.json(
        { error: 'Failed to get customer', details: errorData },
        { status: getResponse.status }
      );
    }

    let customer;
    try {
      const responseText = await getResponse.text();
      if (!responseText.trim()) {
        console.error('❌ Empty response from get customer API');
        return NextResponse.json(
          { error: 'Invalid response from customer service' },
          { status: 502 }
        );
      }
      customer = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ Failed to parse get customer response:', parseError);
      const responseText = await getResponse.text();
      console.error('❌ Raw get customer response:', responseText);
      return NextResponse.json(
        { error: 'Invalid response from customer service' },
        { status: 502 }
      );
    }

    console.log('✅ Customer retrieved successfully:', {
      id: customer.id,
      activeAddress: customer.activeAddress
    });

    console.log('🎉 === CUSTOMER GET COMPLETED ===');
    return NextResponse.json({
      success: true,
      customer: customer,
    });

  } catch (error) {
    console.error('💥 === CUSTOMER GET ERROR ===');
    console.error('❌ Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      customerId: id
    });
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}