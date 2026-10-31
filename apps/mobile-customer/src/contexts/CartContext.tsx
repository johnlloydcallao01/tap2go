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
};

export type AddToCartPayload = {
  merchantId: number;
  productId: number;
  merchantProductId: number;
  quantity: number;
  priceAtAdd: number;
  compareAtPrice?: number | null;
  selectedModifiers?: any[] | null;
  selectedVariation?: { relationTo: string; value: number | string } | null;
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
  totalQuantity: number;
  reload: () => Promise<void>;
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
  const [pendingMerchantIds, setPendingMerchantIds] = useState<Set<number>>(new Set());
  const [snapshotCustomerId, setSnapshotCustomerId] = useState<string | null>(null);
  const [resolvedCustomerId, setResolvedCustomerId] = useState<string | null>(null);
  const snapshotCustomerIdRef = useRef<string | null>(null);
  const loadSequenceRef = useRef(0);

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
      
      const mapped: CartItem[] = docs.map((doc: any) => {
        const product = doc.product || null;
        const merchant = doc.merchant || null;
        const media = product?.media?.primaryImage || null;
        const imageUrl = media?.cloudinaryURL || media?.url || media?.thumbnailURL || null;
        const merchantLogoMedia = merchant?.vendor?.logo || null;
        const merchantLogoUrl =
          merchantLogoMedia?.cloudinaryURL ||
          merchantLogoMedia?.url ||
          merchantLogoMedia?.thumbnailURL ||
          null;
          
        return {
          id: doc.id,
          customer: typeof doc.customer === 'object' ? doc.customer.id : doc.customer,
          merchant: typeof doc.merchant === 'object' ? doc.merchant.id : doc.merchant,
          product: typeof doc.product === 'object' ? doc.product.id : doc.product,
          merchantProduct: typeof doc.merchantProduct === 'object' ? doc.merchantProduct.id : doc.merchantProduct,
          quantity: doc.quantity,
          priceAtAdd: doc.priceAtAdd,
          compareAtPrice: doc.compareAtPrice ?? null,
          subtotal: doc.subtotal,
          productSize: doc.productSize || null,
          selectedVariation: doc.selectedVariation
            ? (typeof doc.selectedVariation === 'object' && doc.selectedVariation !== null
                ? ('value' in doc.selectedVariation
                    ? (typeof doc.selectedVariation.value === 'object' ? doc.selectedVariation.value.id : doc.selectedVariation.value)
                    : doc.selectedVariation.id)
                : doc.selectedVariation)
            : null,
          selectedVariationName:
            typeof doc.selectedVariation === 'object' && doc.selectedVariation !== null
              ? ('value' in doc.selectedVariation
                  ? (typeof doc.selectedVariation.value === 'object' ? doc.selectedVariation.value?.name || null : null)
                  : doc.selectedVariation.name || null)
              : null,
          selectedModifiers: doc.selectedModifiers || null,
          selectedAddons: doc.selectedAddons || null,
          isAvailable: typeof doc.isAvailable === 'boolean' ? doc.isAvailable : true,
          unavailableReason: doc.unavailableReason || null,
          createdAt: doc.createdAt,
          updatedAt: doc.updatedAt,
          productName: product?.name || '',
          merchantName: merchant?.outletName || merchant?.name || '',
          imageUrl,
          merchantLogoUrl,
        };
      });
      
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

  const visibleItems = useMemo(
    () => (snapshotCustomerId === (customerId ? String(customerId) : null) ? items : []),
    [snapshotCustomerId, customerId, items],
  );
  const isLoadingForCustomer = Boolean(
    customerId &&
    (isLoading || resolvedCustomerId !== String(customerId)),
  );

  const addToCart = useCallback(
    async (payload: AddToCartPayload) => {
      try {
        setError(null);
        setPendingMerchantIds((prev) => {
          const next = new Set(prev);
          if (!next.has(payload.merchantId)) {
            next.add(payload.merchantId);
          }
          return next;
        });

        if (!customerId) {
          throw new Error('Please login to add items to cart');
        }

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

        await loadCart();
      } catch (e: any) {
        setError(e?.message || 'Failed to add to cart');
        throw e; // Re-throw so UI can handle it
      } finally {
        setPendingMerchantIds((prev) => {
          const next = new Set(prev);
          next.delete(payload.merchantId);
          return next;
        });
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
      try {
        setError(null);
        await removeItemServer(id);
        await loadCart();
      } catch (e: any) {
        setError(e?.message || 'Failed to remove from cart');
      }
    },
    [removeItemServer, loadCart]
  );

  const updateQuantity = useCallback(
    async (id: number, quantity: number) => {
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

        await loadCart();
      } catch (e: any) {
        setError(e?.message || 'Failed to update quantity');
      }
    },
    [removeFromCart, loadCart, API_BASE]
  );

  const clearCart = useCallback(async () => {
    try {
      await Promise.allSettled(visibleItems.map((item) => removeItemServer(item.id)));
      await loadCart();
    } catch (e) {
      console.error('Failed to clear cart', e);
    }
  }, [visibleItems, removeItemServer, loadCart]);

  const clearMerchantCart = useCallback(async (merchantId: string | number) => {
    try {
      const mIdStr = String(merchantId);
      const itemsToDelete = visibleItems.filter(item => String(item.merchant) === mIdStr);
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
    count += pendingMerchantIds.size;
    return count;
  }, [visibleItems, pendingMerchantIds]);

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
    totalQuantity,
    reload: loadCart,
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
