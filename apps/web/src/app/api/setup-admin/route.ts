import { NextResponse } from 'next/server';
import { setupSuperAdmin, verifyAdminSetup } from '@/scripts/setup-admin';

export async function POST() {
  try {
    // Check if admin already exists first
    const verification = await verifyAdminSetup();
    
    if (verification.isValid) {
      return NextResponse.json({
        success: true,
        message: 'Super admin already exists and is properly configured',
        admin: {
          uid: verification.userRecord?.uid,
          email: verification.userRecord?.email,
          customClaims: verification.customClaims
        }
      });
    }

    // Setup super admin
    const result = await setupSuperAdmin();

    return NextResponse.json({
      success: true,
      message: 'Super admin created successfully',
      admin: result
    });

  } catch (error) {
    console.error('Error setting up admin:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Failed to setup admin user'
      },
      { status: 500 }
    );
  }
}
