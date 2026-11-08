import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiConfig } from '../config/environment';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const buildCmsHeaders = (): Record<string, string> => ({
  'Content-Type': 'application/json',
  Authorization: `users API-Key ${apiConfig.payloadApiKey}`,
});

type TransactionDoc = {
  id: string | number;
  status?: string;
  paid_at?: string | null;
  payment_intent_id?: string | null;
  order?: string | number | { id?: string | number } | null;
};

type OrderDoc = {
  id: string | number;
  status?: string;
};

export type PendingCheckoutSession = {
  customerId: string;
  merchantId: string;
  orderId: string;
  paymentIntentId: string;
  createdAt: string;
};

export type CheckoutPaymentStatus =
  | { status: 'none' }
  | { status: 'pending'; orderId?: string; paymentIntentId?: string }
  | { status: 'failed'; orderId?: string; paymentIntentId?: string }
  | {
      status: 'paid';
      orderId: string;
      paymentIntentId?: string;
      transaction?: TransactionDoc;
      paidAt?: string | null;
    };

const pendingCheckoutKey = (customerId: string, merchantId: string) =>
  `tap2go:pending-checkout:${customerId}:${merchantId}`;

export async function waitForPaidTransaction(
  paymentIntentId: string,
  fallbackOrderId?: string,
  attempts = 20,
  intervalMs = 1500,
): Promise<{ transaction: TransactionDoc; orderId: string }> {
  const headers = buildCmsHeaders();

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const response = await fetch(
      `${apiConfig.baseUrl}/transactions?where[payment_intent_id][equals]=${paymentIntentId}&depth=1&limit=1`,
      { headers }
    );

    if (response.ok) {
      const data = await response.json();
      const transaction = Array.isArray(data?.docs) ? data.docs[0] : null;

      if (transaction) {
        const status = String(transaction.status || '').toLowerCase();
        const resolvedOrderId = resolveOrderId(transaction.order, fallbackOrderId);

        if (status === 'paid' && resolvedOrderId) {
          return {
            transaction,
            orderId: resolvedOrderId,
          };
        }

        if (status === 'failed') {
          throw new Error('Your payment was not completed.');
        }
      }
    }

    await sleep(intervalMs);
  }

  throw new Error('Payment confirmation is still processing. Please check your Orders shortly.');
}

export async function requestDeliveryFulfillment(orderId: string): Promise<void> {
  const token = await AsyncStorage.getItem('grandline_auth_token');
  if (!token) {
    throw new Error('Sign in again before scheduling delivery fulfillment.');
  }
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `JWT ${token}`,
  };
  const response = await fetch(`${apiConfig.baseUrl}/delivery/book`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ orderId: Number(orderId) }),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data?.error || `Could not schedule delivery fulfillment (${response.status}).`);
  }
}

export async function savePendingCheckoutSession(session: PendingCheckoutSession): Promise<void> {
  await AsyncStorage.setItem(
    pendingCheckoutKey(session.customerId, session.merchantId),
    JSON.stringify(session),
  );
}

export async function getPendingCheckoutSession(
  customerId: string,
  merchantId: string,
): Promise<PendingCheckoutSession | null> {
  const rawValue = await AsyncStorage.getItem(pendingCheckoutKey(customerId, merchantId));
  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as PendingCheckoutSession;
  } catch {
    await AsyncStorage.removeItem(pendingCheckoutKey(customerId, merchantId));
    return null;
  }
}

export async function clearPendingCheckoutSession(
  customerId: string,
  merchantId: string,
): Promise<void> {
  await AsyncStorage.removeItem(pendingCheckoutKey(customerId, merchantId));
}

export async function getCheckoutPaymentStatus(args: {
  paymentIntentId?: string;
  orderId?: string;
}): Promise<CheckoutPaymentStatus> {
  const headers = buildCmsHeaders();

  let transaction: TransactionDoc | null = null;
  if (args.paymentIntentId) {
    transaction = await fetchTransactionByPaymentIntent(args.paymentIntentId, headers);
  }

  if (!transaction && args.orderId) {
    transaction = await fetchTransactionByOrderId(args.orderId, headers);
  }

  const resolvedOrderId = resolveOrderId(transaction?.order, args.orderId);
  const paymentIntentId = transaction?.payment_intent_id || args.paymentIntentId;
  const transactionStatus = String(transaction?.status || '').toLowerCase();

  if (transactionStatus === 'paid' && resolvedOrderId) {
    return {
      status: 'paid',
      orderId: resolvedOrderId,
      paymentIntentId: paymentIntentId || undefined,
      transaction,
      paidAt: transaction?.paid_at || null,
    };
  }

  if (transactionStatus === 'failed') {
    return {
      status: 'failed',
      orderId: resolvedOrderId || undefined,
      paymentIntentId: paymentIntentId || undefined,
    };
  }

  if (resolvedOrderId) {
    const order = await fetchOrderById(resolvedOrderId, headers);
    const orderStatus = String(order?.status || '').toLowerCase();

    if (orderStatus === 'cancelled') {
      return {
        status: 'failed',
        orderId: resolvedOrderId,
        paymentIntentId: paymentIntentId || undefined,
      };
    }
  }

  if (transactionStatus === 'pending' || resolvedOrderId || paymentIntentId) {
    return {
      status: 'pending',
      orderId: resolvedOrderId || undefined,
      paymentIntentId: paymentIntentId || undefined,
    };
  }

  return { status: 'none' };
}

async function fetchTransactionByPaymentIntent(
  paymentIntentId: string,
  headers: Record<string, string>,
): Promise<TransactionDoc | null> {
  const response = await fetch(
    `${apiConfig.baseUrl}/transactions?where[payment_intent_id][equals]=${paymentIntentId}&depth=1&limit=1`,
    { headers },
  );

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  return Array.isArray(data?.docs) ? data.docs[0] || null : null;
}

async function fetchTransactionByOrderId(
  orderId: string,
  headers: Record<string, string>,
): Promise<TransactionDoc | null> {
  const response = await fetch(
    `${apiConfig.baseUrl}/transactions?where[order][equals]=${orderId}&depth=1&limit=1&sort=-createdAt`,
    { headers },
  );

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  return Array.isArray(data?.docs) ? data.docs[0] || null : null;
}

async function fetchOrderById(
  orderId: string,
  headers: Record<string, string>,
): Promise<OrderDoc | null> {
  const response = await fetch(`${apiConfig.baseUrl}/orders/${orderId}`, { headers });
  if (!response.ok) {
    return null;
  }

  return (await response.json()) as OrderDoc;
}

function resolveOrderId(
  order: TransactionDoc['order'],
  fallbackOrderId?: string,
): string | null {
  if (typeof order === 'string' || typeof order === 'number') {
    return String(order);
  }

  if (order && typeof order === 'object' && order.id != null) {
    return String(order.id);
  }

  if (fallbackOrderId) {
    return String(fallbackOrderId);
  }

  return null;
}
