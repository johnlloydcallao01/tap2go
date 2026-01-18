"use client";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://cms.tap2goph.com/api";
const API_KEY = process.env.NEXT_PUBLIC_PAYLOAD_API_KEY || "";

function getCurrentUserIdFromStorage(): string | number | null {
  if (typeof window === "undefined") return null;
  const userDataStr = window.localStorage.getItem("grandline_auth_user");
  if (!userDataStr) return null;
  try {
    const parsed = JSON.parse(userDataStr);
    const id = parsed?.id;
    if (typeof id === "number" || typeof id === "string") {
      return id;
    }
    return null;
  } catch {
    return null;
  }
}

function buildHeaders(): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (API_KEY) {
    headers["Authorization"] = `users API-Key ${API_KEY}`;
  }
  return headers;
}

export async function getWishlistMerchantIdsForCurrentUser(): Promise<string[]> {
  const currentUserId = getCurrentUserIdFromStorage();
  if (currentUserId == null) return [];
  const headers = buildHeaders();
  const params = new URLSearchParams();
  params.append("where[user][equals]", String(currentUserId));
  params.append("limit", "200");
  params.append("depth", "0");
  const url = `${API_BASE}/wishlists?${params.toString()}`;
  try {
    const res = await fetch(url, { headers, cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    const docs: any[] = Array.isArray(data?.docs) ? data.docs : [];
    const ids = docs
      .map((doc) => {
        const m = (doc as any).merchant;
        if (!m) return null;
        if (typeof m === "number") return String(m);
        if (typeof m === "string") return m;
        const mid = (m as any).id;
        return mid ? String(mid) : null;
      })
      .filter((v): v is string => typeof v === "string" && v.length > 0);
    return Array.from(new Set(ids));
  } catch {
    return [];
  }
}

export async function addMerchantToWishlist(merchantId: string | number): Promise<void> {
  const userId = getCurrentUserIdFromStorage();
  if (!userId) return;
  const headers = buildHeaders();
  const body = JSON.stringify({
    user: userId,
    merchant: merchantId,
  });
  const url = `${API_BASE}/wishlists`;
  try {
    const res = await fetch(url, { method: "POST", headers, body });
    if (res.ok) return;
    const params = new URLSearchParams();
    params.append("where[user][equals]", String(userId));
    params.append("where[merchant][equals]", String(merchantId));
    params.append("limit", "1");
    const existsUrl = `${API_BASE}/wishlists?${params.toString()}`;
    const getRes = await fetch(existsUrl, { headers });
    if (!getRes.ok) return;
    const data = await getRes.json();
    const doc = Array.isArray(data?.docs) ? data.docs[0] : null;
    if (!doc || !doc.id) return;
  } catch {
  }
}

export async function removeMerchantFromWishlist(merchantId: string | number): Promise<void> {
  const userId = getCurrentUserIdFromStorage();
  if (!userId) return;
  const headers = buildHeaders();
  try {
    const params = new URLSearchParams();
    params.append("where[user][equals]", String(userId));
    params.append("where[merchant][equals]", String(merchantId));
    params.append("limit", "1");
    const listUrl = `${API_BASE}/wishlists?${params.toString()}`;
    const listRes = await fetch(listUrl, { headers });
    if (!listRes.ok) return;
    const data = await listRes.json();
    const doc = Array.isArray(data?.docs) ? data.docs[0] : null;
    if (!doc || !doc.id) return;
    const delUrl = `${API_BASE}/wishlists/${encodeURIComponent(String(doc.id))}`;
    await fetch(delUrl, { method: "DELETE", headers });
  } catch {
  }
}

export async function getWishlistDocsForCurrentUser(): Promise<any[]> {
  const currentUserId = getCurrentUserIdFromStorage();
  if (currentUserId == null) return [];
  const headers = buildHeaders();
  const params = new URLSearchParams();
  params.append("where[user][equals]", String(currentUserId));
  params.append("sort", "-createdAt");
  params.append("limit", "200");
  params.append("depth", "2");
  const url = `${API_BASE}/wishlists?${params.toString()}`;
  try {
    const res = await fetch(url, { headers, cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    const docs: any[] = Array.isArray(data?.docs) ? data.docs : [];
    return docs;
  } catch {
    return [];
  }
}

