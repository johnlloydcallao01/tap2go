import React, { createContext, useContext, useCallback, useEffect, useState, useMemo, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiConfig } from '../config/environment';
import { useAuth } from './AuthContext';

// Web CartItem Type
export type CartItem = {
  id: number;
  customer: number;
  merchant: number;
  product: number;
  merchantProduct: number;
  quantity: number;
  priceAtAdd: number;
  compareAtPrice?: number | null;
  subtotal: number;
  productSize?: string | null;
  selectedVariation?: number | null;
  selectedVariationName?: string | null;
  selectedModifiers?: any[] | null;
  selectedAddons?: any[] | null;
  isAvailable?: boolean;
  unavailableReason?: string | null;
  createdAt?: string;
  updatedAt?: string;
  productName?: string;
  merchantName?: string;
  imageUrl?: string | null;
  merchantLogoUrl?: string | null;
  specialInstructions?: string | null;
  isPending?: boolean;
};

export type AddToCartPayload = {
  merchantId: number;
  productId: number;
  merchantProductId: number;
  quantity: number;
  priceAtAdd: number;
  productName?: string;
  imageUrl?: string | null;
  merchantName?: string;
  merchantLogoUrl?: string | null;
  compareAtPrice?: number | null;
  selectedModifiers?: any[] | null;
  selectedVariation?: { relationTo: string; value: number | string } | null;
};

type PendingCartAdd = {
  id: number;
  customerId: string;
  payload: AddToCartPayload;
  optimisticId: number;
};

// Mobile specific helper types for UI grouping
export interface MerchantCartSummary {
  merchantId: string; // Keep as string for route params compatibility
  merchantName: string;
  merchantLogoUrl?: string | null;
  totalItems: number;
  subtotal: number;
  items: CartItem[];
}

export interface CartContextType {
  items: CartItem[];
  isLoading: boolean;
  error: string | null;
  loadError: string | null;
  hasPendingAddsForMerchant: (merchantId: string | number) => boolean;
  totalQuantity: number;
  reload: () => Promise<void>;
  markCheckedOut: (itemIds: number[]) => void;
  addToCart: (payload: AddToCartPayload) => Promise<void>;
  removeFromCart: (id: number) => Promise<void>;
  updateQuantity: (id: number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  clearMerchantCart: (merchantId: string | number) => Promise<void>;
  getMerchantCart: (merchantId: string | number) => MerchantCartSummary | null;
  getAllMerchantCarts: () => MerchantCartSummary[];
  getCartTotal: () => number;
  getCartItemCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function getCartSnapshotKey(customerId: string) {
  return `customer-cart:${customerId}`;
}

function isCartSnapshot(value: unknown, customerId: string): value is CartItem[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        item !== null &&
        typeof item === 'object' &&
        String((item as CartItem).customer) === customerId,
    )
  );
}

function getModifierIdentity(modifiers: unknown): string | null {
  if (!Array.isArray(modifiers)) return null;

  const identities: string[] = [];
  for (const modifier of modifiers) {
    if (!modifier || typeof modifier !== 'object') return null;
    const value = modifier as Record<string, unknown>;
    const groupId = value.groupId ?? value.group_id;
    const optionId = value.optionId ?? value.option_id;
    if (groupId == null || optionId == null) return null;
    identities.push(`${String(groupId)}:${String(optionId)}`);
  }
  return identities.join('|');
}

function getVariationId(value: unknown): string | null {
  if (value == null) return null;
  if (typeof value !== 'object') return String(value);

  const variation = value as Record<string, unknown>;
  const relationValue = variation.value;
  if (relationValue && typeof relationValue === 'object') {
    const id = (relationValue as Record<string, unknown>).id;
    return id == null ? null : String(id);
  }
  const id = relationValue ?? variation.id;
  return id == null ? null : String(id);
}

function getCartItemIdentity(item: CartItem): string | null {
  if (
    item.productSize ||
    item.specialInstructions?.trim() ||
    (Array.isArray(item.selectedAddons) && item.selectedAddons.length > 0) ||
    (Array.isArray(item.selectedModifiers) && item.selectedModifiers.length > 0)
  ) {
    return null;
  }

  return [
    item.merchant,
    item.product,
    item.merchantProduct,
    getVariationId(item.selectedVariation),
    '',
  ].join(':');
}

function getAddPayloadIdentity(payload: AddToCartPayload): string | null {
  const modifiers = getModifierIdentity(payload.selectedModifiers ?? []);
  if (modifiers === null || modifiers !== '') return null;

  return [
    payload.merchantId,
    payload.productId,
    payload.merchantProductId,
    getVariationId(payload.selectedVariation),
    modifiers,
  ].join(':');
}

function getAddUnitPrice(payload: AddToCartPayload): number {
  const modifierTotal = Array.isArray(payload.selectedModifiers)
    ? payload.selectedModifiers.reduce((total, modifier) => {
        const price = Number(modifier?.price);
        return total + (Number.isFinite(price) ? price : 0);
      }, 0)
    : 0;
  return payload.priceAtAdd + modifierTotal;
}

function mapCartItem(doc: any, fallback?: AddToCartPayload, customerId?: number): CartItem {
  const product = doc.product || null;
  const merchant = doc.merchant || null;
  const media = product?.media?.primaryImage || null;
  const imageUrl =
    media?.cloudinaryURL ||
    media?.url ||
    media?.thumbnailURL ||
    fallback?.imageUrl ||
    null;
  const merchantLogoMedia = merchant?.vendor?.logo || null;
  const merchantLogoUrl =
    merchantLogoMedia?.cloudinaryURL ||
    merchantLogoMedia?.url ||
    merchantLogoMedia?.thumbnailURL ||
    null;
  const selectedVariation = doc.selectedVariation;
  const selectedVariationId = selectedVariation
    ? typeof selectedVariation === 'object' && selectedVariation !== null
      ? 'value' in selectedVariation
        ? typeof selectedVariation.value === 'object'
          ? selectedVariation.value?.id
          : selectedVariation.value
        : selectedVariation.id
      : selectedVariation
    : fallback?.selectedVariation?.value ?? null;

  return {
    id: Number(doc.id),
    customer:
      typeof doc.customer === 'object' && doc.customer !== null
        ? Number(doc.customer.id)
        : Number(doc.customer ?? customerId),
    merchant:
      typeof doc.merchant === 'object' && doc.merchant !== null
        ? Number(doc.merchant.id)
        : Number(doc.merchant ?? fallback?.merchantId),
    product:
      typeof doc.product === 'object' && doc.product !== null
        ? Number(doc.product.id)
        : Number(doc.product ?? fallback?.productId),
    merchantProduct:
      typeof doc.merchantProduct === 'object' && doc.merchantProduct !== null
        ? Number(doc.merchantProduct.id)
        : Number(doc.merchantProduct ?? fallback?.merchantProductId),
    quantity: Number(doc.quantity ?? fallback?.quantity ?? 1),
    priceAtAdd: Number(doc.priceAtAdd ?? fallback?.priceAtAdd ?? 0),
    compareAtPrice: doc.compareAtPrice ?? fallback?.compareAtPrice ?? null,
    subtotal: Number(doc.subtotal ?? 0),
    productSize: doc.productSize || null,
    selectedVariation: selectedVariationId ? Number(selectedVariationId) : null,
    selectedVariationName:
      typeof selectedVariation === 'object' && selectedVariation !== null
        ? ('value' in selectedVariation
            ? typeof selectedVariation.value === 'object'
              ? selectedVariation.value?.name || null
              : null
            : selectedVariation.name || null)
        : null,
    selectedModifiers: doc.selectedModifiers ?? fallback?.selectedModifiers ?? null,
    selectedAddons: doc.selectedAddons || null,
    isAvailable: typeof doc.isAvailable === 'boolean' ? doc.isAvailable : true,
    unavailableReason: doc.unavailableReason || null,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    productName: product?.name || fallback?.productName || '',
    merchantName: merchant?.outletName || merchant?.name || fallback?.merchantName || '',
    imageUrl,
    merchantLogoUrl: merchantLogoUrl || fallback?.merchantLogoUrl || null,
    specialInstructions: doc.specialInstructions || null,
  };
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { customerId } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [pendingAdds, setPendingAdds] = useState<PendingCartAdd[]>([]);
  const [snapshotCustomerId, setSnapshotCustomerId] = useState<string | null>(null);
  const [resolvedCustomerId, setResolvedCustomerId] = useState<string | null>(null);
  const snapshotCustomerIdRef = useRef<string | null>(null);
  const loadSequenceRef = useRef(0);
  const nextOptimisticIdRef = useRef(-1);
  const nextPendingAddIdRef = useRef(1);

  const API_BASE = apiConfig.baseUrl;

  const loadCart = useCallback(async () => {
    const sequence = ++loadSequenceRef.current;
    try {
      if (!customerId) {
        setItems([]);
        setSnapshotCustomerId(null);
        setResolvedCustomerId(null);
        snapshotCustomerIdRef.current = null;
        setIsLoading(false);
        setError(null);
        setLoadError(null);
        return;
      }

      const customerKey = String(customerId);
      if (snapshotCustomerIdRef.current !== customerKey) setIsLoading(true);
      setError(null);
      setLoadError(null);

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      const apiKey = apiConfig.payloadApiKey;
      if (apiKey) headers['Authorization'] = `users API-Key ${apiKey}`;

      const requestStartedAt = Date.now();
      const request = fetch(
        `${API_BASE}/customer/cart?customerId=${encodeURIComponent(customerKey)}`,
        { headers, cache: 'no-store' },
      );

      try {
        const cached = await AsyncStorage.getItem(getCartSnapshotKey(customerKey));
        if (cached && sequence === loadSequenceRef.current) {
          const parsed: unknown = JSON.parse(cached);
          if (isCartSnapshot(parsed, customerKey) && parsed.length > 0) {
            setItems(parsed);
            setSnapshotCustomerId(customerKey);
            snapshotCustomerIdRef.current = customerKey;
            setResolvedCustomerId(customerKey);
            setIsLoading(false);
          }
        }
      } catch (cacheError) {
        console.warn('[CartContext] Failed to read saved cart snapshot:', cacheError);
      }

      let res = await request;
      if (sequence !== loadSequenceRef.current) return;

      let data: any = null;
      if (res.ok) data = await res.json();

      let fallbackUsed = false;
      if (!res.ok || !Array.isArray(data?.docs) || data.docs.length === 0) {
        fallbackUsed = true;
        if (res.ok) {
          console.warn('[CartContext] Optimized cart read returned no records; retrying the collection API.');
        } else {
          console.warn(`[CartContext] Optimized cart read failed (${res.status}); retrying the collection API.`);
        }
        res = await fetch(
          `${API_BASE}/cart-items?where[customer][equals]=${encodeURIComponent(customerKey)}&where[status][equals]=active&depth=3&limit=200`,
          { headers, cache: 'no-store' },
        );
        if (!res.ok) throw new Error(`Cart request failed (${res.status})`);
        data = await res.json();
      }

      if (sequence !== loadSequenceRef.current) return;
      if (!Array.isArray(data?.docs)) {
        throw new Error('Cart request returned an invalid response');
      }
      const docs: any[] = Array.isArray(data?.docs) ? data.docs : [];
      
      const mapped: CartItem[] = docs.map((doc: any) => mapCartItem(doc));
      
      setItems(mapped);
      setSnapshotCustomerId(customerKey);
      snapshotCustomerIdRef.current = customerKey;
      setIsLoading(false);
      setResolvedCustomerId(customerKey);
      console.info('[cart] request timing', {
        durationMs: Date.now() - requestStartedAt,
        status: res.status,
        itemCount: mapped.length,
        fallbackUsed,
      });
    } catch (e: any) {
      if (sequence !== loadSequenceRef.current) return;
      setError(e?.message || 'Failed to load cart');
      setLoadError(e?.message || 'Failed to load cart');
      setIsLoading(false);
      if (customerId) setResolvedCustomerId(String(customerId));
    }
  }, [customerId, API_BASE]);

  const visibleItems = useMemo(() => {
    const customerKey = customerId ? String(customerId) : null;
    const confirmedItems =
      snapshotCustomerId === customerKey ? items : [];
    const optimisticItems = [...confirmedItems];
    const customerPendingAdds = pendingAdds.filter(
      (pendingAdd) => pendingAdd.customerId === customerKey,
    );

    for (const pendingAdd of customerPendingAdds) {
      const { payload } = pendingAdd;
      const identity = getAddPayloadIdentity(payload);
      const existingIndex =
        identity === null
          ? -1
          : optimisticItems.findIndex(
              (item) => getCartItemIdentity(item) === identity,
            );
      const unitPrice = getAddUnitPrice(payload);

      if (existingIndex >= 0) {
        const existingItem = optimisticItems[existingIndex];
        const quantity = existingItem.quantity + payload.quantity;
        optimisticItems[existingIndex] = {
          ...existingItem,
          quantity,
          subtotal: existingItem.subtotal + unitPrice * payload.quantity,
          isPending: true,
        };
        continue;
      }

      optimisticItems.push({
        id: pendingAdd.optimisticId,
        customer: Number(pendingAdd.customerId),
        merchant: payload.merchantId,
        product: payload.productId,
        merchantProduct: payload.merchantProductId,
        quantity: payload.quantity,
        priceAtAdd: payload.priceAtAdd,
        compareAtPrice: payload.compareAtPrice ?? null,
        subtotal: unitPrice * payload.quantity,
        selectedVariation: Number(getVariationId(payload.selectedVariation)) || null,
        selectedModifiers: payload.selectedModifiers ?? [],
        isAvailable: true,
        productName: payload.productName || '',
        merchantName: payload.merchantName || '',
        imageUrl: payload.imageUrl ?? null,
        merchantLogoUrl: payload.merchantLogoUrl ?? null,
        isPending: true,
      });
    }

    return optimisticItems;
  }, [customerId, items, pendingAdds, snapshotCustomerId]);

  const hasPendingAddsForMerchant = useCallback(
    (merchantId: string | number) =>
      Boolean(customerId) &&
      pendingAdds.some(
        (pendingAdd) =>
          pendingAdd.customerId === String(customerId) &&
          String(pendingAdd.payload.merchantId) === String(merchantId),
      ),
    [customerId, pendingAdds],
  );
  const markCheckedOut = useCallback((itemIds: number[]) => {
    const customerKey = customerId ? String(customerId) : null;
    if (!customerKey || snapshotCustomerId !== customerKey || itemIds.length === 0) return;

    const checkedOutIds = new Set(itemIds);
    const nextItems = items.filter((item) => !checkedOutIds.has(item.id));

    loadSequenceRef.current += 1;
    setItems(nextItems);
    void AsyncStorage.setItem(getCartSnapshotKey(customerKey), JSON.stringify(nextItems))
      .catch((cacheError) => {
        console.warn('[CartContext] Failed to persist checked-out cart items:', cacheError);
      });
  }, [customerId, items, snapshotCustomerId]);
  const isLoadingForCustomer = Boolean(
    customerId &&
    (isLoading || resolvedCustomerId !== String(customerId)),
  );

  const addToCart = useCallback(
    async (payload: AddToCartPayload) => {
      let pendingAddId: number | null = null;
      try {
        setError(null);

        if (!customerId) {
          throw new Error('Please login to add items to cart');
        }

        pendingAddId = nextPendingAddIdRef.current++;
        const pendingAdd: PendingCartAdd = {
          id: pendingAddId,
          customerId: String(customerId),
          payload,
          optimisticId: nextOptimisticIdRef.current--,
        };
        setPendingAdds((previous) => [...previous, pendingAdd]);

        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        const apiKey = apiConfig.payloadApiKey;
        if (apiKey) headers['Authorization'] = `users API-Key ${apiKey}`;

        const body: any = {
          customer: Number(customerId), // Ensure number if backend expects it
          merchant: payload.merchantId,
          product: payload.productId,
          merchantProduct: payload.merchantProductId,
          quantity: payload.quantity,
          priceAtAdd: payload.priceAtAdd,
        };
        
        if (payload.compareAtPrice != null) {
          body.compareAtPrice = payload.compareAtPrice;
        }
        if (payload.selectedModifiers && payload.selectedModifiers.length > 0) {
          body.selectedModifiers = payload.selectedModifiers;
        }
        if (payload.selectedVariation) {
          body.selectedVariation = payload.selectedVariation;
        }

        const res = await fetch(`${API_BASE}/cart-items`, {
          method: 'POST',
          headers,
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          let rawText = '';
          let message = '';
          try {
            const data = await res.json();
            const messages: string[] = [];
            if (data && typeof (data as any).message === 'string') {
              messages.push((data as any).message);
            }
            const errors = (data as any).errors;
            if (Array.isArray(errors)) {
              for (const err of errors) {
                if (err && typeof err.message === 'string') {
                  messages.push(err.message);
                }
              }
            }
            message = messages.join(' | ');
            rawText = message || JSON.stringify(data);
          } catch {
            rawText = await res.text().catch(() => '');
          }

          const text = rawText || '';
          if (text.includes('CART_ITEM_MERGED:')) {
            await loadCart();
            return;
          }

          throw new Error(text || `Add to cart failed (${res.status})`);
        }

        let responseData: any = null;
        try {
          responseData = await res.json();
        } catch {
          // A successful create response should include its saved document.
        }

        const savedDoc = responseData?.doc;
        if (savedDoc && (typeof savedDoc.id === 'number' || typeof savedDoc.id === 'string')) {
          const savedItem = mapCartItem(savedDoc, payload, Number(customerId));
          loadSequenceRef.current += 1;
          setItems((previous) => [
            ...previous.filter((item) => item.id !== savedItem.id),
            savedItem,
          ]);
          setSnapshotCustomerId(String(customerId));
          snapshotCustomerIdRef.current = String(customerId);
          setResolvedCustomerId(String(customerId));
          setIsLoading(false);
        } else {
          await loadCart();
        }
      } catch (e: any) {
        setError(e?.message || 'Failed to add to cart');
        throw e; // Re-throw so UI can handle it
      } finally {
        if (pendingAddId !== null) {
          setPendingAdds((previous) =>
            previous.filter((pendingAdd) => pendingAdd.id !== pendingAddId),
          );
        }
      }
    },
    [customerId, loadCart, API_BASE]
  );

  const removeItemServer = useCallback(
    async (id: number) => {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      const apiKey = apiConfig.payloadApiKey;
      if (apiKey) headers['Authorization'] = `users API-Key ${apiKey}`;

      const res = await fetch(`${API_BASE}/cart-items/${id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          status: 'removed',
          deleted_at: new Date().toISOString(),
        }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(text || `Remove from cart failed (${res.status})`);
      }
    },
    [API_BASE],
  );

  const removeFromCart = useCallback(
    async (id: number) => {
      if (id < 0 || visibleItems.find((item) => item.id === id)?.isPending) return;
      try {
        setError(null);
        await removeItemServer(id);
        await loadCart();
      } catch (e: any) {
        setError(e?.message || 'Failed to remove from cart');
      }
    },
    [removeItemServer, loadCart, visibleItems]
  );

  const updateQuantity = useCallback(
    async (id: number, quantity: number) => {
      if (id < 0 || visibleItems.find((item) => item.id === id)?.isPending) return;
      try {
        setError(null);

        // Decrementing below 1 removes the item from the cart instead of
        // leaving a stale zero-quantity line item.
        if (quantity < 1) {
          await removeFromCart(id);
          return;
        }

        // Optimistic update
        setItems((prev) =>
          prev.map((item) => {
            if (item.id !== id) return item;
            const unit =
              item.quantity > 0 ? item.subtotal / item.quantity : item.priceAtAdd;
            return {
              ...item,
              quantity,
              subtotal: unit * quantity,
            };
          }),
        );
        
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        const apiKey = apiConfig.payloadApiKey;
        if (apiKey) headers['Authorization'] = `users API-Key ${apiKey}`;

        const res = await fetch(`${API_BASE}/cart-items/${id}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({ quantity }),
        });

        if (!res.ok) {
          const text = await res.text().catch(() => '');
          throw new Error(text || `Update quantity failed (${res.status})`);
        }

      } catch (e: any) {
        const originalItem = items.find((item) => item.id === id);
        if (originalItem) {
          setItems((prev) =>
            prev.map((item) => (item.id === id ? originalItem : item)),
          );
        }
        setError(e?.message || 'Failed to update quantity');
      }
    },
    [removeFromCart, items, API_BASE, visibleItems]
  );

  const clearCart = useCallback(async () => {
    try {
      await Promise.allSettled(
        visibleItems
          .filter((item) => item.id > 0 && !item.isPending)
          .map((item) => removeItemServer(item.id)),
      );
      await loadCart();
    } catch (e) {
      console.error('Failed to clear cart', e);
    }
  }, [visibleItems, removeItemServer, loadCart]);

  const clearMerchantCart = useCallback(async (merchantId: string | number) => {
    try {
      const mIdStr = String(merchantId);
      const itemsToDelete = visibleItems.filter(
        (item) => String(item.merchant) === mIdStr && item.id > 0 && !item.isPending,
      );
      await Promise.allSettled(itemsToDelete.map(item => removeItemServer(item.id)));
      await loadCart();
    } catch (e) {
      console.error('Failed to clear merchant cart', e);
    }
  }, [visibleItems, removeItemServer, loadCart]);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  useEffect(() => {
    if (!customerId || snapshotCustomerId !== String(customerId)) return;
    AsyncStorage.setItem(getCartSnapshotKey(String(customerId)), JSON.stringify(items))
      .catch((cacheError) => {
        console.warn('[CartContext] Failed to persist cart changes:', cacheError);
      });
  }, [customerId, snapshotCustomerId, items]);

  const totalQuantity = useMemo(() => {
    let count = 0;
    for (const item of visibleItems) {
      count += Number(item.quantity) || 0;
    }
    return count;
  }, [visibleItems]);

  const getCartTotal = () => {
    return visibleItems.reduce((sum, item) => sum + item.subtotal, 0);
  };

  const getCartItemCount = () => {
    return totalQuantity;
  };

  const getAllMerchantCarts = useCallback((): MerchantCartSummary[] => {
    const groups: Record<string, CartItem[]> = {};
    
    visibleItems.forEach(item => {
      const mId = String(item.merchant);
      if (!groups[mId]) groups[mId] = [];
      groups[mId].push(item);
    });

    return Object.keys(groups).map(merchantId => {
      const groupItems = groups[merchantId];
      const subtotal = groupItems.reduce((sum, item) => sum + item.subtotal, 0);
      const totalItems = groupItems.reduce((sum, item) => sum + item.quantity, 0);
      
      // Use the name/logo from the first item
      const merchantName = groupItems[0]?.merchantName || 'Merchant';
      const merchantLogoUrl = groupItems[0]?.merchantLogoUrl;
      
      return {
        merchantId,
        merchantName,
        merchantLogoUrl,
        totalItems,
        subtotal,
        items: groupItems
      };
    });
  }, [visibleItems]);

  const getMerchantCart = useCallback((merchantId: string | number): MerchantCartSummary | null => {
    const mIdStr = String(merchantId);
    const merchantItems = visibleItems.filter(item => String(item.merchant) === mIdStr);
    
    if (merchantItems.length === 0) return null;

    const merchantName = merchantItems[0]?.merchantName || 'Merchant';
    const merchantLogoUrl = merchantItems[0]?.merchantLogoUrl;
    const subtotal = merchantItems.reduce((sum, item) => sum + item.subtotal, 0);
    const totalItems = merchantItems.reduce((sum, item) => sum + item.quantity, 0);

    return {
      merchantId: mIdStr,
      merchantName,
      merchantLogoUrl,
      totalItems,
      subtotal,
      items: merchantItems
    };
  }, [visibleItems]);

  const value: CartContextType = {
    items: visibleItems,
    isLoading: isLoadingForCustomer,
    error,
    loadError,
    hasPendingAddsForMerchant,
    totalQuantity,
    reload: loadCart,
    markCheckedOut,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    clearMerchantCart,
    getMerchantCart,
    getAllMerchantCarts,
    getCartTotal,
    getCartItemCount
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}
