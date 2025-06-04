/**
 * Tap2Go Firebase Cloud Functions
 * PayMongo Webhook Handler and FCM Notifications
 * TypeScript Implementation for Professional Food Delivery Platform
 */

import { onRequest } from "firebase-functions/v2/https";
import { logger } from "firebase-functions";
import * as admin from "firebase-admin";
import * as crypto from "crypto";
// Initialize Firebase Admin SDK
admin.initializeApp();

// FCM Notification Types
interface FCMNotificationData {
  type: string;
  orderId?: string;
  customerId?: string;
  vendorId?: string;
  driverId?: string;
  amount?: number;
  url?: string;
  [key: string]: any;
}

interface FCMNotification {
  title: string;
  body: string;
  data: FCMNotificationData;
}

// PayMongo Webhook Event Types
interface PayMongoWebhookData {
  data: {
    id: string;
    type: "payment.paid" | "payment.failed" | "source.chargeable";
    attributes: PayMongoEventAttributes;
  };
}

interface PayMongoEventAttributes {
  amount?: number;
  currency?: string;
  description?: string;
  fee?: number;
  net_amount?: number;
  status?: string;
  source?: {
    id: string;
    type: string;
  };
  billing?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  metadata?: Record<string, any>;
  [key: string]: any;
}

/**
 * Send FCM notification to user
 */
async function sendFCMNotification(userId: string, notification: FCMNotification): Promise<void> {
  try {
    logger.info("Sending FCM notification", { userId, notification });

    const db = admin.firestore();

    // Get user's FCM tokens
    const tokensSnapshot = await db.collection(`users/${userId}/fcmTokens`)
      .where("isActive", "==", true)
      .get();

    if (tokensSnapshot.empty) {
      logger.warn("No active FCM tokens found for user", { userId });
      return;
    }

    const tokens: string[] = [];
    tokensSnapshot.forEach(doc => {
      tokens.push(doc.data().token);
    });

    // Prepare FCM message
    const message = {
      notification: {
        title: notification.title,
        body: notification.body,
      },
      data: {
        type: notification.data.type,
        orderId: notification.data.orderId || "",
        customerId: notification.data.customerId || "",
        vendorId: notification.data.vendorId || "",
        driverId: notification.data.driverId || "",
        amount: notification.data.amount?.toString() || "0",
        url: notification.data.url || "",
        timestamp: Date.now().toString(),
      },
      tokens: tokens,
    };

    // Send notification
    const response = await admin.messaging().sendEachForMulticast(message);

    logger.info("FCM notification sent", {
      userId,
      successCount: response.successCount,
      failureCount: response.failureCount
    });

    // Handle failed tokens (cleanup invalid tokens)
    if (response.failureCount > 0) {
      const failedTokens: string[] = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          failedTokens.push(tokens[idx]);
          logger.warn("Failed to send to token", {
            token: tokens[idx],
            error: resp.error?.message
          });
        }
      });

      // Remove invalid tokens
      await cleanupInvalidTokens(userId, failedTokens);
    }
  } catch (error: any) {
    logger.error("Error sending FCM notification", {
      userId,
      error: error.message
    });
    throw error;
  }
}

/**
 * Cleanup invalid FCM tokens
 */
async function cleanupInvalidTokens(userId: string, invalidTokens: string[]): Promise<void> {
  try {
    const db = admin.firestore();
    const batch = db.batch();

    for (const token of invalidTokens) {
      const tokenRef = db.doc(`users/${userId}/fcmTokens/${token}`);
      batch.update(tokenRef, { isActive: false });
    }

    await batch.commit();
    logger.info("Cleaned up invalid FCM tokens", { userId, count: invalidTokens.length });
  } catch (error: any) {
    logger.error("Error cleaning up invalid tokens", { userId, error: error.message });
  }
}

/**
 * Verify PayMongo webhook signature
 */
function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  try {
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(payload, "utf8")
      .digest("hex");

    return crypto.timingSafeEqual(
      Buffer.from(signature, "hex"),
      Buffer.from(expectedSignature, "hex")
    );
  } catch (error) {
    logger.error("Error verifying webhook signature", { error });
    return false;
  }
}

/**
 * PayMongo Webhook Handler
 * Handles payment events from PayMongo and triggers notifications
 */
export const paymongoWebhook = onRequest({
  cors: true,
  region: "us-central1",
  invoker: "public",
}, async (request, response): Promise<void> => {
  try {
    logger.info("PayMongo webhook received", {
      method: request.method,
      headers: request.headers,
      body: request.body,
    });

    // Only accept POST requests
    if (request.method !== "POST") {
      logger.warn("Invalid method for webhook", { method: request.method });
      response.status(405).json({ error: "Method not allowed" });
      return;
    }

    // Get raw body for signature verification
    const rawBody = JSON.stringify(request.body);
    const signature = request.headers["paymongo-signature"] as string;

    // Verify webhook signature
    if (!signature) {
      logger.warn("Missing PayMongo signature header");
      response.status(401).json({ error: "Missing signature" });
      return;
    }

    // Get webhook secret from environment
    const webhookSecret = process.env.PAYMONGO_WEBHOOK_SECRET || "whsk_SjGyCUrQADFmAnKbHRMugjfT";

    if (!verifyWebhookSignature(rawBody, signature, webhookSecret)) {
      logger.warn("Invalid webhook signature");
      response.status(401).json({ error: "Invalid signature" });
      return;
    }

    logger.info("Webhook signature verified successfully");

    // Process webhook data
    const webhookData: PayMongoWebhookData = request.body;

    if (!webhookData || !webhookData.data) {
      logger.error("Invalid webhook payload", { payload: webhookData });
      response.status(400).json({ error: "Invalid payload" });
      return;
    }

    const eventType = webhookData.data.type;
    const eventData = webhookData.data.attributes;

    logger.info("Processing PayMongo event", {
      eventType,
      eventId: webhookData.data.id,
    });

    // Handle different event types
    switch (eventType) {
      case "payment.paid":
        await handlePaymentPaid(eventData);
        break;
      case "payment.failed":
        await handlePaymentFailed(eventData);
        break;
      case "source.chargeable":
        await handleSourceChargeable(eventData);
        break;
      default:
        logger.info("Unhandled event type", { eventType });
    }

    // Respond with success
    response.status(200).json({
      success: true,
      message: "Webhook processed successfully",
    });

  } catch (error: any) {
    logger.error("Error processing PayMongo webhook", {
      error: error.message,
      stack: error.stack,
    });

    response.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
});

/**
 * Handle successful payment
 */
async function handlePaymentPaid(paymentData: PayMongoEventAttributes): Promise<void> {
  logger.info("Processing successful payment", { paymentData });

  try {
    const db = admin.firestore();

    // Extract order ID from payment metadata
    const orderId = paymentData.metadata?.orderId;

    if (orderId) {
      // Update order status in Firestore
      await db.collection("orders").doc(orderId).update({
        status: "paid",
        paymentStatus: "completed",
        paymentId: paymentData.metadata?.paymentId,
        paidAt: admin.firestore.FieldValue.serverTimestamp(),
        paymentAmount: paymentData.amount,
        paymentCurrency: paymentData.currency,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      logger.info("Order status updated to paid", { orderId });

      // Send FCM notification to customer
      const customerId = paymentData.metadata?.customerId;
      if (customerId) {
        const customerNotification: FCMNotification = {
          title: "💰 Payment Successful!",
          body: `Your payment of ₱${((paymentData.amount || 0) / 100).toFixed(2)} has been processed successfully.`,
          data: {
            type: "payment_success",
            orderId: orderId,
            customerId: customerId,
            amount: paymentData.amount,
            url: `/orders/${orderId}`,
          },
        };
        await sendFCMNotification(customerId, customerNotification);
      }

      // Send FCM notification to vendor
      const vendorId = paymentData.metadata?.vendorId;
      if (vendorId) {
        const vendorNotification: FCMNotification = {
          title: "🔔 New Order Received!",
          body: `New order ${orderId} - Payment confirmed. Please start preparing.`,
          data: {
            type: "order_confirmed",
            orderId: orderId,
            vendorId: vendorId,
            amount: paymentData.amount,
            url: `/vendor/orders/${orderId}`,
          },
        };
        await sendFCMNotification(vendorId, vendorNotification);
      }
    } else {
      logger.warn("No order ID found in payment metadata", { paymentData });
    }

    logger.info("Payment processed successfully");
  } catch (error: any) {
    logger.error("Error handling successful payment", { error: error.message });
    throw error;
  }
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(paymentData: PayMongoEventAttributes): Promise<void> {
  logger.info("Processing failed payment", { paymentData });

  try {
    const db = admin.firestore();

    // Extract order ID from payment metadata
    const orderId = paymentData.metadata?.orderId;

    if (orderId) {
      // Update order status in Firestore
      await db.collection("orders").doc(orderId).update({
        status: "payment_failed",
        paymentStatus: "failed",
        paymentFailureReason: paymentData.metadata?.failureReason || "Payment failed",
        failedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      logger.info("Order status updated to payment_failed", { orderId });

      // Send FCM notification to customer about payment failure
      const customerId = paymentData.metadata?.customerId;
      if (customerId) {
        const customerNotification: FCMNotification = {
          title: "❌ Payment Failed",
          body: `Your payment for order ${orderId} could not be processed. Please try again.`,
          data: {
            type: "payment_failed",
            orderId: orderId,
            customerId: customerId,
            url: `/orders/${orderId}`,
          },
        };
        await sendFCMNotification(customerId, customerNotification);
      }
    } else {
      logger.warn("No order ID found in failed payment metadata", { paymentData });
    }

    logger.info("Failed payment processed");
  } catch (error: any) {
    logger.error("Error handling failed payment", { error: error.message });
    throw error;
  }
}

/**
 * Handle chargeable source
 */
async function handleSourceChargeable(sourceData: PayMongoEventAttributes): Promise<void> {
  logger.info("Processing chargeable source", { sourceData });

  try {
    // TODO: Process the chargeable source

    logger.info("Chargeable source processed");
  } catch (error: any) {
    logger.error("Error handling chargeable source", { error: error.message });
    throw error;
  }
}
