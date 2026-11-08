import { PayloadRequest } from 'payload'
import crypto from 'crypto'
import { CouponService } from '../services/CouponService'
import {
  isTerminalPaymentFailure,
} from '../services/orderPaymentRecovery'
import { applyPaidPriorityFee } from './deliveryPriorityFee'
import { ensureDeliveryFulfillment } from '../services/deliveryFulfillmentOutbox'

export const paymongoWebhook = async (req: PayloadRequest) => {
  try {
    const signature = req.headers.get('paymongo-signature');
    
    // Get raw body for signature verification
    const rawBody = await (req as unknown as Request).text();
    let body;
    try {
        body = JSON.parse(rawBody);
    } catch (e) {
        return Response.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const secret = process.env.PAYMONGO_SANDBOX === 'true'
      ? process.env.PAYMONGO_SANDBOX_WEBHOOK_SECRET
      : process.env.PAYMONGO_WEBHOOK_SECRET;

    // 1. Verify Signature
    if (!secret) {
      console.error('[paymongo/webhook] webhook secret is not configured')
      return Response.json({ error: 'Webhook verification is unavailable' }, { status: 503 })
    }
    if (!verifySignature(rawBody, signature, secret, process.env.PAYMONGO_SANDBOX !== 'true')) {
      console.error('[paymongo/webhook] signature verification failed')
      return Response.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const event = body?.data?.attributes;
    if (!event || !event.data || typeof event.type !== 'string') {
      return Response.json({ error: 'Invalid PayMongo event' }, { status: 400 })
    }
    const type = event.type;
    const resource = event.data;

    console.log(`Received PayMongo Webhook: ${type}`, resource.id);

    // 2. Handle Events
    if (type === 'payment.paid') {
      const paymentIntentId = resource.attributes?.payment_intent_id;
      if (typeof paymentIntentId !== 'string' || !paymentIntentId) {
        return Response.json({ error: 'Payment intent ID is missing' }, { status: 400 })
      }

      const secretKey = process.env.PAYMONGO_SANDBOX === 'true'
        ? process.env.PAYMONGO_SANDBOX_API_KEY
        : process.env.PAYMONGO_SECRET_KEY_LIVE
      if (!secretKey) {
        console.error('[paymongo/webhook] cannot verify paid event without PayMongo API key')
        return Response.json({ error: 'Payment verification is unavailable' }, { status: 503 })
      }
      const intentResponse = await fetch(
        `https://api.paymongo.com/v1/payment_intents/${encodeURIComponent(paymentIntentId)}`,
        {
          headers: {
            Authorization: `Basic ${Buffer.from(`${secretKey}:`).toString('base64')}`,
          },
          signal: AbortSignal.timeout(12_000),
        },
      )
      const intentBody = await intentResponse.json().catch(() => ({}))
      if (!intentResponse.ok) {
        console.error('[paymongo/webhook] failed to verify paid intent', {
          paymentIntentId,
          status: intentResponse.status,
        })
        return Response.json({ error: 'Payment verification failed' }, { status: 502 })
      }
      const intentAttributes = intentBody?.data?.attributes
      if (String(intentAttributes?.status || '').toLowerCase() !== 'succeeded') {
        console.warn('[paymongo/webhook] ignoring paid event for non-succeeded intent', {
          paymentIntentId,
          providerStatus: intentAttributes?.status,
        })
        return Response.json({ status: 'received' })
      }
      
      // Find Transaction by payment_intent_id
      const transactions = await req.payload.find({
          collection: 'transactions',
          where: {
              payment_intent_id: {
                  equals: paymentIntentId
              }
          },
          overrideAccess: true,
          req,
      });

      if (transactions.docs.length > 0) {
          const transaction = transactions.docs[0];
          const transactionAmount = Number((transaction as any).amount)
          const intentAmount = Number(intentAttributes?.amount)
          const transactionCurrency = String((transaction as any).currency || 'PHP').toUpperCase()
          const intentCurrency = String(intentAttributes?.currency || '').toUpperCase()
          if (
            !Number.isFinite(transactionAmount)
            || !Number.isFinite(intentAmount)
            || Math.round(transactionAmount * 100) !== intentAmount
            || transactionCurrency !== intentCurrency
          ) {
            console.error('[paymongo/webhook] paid intent does not match local transaction', {
              transactionId: transaction.id,
              paymentIntentId,
            })
            return Response.json({ error: 'Payment amount or currency mismatch' }, { status: 409 })
          }
          const isPriorityFee = (transaction as any).transaction_type === 'priority_fee'
          if (String((transaction as any).status).toLowerCase() === 'refunded') {
            return Response.json({ status: 'received' })
          }
          
          const transactionID = await req.payload.db.beginTransaction()
          if (!transactionID) {
            return Response.json({ error: 'Payment persistence is unavailable' }, { status: 503 })
          }
          req.transactionID = transactionID
          let updatedTransaction
          try {
            updatedTransaction = await req.payload.update({
              collection: 'transactions',
              id: transaction.id,
              data: {
                status: 'paid',
                paid_at: new Date((Number(resource.attributes?.paid_at) || Date.now() / 1000) * 1000).toISOString(),
                ...(isPriorityFee
                  ? {
                      payment_id: String(resource.id || ''),
                      priority_fee_fulfillment_status: 'pending',
                    }
                  : {}),
              },
              overrideAccess: true,
              req,
            })

            if (!isPriorityFee && transaction.order) {
              const orderId = typeof transaction.order === 'object' ? transaction.order.id : transaction.order
              const order = await req.payload.findByID({
                collection: 'orders',
                id: orderId,
                depth: 0,
                overrideAccess: true,
                req,
              })
              if (order.status === 'pending') {
                await req.payload.update({
                  collection: 'orders',
                  id: orderId,
                  data: { status: 'accepted' },
                  overrideAccess: true,
                  req,
                })
              }
              if (order.fulfillment_type === 'delivery') {
                await ensureDeliveryFulfillment(req, Number(orderId))
              }
            }
            await req.payload.db.commitTransaction(transactionID)
            req.transactionID = undefined
          } catch (error) {
            await req.payload.db.rollbackTransaction(transactionID)
            req.transactionID = undefined
            throw error
          }
          
          console.log(`Transaction ${transaction.id} updated to paid.`);

          if (isPriorityFee) {
            const result = await applyPaidPriorityFee(
              req,
              updatedTransaction as unknown as Parameters<typeof applyPaidPriorityFee>[1],
            )
            console.log(
              `Priority-fee payment ${transaction.id} ${result.state}.`,
            )
          } else if (transaction.order) {
              const orderId = typeof transaction.order === 'object' ? transaction.order.id : transaction.order
              console.log(`Order ${orderId} payment and delivery fulfillment scheduled.`);
              try {
                await req.payload.update({
                  collection: 'cart-items',
                  where: { order_id: { equals: orderId } },
                  data: {
                    status: 'ordered',
                    ordered_at: new Date(
                      (Number(resource.attributes?.paid_at) || Date.now() / 1000) * 1000,
                    ).toISOString(),
                  },
                  overrideAccess: true,
                  req,
                })
              } catch (cartErr) {
                console.error(`[paymongo/webhook] cart cleanup failed for order ${orderId}:`, cartErr)
              }

              // Promote held coupon redemptions to applied + bump usage counters.
              // Best-effort: never blocks the payment acknowledgement.
              try {
                await new CouponService(req.payload).finalizeForOrder(orderId, true);
              } catch (couponErr) {
                console.error(`[paymongo/webhook] coupon finalize error for order ${orderId}:`, couponErr);
              }
          }
      } else {
          console.warn(`No transaction found for payment_intent_id: ${paymentIntentId}`);
          return Response.json({ error: 'Transaction not found yet' }, { status: 503 })
      }

    } else if (type === 'payment.failed' || type === 'qrph.expired') {
       const paymentIntentId =
         resource.attributes?.payment_intent_id ||
         (String(resource.id || '').startsWith('pi_') ? resource.id : null);
       if (!paymentIntentId) {
         console.warn(`PayMongo ${type} event did not include a payment intent ID`);
         return Response.json({ status: 'received' });
       }

       const secretKey = process.env.PAYMONGO_SANDBOX === 'true'
         ? process.env.PAYMONGO_SANDBOX_API_KEY
         : process.env.PAYMONGO_SECRET_KEY_LIVE;
       if (!secretKey) {
         console.error(`[paymongo/webhook] cannot verify ${type} without the PayMongo API key`);
         return Response.json({ error: 'Payment verification is unavailable' }, { status: 503 });
       }
       const intentResponse = await fetch(
         `https://api.paymongo.com/v1/payment_intents/${encodeURIComponent(String(paymentIntentId))}`,
         {
           headers: {
             Authorization: `Basic ${Buffer.from(`${secretKey}:`).toString('base64')}`,
           },
         },
       );
       const intentBody = await intentResponse.json().catch(() => ({}));
       if (!intentResponse.ok) {
         console.error(`[paymongo/webhook] failed to verify ${type} intent`, {
           paymentIntentId,
           status: intentResponse.status,
         });
         return Response.json({ error: 'Payment verification failed' }, { status: 502 });
       }
       const providerStatus = String(intentBody?.data?.attributes?.status || '').toLowerCase();
       if (!isTerminalPaymentFailure(providerStatus)) {
         console.info(`[paymongo/webhook] ignoring stale ${type} event`, {
           paymentIntentId,
           providerStatus,
         });
         return Response.json({ status: 'received' });
       }
       
       const transactions = await req.payload.find({
           collection: 'transactions',
           where: {
               payment_intent_id: {
                   equals: paymentIntentId
               }
           },
           overrideAccess: true,
           req,
       });

       if (transactions.docs.length > 0) {
           const transaction = transactions.docs[0];
           if (String((transaction as any).status).toLowerCase() === 'paid') {
             return Response.json({ status: 'received' });
           }
           
           await req.payload.update({
               collection: 'transactions',
               id: transaction.id,
               data: {
                   status: 'failed',
                   ...((transaction as any).transaction_type === 'priority_fee'
                     ? { priority_fee_fulfillment_status: 'failed' }
                     : {}),
               }
             });
             console.log(`Transaction ${transaction.id} updated to failed.`);
             // Keep the cart item and coupon hold linked to the pending order for payment recovery.
       }
     } else if (typeof type === 'string' && type.includes('refund')) {
       // Reverse applied coupon redemptions on refunds (WooCommerce decrease_usage_count parity).
       try {
         const refundIntentId = resource.attributes?.payment_intent_id;
         if (refundIntentId) {
           const refundTx = await req.payload.find({
               collection: 'transactions',
               where: { payment_intent_id: { equals: refundIntentId } },
               overrideAccess: true,
               req,
           });
           const refundOrder = (refundTx.docs[0] as any)?.order;
           if (refundOrder) {
             const refundOrderId = typeof refundOrder === 'object' ? refundOrder.id : refundOrder;
             await new CouponService(req.payload).reverseForOrder(refundOrderId, 'refunded');
           }
         }
       } catch (couponErr) {
         console.error('[paymongo/webhook] coupon refund-reverse error:', couponErr);
       }
     }

     // 3. Acknowledge Receipt
    return Response.json({ status: 'received' });
  } catch (error) {
    console.error('Webhook Error:', error);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
};

// Helper function to verify signature
function verifySignature(
  payload: string,
  signatureHeader: string | null,
  secret: string,
  isLive: boolean,
): boolean {
  if (!signatureHeader || !secret) return false;
  const parts = signatureHeader.split(',');
  const timestamp = parts.find(p => p.startsWith('t='))?.slice(2);
  const testSig = parts.find(p => p.startsWith('te='))?.slice(3);
  const liveSig = parts.find(p => p.startsWith('li='))?.slice(3);
  const sigToVerify = isLive ? liveSig : testSig
  if (!timestamp || !sigToVerify) return false;

  const stringToSign = `${timestamp}.${payload}`;
  const computedSignature = crypto
    .createHmac('sha256', secret)
    .update(stringToSign)
    .digest('hex');

  const expected = Buffer.from(computedSignature, 'hex')
  const received = Buffer.from(sigToVerify, 'hex')
  return expected.length === received.length && crypto.timingSafeEqual(expected, received)
}
