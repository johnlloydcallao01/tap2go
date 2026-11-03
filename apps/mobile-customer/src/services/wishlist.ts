import { apiConfig } from '../config/environment';

const API_BASE = apiConfig.baseUrl;
const API_KEY = apiConfig.payloadApiKey;

export interface WishlistDoc {
  id?: string | number;
  merchant?: unknown;
}

function buildHeaders(): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (API_KEY) {
    headers["Authorization"] = `users API-Key ${API_KEY}`;
  }
  return headers;
}

export function getWishlistMerchantId(doc: WishlistDoc): string | null {
  const merchant = doc.merchant;
  if (typeof merchant === "number" || typeof merchant === "string") {
    return String(merchant);
  }
  if (
    merchant &&
    typeof merchant === "object" &&
    "id" in merchant &&
    (typeof merchant.id === "number" || typeof merchant.id === "string")
  ) {
    return String(merchant.id);
  }
  return null;
}

export async function getWishlistMerchantIds(userId: string | number): Promise<string[]> {
  if (!userId) return [];
  const headers = buildHeaders();
  const params = new URLSearchParams();
  params.append("where[user][equals]", String(userId));
  params.append("limit", "200");
  params.append("depth", "0");
  const url = `${API_BASE}/wishlists?${params.toString()}`;
  try {
    const res = await fetch(url, { headers, cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    const docs: WishlistDoc[] = Array.isArray(data?.docs) ? data.docs : [];
    const ids = docs.map(getWishlistMerchantId).filter((id): id is string => !!id);
    return Array.from(new Set(ids));
  } catch {
    return [];
  }
}

export async function addMerchantToWishlist(userId: string | number, merchantId: string | number): Promise<"added" | "exists"> {
  if (!userId) {
    throw new Error("Please sign in to use wishlist");
  }
  const headers = buildHeaders();
  const body = JSON.stringify({
    user: userId,
    merchant: merchantId,
  });
  const url = `${API_BASE}/wishlists`;
  const res = await fetch(url, { method: "POST", headers, body });
  if (res.ok) return "added";
  
  // Check if it already exists (in case of race condition or duplicate request)
  const params = new URLSearchParams();
  params.append("where[user][equals]", String(userId));
  params.append("where[merchant][equals]", String(merchantId));
  params.append("limit", "1");
  const existsUrl = `${API_BASE}/wishlists?${params.toString()}`;
  const getRes = await fetch(existsUrl, { headers });
  if (!getRes.ok) {
    throw new Error("Failed to add to wishlist");
  }
  const data = await getRes.json();
  const doc = Array.isArray(data?.docs) ? data.docs[0] : null;
  if (doc && doc.id) return "exists";
  throw new Error("Failed to add to wishlist");
}

export async function removeMerchantFromWishlist(userId: string | number, merchantId: string | number): Promise<"removed" | "missing"> {
  if (!userId) {
    throw new Error("Please sign in to use wishlist");
  }
  const headers = buildHeaders();
  const params = new URLSearchParams();
  params.append("where[user][equals]", String(userId));
  params.append("where[merchant][equals]", String(merchantId));
  params.append("limit", "1");
  const listUrl = `${API_BASE}/wishlists?${params.toString()}`;
  const listRes = await fetch(listUrl, { headers });
  if (!listRes.ok) {
    throw new Error("Failed to update wishlist");
  }
  const data = await listRes.json();
  const doc = Array.isArray(data?.docs) ? data.docs[0] : null;
  if (!doc || !doc.id) return "missing";
  const delUrl = `${API_BASE}/wishlists/${encodeURIComponent(String(doc.id))}`;
  const delRes = await fetch(delUrl, { method: "DELETE", headers });
  if (!delRes.ok) {
    throw new Error("Failed to update wishlist");
  }
  return "removed";
}

export async function getWishlistDocs(
  userId: string | number,
  signal?: AbortSignal,
  forceRefresh = false,
): Promise<WishlistDoc[]> {
  if (!userId) return [];
  const params = new URLSearchParams({ customerId: String(userId) });
  if (forceRefresh) params.set('refresh', 'true');
  const res = await fetch(`${API_BASE}/customer/wishlist-overview?${params.toString()}`, {
    headers: buildHeaders(),
    cache: 'no-store',
    credentials: 'omit',
    signal,
  });
  if (!res.ok) {
    throw new Error(`Failed to load wishlist (${res.status})`);
  }
  const data = await res.json();
  if (!data?.success || !Array.isArray(data?.docs)) {
    throw new Error(data?.error || 'Invalid wishlist response');
  }
  return data.docs as WishlistDoc[];
}
