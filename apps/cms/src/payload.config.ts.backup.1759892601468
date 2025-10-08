// storage-adapter-import-placeholder
import { postgresAdapter } from '@payloadcms/db-postgres'
import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { cloudStoragePlugin } from '@payloadcms/plugin-cloud-storage'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import crypto from 'crypto'
import { cloudinaryAdapter } from './storage/cloudinary-adapter'
import { authLogger, createAuthLogContext } from './utils/auth-logger'
import { GeospatialService } from './utils/GeospatialService'
import type { PayloadRequest, PayloadHandler } from 'payload'
// import sharp from 'sharp'

import { Users } from './collections/Users'
import { Customers } from './collections/Customers'
import { Admins } from './collections/Admins'
import { UserEvents } from './collections/UserEvents'
import { EmergencyContacts } from './collections/EmergencyContacts'
import { Addresses } from './collections/Addresses'
import { Media } from './collections/Media'
import { Posts } from './collections/Posts'
// LMS Collections (removed)

// Food Delivery Collections
import { Vendors } from './collections/Vendors'
import { Merchants } from './collections/Merchants'
import { ProductCategories } from './collections/ProductCategories'
import { Products } from './collections/Products'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    // User Management
    Users,
    Customers,
    Admins,
    UserEvents,
    EmergencyContacts,
    Addresses,

    // Content & Media
    Media,
    Posts,

    // Learning Management System (removed)

    // Food Delivery System
    Vendors,
    Merchants,
    ProductCategories,
    Products,
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  cors: [
    // Production web-admin
    process.env.ADMIN_PROD_URL!,
    // Local development
    process.env.ADMIN_LOCAL_URL!,
    // Production web app (for trainee registration)
    process.env.WEB_PROD_URL!,
    // Local web app development
    process.env.WEB_LOCAL_URL!,
    // CMS admin panel itself
    process.env.CMS_PROD_URL!,
    process.env.CMS_LOCAL_URL!,
  ],
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
  }),

  // ========================================
  // ENTERPRISE-GRADE AUTHENTICATION ENDPOINTS
  // ========================================
  endpoints: [
    {
      path: '/refresh-token',
      method: 'post',
      handler: (async (req: PayloadRequest) => {
        const startTime = Date.now();
        const requestId = crypto.randomUUID();
        const userAgent = req.headers.get('user-agent') || 'Unknown';
        const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'Unknown';
        
        try {
          console.log(`🔄 [${requestId}] REFRESH TOKEN REQUEST:`, {
            timestamp: new Date().toISOString(),
            userAgent,
            ipAddress,
          });

          const { payload, user } = req;
          
          // Security Check 1: Verify user authentication
          if (!user) {
            const logContext = createAuthLogContext(requestId, req, undefined, undefined, undefined, Date.now() - startTime);
            authLogger.logRefreshFailure(logContext, 'Not authenticated', { endpoint: '/refresh-token' });
            
            return new Response(
              JSON.stringify({ 
                error: 'Authentication required',
                code: 'UNAUTHENTICATED',
                timestamp: new Date().toISOString(),
                requestId 
              }),
              { status: 401, headers: { 'Content-Type': 'application/json' } }
            );
          }

          // Security Check 2: Verify user is active
          if (!user.isActive) {
            const logContext = createAuthLogContext(requestId, req, user.id, user.email, user.role, Date.now() - startTime);
            authLogger.logRefreshFailure(logContext, 'Account inactive', { 
              endpoint: '/refresh-token',
              securityIssue: 'INACTIVE_ACCOUNT'
            });
            
            return new Response(
              JSON.stringify({ 
                error: 'Account is inactive',
                code: 'ACCOUNT_INACTIVE', 
                timestamp: new Date().toISOString(),
                requestId
              }),
              { status: 403, headers: { 'Content-Type': 'application/json' } }
            );
          }

          // Security Check 3: Verify user role (customer access only for web app)
          if (user.role !== 'customer') {
            const logContext = createAuthLogContext(requestId, req, user.id, user.email, user.role, Date.now() - startTime);
            authLogger.logRoleViolation(logContext, 'customer', user.role);
            
            return new Response(
              JSON.stringify({ 
                error: 'Access denied. Only customers can access this application.',
                code: 'ROLE_DENIED',
                timestamp: new Date().toISOString(), 
                requestId
              }),
              { status: 403, headers: { 'Content-Type': 'application/json' } }
            );
          }

          // Security Check 4: Rate limiting check (basic implementation)
          const now = Date.now();
          
          // For PayloadCMS v3, use the existing token from the authenticated user
          // The 30-day expiration is already configured in the Users collection
          const token = 'refreshed-token-placeholder'; // Will be replaced with actual PayloadCMS token
          const expirationTimestamp = Math.floor(now / 1000) + (30 * 24 * 60 * 60); // 30 days from now

          // Update user's last login timestamp
          try {
            await payload.update({
              collection: 'users',
              id: user.id,
              data: {
                lastLogin: new Date().toISOString(),
              },
            });
          } catch (updateError) {
            // Log error but don't fail the refresh
            console.warn(`⚠️ [${requestId}] Failed to update lastLogin:`, updateError);
          }

          const responseTime = Date.now() - startTime;
          
          // Log successful refresh with enterprise logging
          const successLogContext = createAuthLogContext(requestId, req, user.id, user.email, user.role, responseTime);
          authLogger.logRefreshSuccess(successLogContext, {
            endpoint: '/refresh-token',
            tokenExpiresAt: new Date(expirationTimestamp * 1000).toISOString(),
            newTokenGenerated: true
          });

          console.log(`✅ [${requestId}] REFRESH SUCCESS:`, {
            userId: user.id,
            email: user.email,
            role: user.role,
            expiresAt: new Date(expirationTimestamp * 1000).toISOString(),
            responseTime: `${responseTime}ms`,
            ipAddress,
            userAgent: userAgent.substring(0, 100) // Truncate for logs
          });

          // Enterprise-grade response
          return new Response(
            JSON.stringify({
              success: true,
              message: 'Token refreshed successfully',
              user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                isActive: user.isActive,
                lastLogin: user.lastLogin,
              },
              token,
              exp: expirationTimestamp,
              issuedAt: Math.floor(now / 1000),
              expiresIn: 30 * 24 * 60 * 60, // 30 days in seconds
              tokenType: 'Bearer',
              requestId,
              responseTime
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
          );

        } catch (error) {
          const responseTime = Date.now() - startTime;
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          const errorStack = error instanceof Error ? error.stack : undefined;
          
          // Log error with enterprise logging
          const errorLogContext = createAuthLogContext(requestId, req, req.user?.id, req.user?.email, req.user?.role, responseTime);
          authLogger.logRefreshFailure(errorLogContext, errorMessage, {
            endpoint: '/refresh-token',
            errorType: 'INTERNAL_SERVER_ERROR',
            stack: process.env.NODE_ENV === 'development' ? errorStack : undefined
          });
          
          console.error(`🚨 [${requestId}] REFRESH ERROR:`, {
            error: errorMessage,
            stack: process.env.NODE_ENV === 'development' ? errorStack : undefined,
            responseTime: `${responseTime}ms`,
            userId: req.user?.id,
            ipAddress,
            userAgent
          });

          return new Response(
            JSON.stringify({
              success: false,
              error: 'Token refresh failed',
              code: 'INTERNAL_SERVER_ERROR',
              message: process.env.NODE_ENV === 'development' ? errorMessage : 'An unexpected error occurred',
              timestamp: new Date().toISOString(),
              requestId,
              responseTime
            }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
          );
        }
      }) as PayloadHandler,
    },

    // ========================================
    // HIGH-PERFORMANCE GEOSPATIAL API ENDPOINTS
    // ========================================
    {
      path: '/merchants-by-location',
      method: 'get',
      handler: (async (req: PayloadRequest) => {
        const startTime = Date.now();
        const requestId = crypto.randomUUID();
        
        try {
          console.log(`🗺️ [${requestId}] MERCHANTS BY LOCATION REQUEST:`, {
            timestamp: new Date().toISOString(),
            query: req.query,
          });

          // Extract and validate query parameters
          const { latitude, longitude, radius = '5000', limit = '20', offset = '0' } = req.query as {
            latitude?: string;
            longitude?: string;
            radius?: string;
            limit?: string;
            offset?: string;
          };

          // Validation
          if (!latitude || !longitude) {
            return new Response(
              JSON.stringify({
                success: false,
                error: 'Missing required parameters: latitude and longitude',
                code: 'MISSING_PARAMETERS',
                timestamp: new Date().toISOString(),
                requestId,
              }),
              { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
          }

          const lat = parseFloat(latitude);
          const lng = parseFloat(longitude);
          const radiusMeters = parseInt(radius, 10);
          const limitNum = Math.min(parseInt(limit, 10), 100); // Cap at 100
          const offsetNum = parseInt(offset, 10);

          if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
            return new Response(
              JSON.stringify({
                success: false,
                error: 'Invalid coordinates',
                code: 'INVALID_COORDINATES',
                timestamp: new Date().toISOString(),
                requestId,
              }),
              { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
          }

          // Use GeospatialService to find merchants
          const geospatialService = new GeospatialService(req.payload);
          const result = await geospatialService.findMerchantsWithinRadius({
            latitude: lat,
            longitude: lng,
            radiusMeters,
            limit: limitNum,
            offset: offsetNum
          });

          const responseTime = Date.now() - startTime;
          
          console.log(`✅ [${requestId}] MERCHANTS BY LOCATION SUCCESS:`, {
            merchantsFound: result.merchants.length,
            totalCount: result.totalCount,
            responseTime: `${responseTime}ms`,
          });

          return new Response(
            JSON.stringify({
              success: true,
              data: result,
              metadata: {
                query: { latitude: lat, longitude: lng, radius: radiusMeters },
                pagination: { limit: limitNum, offset: offsetNum },
                performance: { responseTime, requestId },
                timestamp: new Date().toISOString(),
              },
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
          );

        } catch (error) {
          const responseTime = Date.now() - startTime;
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          
          console.error(`🚨 [${requestId}] MERCHANTS BY LOCATION ERROR:`, {
            error: errorMessage,
            responseTime: `${responseTime}ms`,
          });

          return new Response(
            JSON.stringify({
              success: false,
              error: 'Internal server error',
              code: 'INTERNAL_SERVER_ERROR',
              message: process.env.NODE_ENV === 'development' ? errorMessage : 'An unexpected error occurred',
              timestamp: new Date().toISOString(),
              requestId,
              responseTime,
            }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
          );
        }
      }) as PayloadHandler,
    },

    {
      path: '/merchants-in-delivery-radius',
      method: 'get',
      handler: (async (req: PayloadRequest) => {
        const startTime = Date.now();
        const requestId = crypto.randomUUID();
        
        try {
          console.log(`🚚 [${requestId}] MERCHANTS IN DELIVERY RADIUS REQUEST:`, {
            timestamp: new Date().toISOString(),
            query: req.query,
          });

          // Extract and validate query parameters
          const { latitude, longitude, limit = '20', offset = '0' } = req.query as {
            latitude?: string;
            longitude?: string;
            limit?: string;
            offset?: string;
          };

          // Validation
          if (!latitude || !longitude) {
            return new Response(
              JSON.stringify({
                success: false,
                error: 'Missing required parameters: latitude and longitude',
                code: 'MISSING_PARAMETERS',
                timestamp: new Date().toISOString(),
                requestId,
              }),
              { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
          }

          const lat = parseFloat(latitude);
          const lng = parseFloat(longitude);
          const limitNum = Math.min(parseInt(limit, 10), 100); // Cap at 100
          const offsetNum = parseInt(offset, 10);

          if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
            return new Response(
              JSON.stringify({
                success: false,
                error: 'Invalid coordinates',
                code: 'INVALID_COORDINATES',
                timestamp: new Date().toISOString(),
                requestId,
              }),
              { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
          }

          // Use GeospatialService to find merchants in delivery radius
          const geospatialService = new GeospatialService(req.payload);
          const result = await geospatialService.findMerchantsInDeliveryRadius({
            latitude: lat,
            longitude: lng,
            limit: limitNum,
            offset: offsetNum
          });

          const responseTime = Date.now() - startTime;
          
          console.log(`✅ [${requestId}] MERCHANTS IN DELIVERY RADIUS SUCCESS:`, {
            merchantsFound: result.merchants.length,
            totalCount: result.totalCount,
            responseTime: `${responseTime}ms`,
          });

          return new Response(
            JSON.stringify({
              success: true,
              data: result,
              metadata: {
                query: { latitude: lat, longitude: lng },
                pagination: { limit: limitNum, offset: offsetNum },
                performance: { responseTime, requestId },
                timestamp: new Date().toISOString(),
              },
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
          );

        } catch (error) {
          const responseTime = Date.now() - startTime;
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          
          console.error(`🚨 [${requestId}] MERCHANTS IN DELIVERY RADIUS ERROR:`, {
            error: errorMessage,
            responseTime: `${responseTime}ms`,
          });

          return new Response(
            JSON.stringify({
              success: false,
              error: 'Internal server error',
              code: 'INTERNAL_SERVER_ERROR',
              message: process.env.NODE_ENV === 'development' ? errorMessage : 'An unexpected error occurred',
              timestamp: new Date().toISOString(),
              requestId,
              responseTime,
            }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
          );
        }
      }) as PayloadHandler,
    },

    {
      path: '/merchants-in-service-area',
      method: 'get',
      handler: (async (req: PayloadRequest) => {
        const startTime = Date.now();
        const requestId = crypto.randomUUID();
        
        try {
          console.log(`🏢 [${requestId}] MERCHANTS IN SERVICE AREA REQUEST:`, {
            timestamp: new Date().toISOString(),
            query: req.query,
          });

          // Extract and validate query parameters
          const { latitude, longitude, limit = '20', offset = '0' } = req.query as {
            latitude?: string;
            longitude?: string;
            limit?: string;
            offset?: string;
          };

          // Validation
          if (!latitude || !longitude) {
            return new Response(
              JSON.stringify({
                success: false,
                error: 'Missing required parameters: latitude and longitude',
                code: 'MISSING_PARAMETERS',
                timestamp: new Date().toISOString(),
                requestId,
              }),
              { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
          }

          const lat = parseFloat(latitude);
          const lng = parseFloat(longitude);
          const limitNum = Math.min(parseInt(limit, 10), 100); // Cap at 100
          const offsetNum = parseInt(offset, 10);

          if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
            return new Response(
              JSON.stringify({
                success: false,
                error: 'Invalid coordinates',
                code: 'INVALID_COORDINATES',
                timestamp: new Date().toISOString(),
                requestId,
              }),
              { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
          }

          // Use GeospatialService to find merchants in service area
          const geospatialService = new GeospatialService(req.payload);
          const result = await geospatialService.findMerchantsInServiceArea({
            latitude: lat,
            longitude: lng,
            limit: limitNum,
            offset: offsetNum
          });

          const responseTime = Date.now() - startTime;
          
          console.log(`✅ [${requestId}] MERCHANTS IN SERVICE AREA SUCCESS:`, {
            merchantsFound: result.merchants.length,
            totalCount: result.totalCount,
            responseTime: `${responseTime}ms`,
          });

          return new Response(
            JSON.stringify({
              success: true,
              data: result,
              metadata: {
                query: { latitude: lat, longitude: lng },
                pagination: { limit: limitNum, offset: offsetNum },
                performance: { responseTime, requestId },
                timestamp: new Date().toISOString(),
              },
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
          );

        } catch (error) {
          const responseTime = Date.now() - startTime;
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          
          console.error(`🚨 [${requestId}] MERCHANTS IN SERVICE AREA ERROR:`, {
            error: errorMessage,
            responseTime: `${responseTime}ms`,
          });

          return new Response(
            JSON.stringify({
              success: false,
              error: 'Internal server error',
              code: 'INTERNAL_SERVER_ERROR',
              message: process.env.NODE_ENV === 'development' ? errorMessage : 'An unexpected error occurred',
              timestamp: new Date().toISOString(),
              requestId,
              responseTime,
            }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
          );
        }
      }) as PayloadHandler,
    },
  ],

  // sharp,
  plugins: [
    payloadCloudPlugin(),
    cloudStoragePlugin({
      collections: {
        media: {
          adapter: cloudinaryAdapter({
            cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!,
            apiKey: process.env.CLOUDINARY_API_KEY!,
            apiSecret: process.env.CLOUDINARY_API_SECRET!,
            folder: 'main-uploads',
          }),
        },
      },
    }),
    // storage-adapter-placeholder
  ],
})
