import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '../../../lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const { uid } = await request.json();
    
    if (!uid) {
      return NextResponse.json(
        { success: false, message: 'UID is required' },
        { status: 400 }
      );
    }

    if (!adminAuth) {
      return NextResponse.json(
        { success: false, message: 'Firebase Admin not initialized' },
        { status: 500 }
      );
    }

    // Set custom claims for driver
    await adminAuth.setCustomUserClaims(uid, { 
      role: 'driver',
      status: 'approved' 
    });

    return NextResponse.json({
      success: true,
      message: 'Driver role set successfully',
      uid
    });

  } catch (error) {
    console.error('Set driver role API error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
