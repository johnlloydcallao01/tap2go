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
  
  try {
    // Verify user authentication first
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || (!authHeader.startsWith('Bearer ') && !authHeader.startsWith('users API-Key '))) {
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      );
    }

    // Use service account API key for PayloadCMS access
    const apiKey = process.env.NEXT_PUBLIC_PAYLOAD_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Service configuration error' },
        { status: 500 }
      );
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Authorization': `users API-Key ${apiKey}`,
    };

    // Delete the address from PayloadCMS
    const deleteResponse = await fetch(`${API_BASE_URL}/addresses/${id}`, {
      method: 'DELETE',
      headers,
    });

    if (!deleteResponse.ok) {
      let errorData;
      try {
        const errorText = await deleteResponse.text();
        errorData = errorText ? JSON.parse(errorText) : { error: 'Unknown error' };
      } catch {
        errorData = { error: 'Invalid error response' };
      }
      return NextResponse.json(
        { error: 'Failed to delete address', details: errorData },
        { status: deleteResponse.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Address deleted successfully'
    });

  } catch (error) {
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
  
  try {
    const body = await request.json();

    // Verify user authentication first
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || (!authHeader.startsWith('Bearer ') && !authHeader.startsWith('users API-Key '))) {
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      );
    }

    // Use service account API key for PayloadCMS access
    const apiKey = process.env.NEXT_PUBLIC_PAYLOAD_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Service configuration error' },
        { status: 500 }
      );
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Authorization': `users API-Key ${apiKey}`,
    };

    // Update the address in PayloadCMS
    const updateResponse = await fetch(`${API_BASE_URL}/addresses/${id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(body),
    });

    if (!updateResponse.ok) {
      let errorData;
      try {
        const errorText = await updateResponse.text();
        errorData = errorText ? JSON.parse(errorText) : { error: 'Unknown error' };
      } catch {
        errorData = { error: 'Invalid error response' };
      }
      return NextResponse.json(
        { error: 'Failed to update address', details: errorData },
        { status: updateResponse.status }
      );
    }

    let updatedAddress;
    try {
      const responseText = await updateResponse.text();
      if (!responseText.trim()) {
        return NextResponse.json(
          { error: 'Invalid response from address service' },
          { status: 502 }
        );
      }
      updatedAddress = JSON.parse(responseText);
    } catch {
      return NextResponse.json(
        { error: 'Invalid response format from address service' },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      address: updatedAddress
    });

  } catch (error) {
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
  
  try {
    // Verify user authentication first
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || (!authHeader.startsWith('Bearer ') && !authHeader.startsWith('users API-Key '))) {
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      );
    }

    // Use service account API key for PayloadCMS access
    const apiKey = process.env.NEXT_PUBLIC_PAYLOAD_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Service configuration error' },
        { status: 500 }
      );
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Authorization': `users API-Key ${apiKey}`,
    };

    // Fetch the address from PayloadCMS
    const response = await fetch(`${API_BASE_URL}/addresses/${id}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      let errorData;
      try {
        const errorText = await response.text();
        errorData = errorText ? JSON.parse(errorText) : { error: 'Unknown error' };
      } catch {
        errorData = { error: 'Invalid error response' };
      }
      return NextResponse.json(
        { error: 'Failed to fetch address', details: errorData },
        { status: response.status }
      );
    }

    let address;
    try {
      const responseText = await response.text();
      if (!responseText.trim()) {
        return NextResponse.json(
          { error: 'Invalid response from address service' },
          { status: 502 }
        );
      }
      address = JSON.parse(responseText);
    } catch {
      return NextResponse.json(
        { error: 'Invalid response format from address service' },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      address
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}