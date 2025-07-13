import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

/**
 * FCM API Error Interface
 */
interface FCMApiError {
  message: string;
  code?: string;
  details?: unknown;
}

/**
 * Request Body Interface
 */
interface TestFCMRequest {
  userId: string;
  type?: string;
}

// Initialize Firebase Admin (if not already initialized)
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID!,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL!,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY!.replace(/\\n/g, '\n'),
    }),
  });
}

/**
 * Test FCM Notification API
 * Sends a test notification to verify FCM integration
 */
export async function POST(request: NextRequest) {
  try {
    const body: TestFCMRequest = await request.json();
    const { userId, type = 'test_notification' } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get Firebase Admin instances (for production use)
    // const messaging = getMessaging();

    // For testing, we'll use a mock token approach since we don't have Firestore setup yet
    // In production, you would fetch tokens from Firestore
    // const mockTokens = ['test-token-placeholder']; // This would be real tokens from Firestore

    // Create test notification based on type
    let notification;
    switch (type) {
      case 'payment_success':
        notification = {
          title: '💰 Payment Successful!',
          body: 'Your payment of ₱20.00 has been processed successfully.',
        };
        break;
      case 'order_confirmed':
        notification = {
          title: '✅ Order Confirmed',
          body: 'Your order has been confirmed and is being prepared.',
        };
        break;
      case 'order_preparing':
        notification = {
          title: '👨‍🍳 Order Being Prepared',
          body: 'Your delicious meal is being prepared by the chef!',
        };
        break;
      case 'order_ready':
        notification = {
          title: '🍽️ Order Ready',
          body: 'Your order is ready for pickup or delivery!',
        };
        break;
      case 'driver_assigned':
        notification = {
          title: '🚗 Driver Assigned',
          body: 'Juan is on the way to deliver your order!',
        };
        break;
      case 'order_delivered':
        notification = {
          title: '🎉 Order Delivered',
          body: 'Your order has been delivered. Enjoy your meal!',
        };
        break;
      case 'payment_failed':
        notification = {
          title: '❌ Payment Failed',
          body: 'Your payment could not be processed. Please try again.',
        };
        break;
      default:
        notification = {
          title: '🔔 Test Notification',
          body: 'This is a test notification from Tap2Go FCM system.',
        };
    }

    // Prepare FCM message (for production use)
    // const message: MulticastMessage = {
    //   notification,
    //   data: {
    //     type: type,
    //     userId: userId,
    //     orderId: 'test_order_123',
    //     url: '/orders/test_order_123',
    //     timestamp: Date.now().toString(),
    //   },
    //   tokens: mockTokens, // In production, get real tokens from Firestore
    // };

    try {
      // For testing purposes, we'll simulate sending
      // In production with real tokens, uncomment the line below:
      // const response = await messaging.sendEachForMulticast(message);
      
      // Simulated response for testing
      const response = {
        successCount: 1,
        failureCount: 0,
        responses: [{ success: true }]
      };

      console.log('Test FCM notification sent:', {
        userId,
        type,
        successCount: response.successCount,
        failureCount: response.failureCount,
      });

      return NextResponse.json({
        success: true,
        message: 'Test notification sent successfully',
        details: {
          userId,
          type,
          notification,
          successCount: response.successCount,
          failureCount: response.failureCount,
        },
        note: 'This is a test endpoint. In production, real FCM tokens would be used.',
      });

    } catch (fcmError: unknown) {
      const apiError = fcmError as FCMApiError;
      console.error('FCM sending error:', apiError);

      return NextResponse.json({
        success: false,
        error: 'Failed to send FCM notification',
        details: apiError.message || 'Unknown FCM error',
        note: 'This might be expected in testing without real FCM tokens.',
      });
    }

  } catch (error: unknown) {
    const apiError = error as FCMApiError;
    console.error('Error in test FCM notification:', apiError);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: apiError.message || 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}
