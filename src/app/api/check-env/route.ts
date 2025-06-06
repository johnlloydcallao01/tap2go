import { NextResponse } from 'next/server';

/**
 * Environment Variables Checker API
 * Verifies that all required environment variables are present
 * Useful for debugging production deployment issues
 */
export async function GET() {
  try {
    console.log('🔍 Checking environment variables...');
    
    const requiredVars = [
      'DATABASE_URL',
      'DATABASE_SSL',
      'DATABASE_POOL_MIN',
      'DATABASE_POOL_MAX',
      'DATABASE_CONNECTION_TIMEOUT'
    ];
    
    const optionalVars = [
      'VERCEL',
      'NODE_ENV',
      'NEXT_PUBLIC_FIREBASE_API_KEY',
      'FIREBASE_ADMIN_PROJECT_ID',
      'CLOUDINARY_API_KEY'
    ];
    
    const envCheck = {
      required: {} as Record<string, { present: boolean; value?: string }>,
      optional: {} as Record<string, { present: boolean; value?: string }>,
      environment: {
        isVercel: process.env.VERCEL === '1',
        nodeEnv: process.env.NODE_ENV,
        platform: process.env.VERCEL ? 'Vercel' : 'Local/Other'
      }
    };
    
    // Check required variables
    for (const varName of requiredVars) {
      const value = process.env[varName];
      envCheck.required[varName] = {
        present: !!value,
        value: value ? (varName.includes('URL') || varName.includes('KEY') ? 
          value.substring(0, 20) + '...' : value) : undefined
      };
    }
    
    // Check optional variables
    for (const varName of optionalVars) {
      const value = process.env[varName];
      envCheck.optional[varName] = {
        present: !!value,
        value: value ? (varName.includes('KEY') || varName.includes('SECRET') ? 
          value.substring(0, 10) + '...' : value) : undefined
      };
    }
    
    // Check for missing required variables
    const missingRequired = Object.entries(envCheck.required)
      .filter(([, info]) => !info.present)
      .map(([name]) => name);
    
    const allRequiredPresent = missingRequired.length === 0;
    
    console.log('Environment check completed:', {
      allRequiredPresent,
      missingRequired,
      platform: envCheck.environment.platform
    });
    
    return NextResponse.json({
      success: allRequiredPresent,
      message: allRequiredPresent ? 
        'All required environment variables are present' : 
        `Missing required variables: ${missingRequired.join(', ')}`,
      envCheck,
      missingRequired,
      recommendations: allRequiredPresent ? [] : [
        'Ensure all required environment variables are set in your deployment platform',
        'For Vercel: Check Project Settings > Environment Variables',
        'Verify that variables are set for the correct environment (Production/Preview/Development)',
        'Redeploy after adding missing variables'
      ]
    });
    
  } catch (error) {
    console.error('❌ Environment check failed:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Environment check failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
