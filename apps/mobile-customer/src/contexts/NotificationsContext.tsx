import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQueryClient } from '@tanstack/react-query';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { apiConfig, supabaseConfig, isSupabaseRealtimeEnabled } from '../config/environment';
import { useAuth } from '../contexts/AuthContext';
import {
  fetchNotifications as fetchNotificationsApi,
  fetchUnreadCount as fetchUnreadCountApi,
  markNotificationAsRead,
  markNotificationAsUnread,
  markNotificationsAsRead,
  markAllNotificationsAsSeen,
  type NotificationItem,
} from '../services/notifications';
import type { AccountOverview } from '../services/account';

interface NotificationsContextValue {
  notifications: NotificationItem[];
  unreadCount: number;
  unseenCount: number;
  isLoading: boolean;
  isRealtimeConnected: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAsUnread: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  markAllAsSeen: () => Promise<void>;
  subscribeToOrderUpdates: (listener: (orderId: string) => void) => () => void;
}

const NotificationsContext = createContext<NotificationsContextValue | undefined>(undefined);
type OrderUpdateListener = (orderId: string) => void;

function buildItem(raw: any): NotificationItem | null {
  if (!raw) return null;
  const metadata = raw.metadata || null;
  return {
    id: String(raw.id ?? ''),
    title: raw.title || 'Notification',
    body: raw.body || '',
    domain: raw.domain || 'system',
    priority: raw.priority || 'info',
    status: raw.status || 'unread',
    channel: raw.channel || 'in_app',
    typeKey: raw.typeKey || '',
    deliveredAt: raw.deliveredAt || new Date().toISOString(),
    metadata,
    orderId: metadata?.orderId ? String(metadata.orderId) : null,
    seen: Boolean(raw.seenAt),
  };
}

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id ? String(user.id) : null;

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unseenCount, setUnseenCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);

  const supabaseRef = useRef<SupabaseClient | null>(null);
  const channelRef = useRef<any>(null);
  const orderChannelRef = useRef<any>(null);
  const orderUpdateListenersRef = useRef(new Set<OrderUpdateListener>());

  const subscribeToOrderUpdates = useCallback((listener: OrderUpdateListener) => {
    orderUpdateListenersRef.current.add(listener);
    return () => {
      orderUpdateListenersRef.current.delete(listener);
    };
  }, []);

  const setAccountUnreadCount = useCallback((count: number) => {
    if (!userId) return;
    queryClient.setQueryData<AccountOverview>(
      ['account-overview', userId],
      (overview) => overview
        ? {
            ...overview,
            stats: {
              ...overview.stats,
              unreadNotificationCount: count,
            },
          }
        : overview,
    );
  }, [queryClient, userId]);
  const adjustAccountUnreadCount = useCallback((delta: number) => {
    if (!userId || delta === 0) return;
    queryClient.setQueryData<AccountOverview>(
      ['account-overview', userId],
      (overview) => overview
        ? {
            ...overview,
            stats: {
              ...overview.stats,
              unreadNotificationCount: Math.max(
                0,
                overview.stats.unreadNotificationCount + delta,
              ),
            },
          }
        : overview,
    );
  }, [queryClient, userId]);

  const loadAll = useCallback(async () => {
    if (!userId) {
      setNotifications([]);
      setUnreadCount(0);
      setUnseenCount(0);
      return;
    }
    setIsLoading(true);
    try {
      const { docs, unreadCount: unread, unseenCount: unseen } = await fetchNotificationsApi(
        userId,
      );
      setNotifications(docs);
      setUnreadCount(unread);
      setUnseenCount(unseen);
      setAccountUnreadCount(unread);
    } catch (err) {
      console.error('[NotificationsContext] Failed to load notifications:', err);
    } finally {
      setIsLoading(false);
    }
  }, [setAccountUnreadCount, userId]);

  const syncUnreadOnly = useCallback(async () => {
    if (!userId) return;
    try {
      const count = await fetchUnreadCountApi(userId);
      setUnreadCount(count);
      setAccountUnreadCount(count);
    } catch {
      // Best-effort - a later poll or realtime event will correct it.
    }
  }, [setAccountUnreadCount, userId]);

  // Initial load + reload whenever the logged-in user changes.
  useEffect(() => {
    loadAll();
  }, [userId, loadAll]);

  // Periodic + foreground re-sync (Realtime broadcast is ephemeral).
  useEffect(() => {
    const interval = setInterval(() => {
      loadAll();
    }, 45000);

    const appStateSub = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        loadAll();
      }
    });

    return () => {
      clearInterval(interval);
      appStateSub.remove();
    };
  }, [loadAll]);

  // Supabase Realtime subscription for instant bell updates.
  useEffect(() => {
    if (!userId) return;
    if (!isSupabaseRealtimeEnabled()) return;

    let active = true;
    let supabase: SupabaseClient | null = null;
    let channel: any = null;
    let orderChannel: any = null;

    const connect = async () => {
      const token = await AsyncStorage.getItem('grandline_auth_token');
      if (!token) return;

      const channelResponse = await fetch(
        `${apiConfig.baseUrl}/customer/order-realtime-channel`,
        {
          headers: { Authorization: `JWT ${token}` },
          cache: 'no-store',
        },
      );
      const channelData = await channelResponse.json().catch(() => ({}));
      if (!channelResponse.ok) {
        throw new Error(channelData?.error || `Could not connect to live order updates (${channelResponse.status}).`);
      }
      const orderChannelName = channelData?.channelName;
      if (typeof orderChannelName !== 'string' || !/^orders:[a-f0-9]{64}$/.test(orderChannelName)) {
        throw new Error('The server returned an invalid live order channel.');
      }
      if (!active) return;

      supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });
      supabaseRef.current = supabase;

      const channelName = `notifications:user:${userId}`;
      channel = supabase
        .channel(channelName, { config: { broadcast: { self: true } } })
        .on(
          'broadcast',
          { event: 'new_notification' },
          (payload: any) => {
            const item = buildItem(payload?.payload?.notification);
            if (item) {
              setNotifications((prev) => [
                item,
                ...prev.filter((n) => n.id !== item.id),
              ]);
              if (!item.seen) {
                setUnseenCount((prev) => prev + 1);
              }
              if (item.status !== 'read') {
                setUnreadCount((prev) => prev + 1);
                adjustAccountUnreadCount(1);
              }
            }
          },
        )
        .on(
          'broadcast',
          { event: 'notification_read' },
          ({ payload }: any) => {
            const id = payload?.notificationId;
            if (!id) return;
            setNotifications((prev) =>
              prev.map((n) => (n.id === id ? { ...n, status: 'read' } : n)),
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));
            adjustAccountUnreadCount(-1);
          },
        )
        .subscribe((status: string, err?: any) => {
          setIsRealtimeConnected(status === 'SUBSCRIBED');
          if (err) {
            console.warn('[NotificationsContext] Realtime subscribe error:', err?.message);
          }
        });

      channelRef.current = channel;

      orderChannel = supabase
        .channel(orderChannelName, { config: { broadcast: { self: true } } })
        .on('broadcast', { event: 'order_updated' }, ({ payload }: any) => {
          const orderId = payload?.orderId;
          if (typeof orderId !== 'string' && typeof orderId !== 'number') return;

          const normalizedOrderId = String(orderId);
          void queryClient.invalidateQueries({
            queryKey: ['customer-orders', userId],
          });
          for (const listener of orderUpdateListenersRef.current) {
            listener(normalizedOrderId);
          }
        })
        .subscribe((status: string, err?: any) => {
          if (err || status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            console.warn('[NotificationsContext] Order Realtime subscription failed:', err?.message || status);
          }
        });
      orderChannelRef.current = orderChannel;
    };

    connect().catch((err) => {
      if (active) {
        console.warn('[NotificationsContext] Realtime init failed:', err);
      }
    });

    return () => {
      active = false;
      if (channel) {
        try {
          supabase?.removeChannel(channel);
        } catch {
          // cleanup best-effort
        }
      }
      if (orderChannel) {
        try {
          supabase?.removeChannel(orderChannel);
        } catch {
          // cleanup best-effort
        }
      }
      supabaseRef.current = null;
      channelRef.current = null;
      orderChannelRef.current = null;
      setIsRealtimeConnected(false);
    };
  }, [adjustAccountUnreadCount, queryClient, userId]);

  const markAsRead = useCallback(
    async (id: string) => {
      const target = notifications.find((n) => n.id === id);
      const wasUnread = target?.status === 'unread';
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, status: 'read' } : n)),
      );
      if (wasUnread) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
      try {
        await markNotificationAsRead(id);
        if (wasUnread) adjustAccountUnreadCount(-1);
      } catch (err) {
        console.error('[NotificationsContext] markAsRead failed:', err);
      }
      syncUnreadOnly();
    },
    [notifications, syncUnreadOnly, adjustAccountUnreadCount],
  );

  const markAllAsRead = useCallback(async () => {
    const unread = notifications.filter((n) => n.status === 'unread');
    if (unread.length === 0) return;

    setNotifications((prev) => prev.map((n) => ({ ...n, status: 'read' })));
    setUnreadCount(0);
    await markNotificationsAsRead(unread.map((n) => n.id));
    adjustAccountUnreadCount(-unread.length);
  }, [notifications, adjustAccountUnreadCount]);

  const markAsUnread = useCallback(async (id: string) => {
    const target = notifications.find((n) => n.id === id);
    const wasRead = target?.status === 'read';
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, status: 'unread' } : n)),
    );
    if (wasRead) {
      setUnreadCount((prev) => prev + 1);
    }
    try {
      await markNotificationAsUnread(id);
      if (wasRead) adjustAccountUnreadCount(1);
    } catch (err) {
      console.error('[NotificationsContext] markAsUnread failed:', err);
    }
    syncUnreadOnly();
  }, [notifications, syncUnreadOnly, adjustAccountUnreadCount]);

  // Clears the bell badge but keeps notifications unread - Facebook-style.
  const markAllAsSeen = useCallback(async () => {
    if (unseenCount === 0) return;
    if (!userId) return;

    setNotifications((prev) => prev.map((n) => ({ ...n, seen: true })));
    setUnseenCount(0);
    try {
      await markAllNotificationsAsSeen(userId);
    } catch (err) {
      console.error('[NotificationsContext] markAllAsSeen failed:', err);
    }
  }, [unseenCount, userId]);

  const value: NotificationsContextValue = {
    notifications,
    unreadCount,
    unseenCount,
    isLoading,
    isRealtimeConnected,
    fetchNotifications: loadAll,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    markAllAsSeen,
    subscribeToOrderUpdates,
  };

  return (
    <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>
  );
}

export function useNotifications(): NotificationsContextValue {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
}