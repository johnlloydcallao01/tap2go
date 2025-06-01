import { NextApiRequest, NextApiResponse } from 'next';
import { NextRequest } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';

export interface AuthenticatedRequest extends NextApiRequest {
  user: {
    uid: string;
    email: string;
    role: string;
  };
}

export interface AuthResult {
  success: boolean;
  user?: {
    uid: string;
    email: string;
    role: string;
  };
  message?: string;
}

// App Router version - for /app/api routes
export const verifyAdminAuth = async (request: NextRequest): Promise<AuthResult> => {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        success: false,
        message: 'Missing or invalid authorization header'
      };
    }

    // Extract the token
    const token = authHeader.split('Bearer ')[1];

    // Verify the token with Firebase Admin
    const decodedToken = await adminAuth.verifyIdToken(token);

    // Check if user has admin role
    if (decodedToken.role !== 'admin') {
      return {
        success: false,
        message: 'Admin access required'
      };
    }

    return {
      success: true,
      user: {
        uid: decodedToken.uid,
        email: decodedToken.email || '',
        role: decodedToken.role
      }
    };

  } catch (error) {
    console.error('Admin auth error:', error);
    return {
      success: false,
      message: 'Invalid or expired token'
    };
  }
};

// Pages Router version - for /pages/api routes (legacy)
export const verifyAdminAuthPages = async (
  req: NextApiRequest,
  res: NextApiResponse,
  handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>
) => {
  try {
    // Get the authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Missing or invalid authorization header'
      });
    }

    // Extract the token
    const token = authHeader.split('Bearer ')[1];

    // Verify the token with Firebase Admin
    const decodedToken = await adminAuth.verifyIdToken(token);

    // Check if user has admin role
    if (decodedToken.role !== 'admin') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Admin access required'
      });
    }

    // Add user info to request
    (req as AuthenticatedRequest).user = {
      uid: decodedToken.uid,
      email: decodedToken.email || '',
      role: decodedToken.role
    };

    // Call the handler
    await handler(req as AuthenticatedRequest, res);

  } catch (error) {
    console.error('Admin auth error:', error);
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or expired token'
    });
  }
};

// Helper function to check if user is admin
export const isAdmin = (customClaims: any): boolean => {
  return customClaims?.role === 'admin';
};

// Helper function to create admin custom claims
export const createAdminClaims = () => {
  return { role: 'admin' };
};
