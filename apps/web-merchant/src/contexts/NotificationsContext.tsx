'use client'

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { getMyNotifications, markAllMyNotifications, updateMyNotification, type MerchantNotification } from '@/app/actions/notifications'
import { OrderAlertSound } from '@/utils/orderAlertSound'

type RealtimeStatus = 'disabled' | 'connecting' | 'connected' | 'disconnected'

interface NotificationsContextValue {
  notifications: MerchantNotification[]
  unreadCount: number
  unseenCount: number
  isLoading: boolean
  realtimeStatus: RealtimeStatus
  orderSoundEnabled: boolean
  orderSoundReady: boolean
  orderSoundPreferenceLoaded: boolean
  orderSoundError: string | null
  activeOrderAlertCount: number
  markAsRead: (id: number | string) => Promise<void>
  markAsUnread: (id: number | string) => Promise<void>
  markAsSeen: (id: number | string) => Promise<void>
  markOrderAsSeen: (orderId: number | string) => Promise<void>
  markAllAsRead: () => Promise<void>
  markAllAsSeen: () => Promise<void>
  enableOrderSound: () => Promise<void>
  disableOrderSound: () => void
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null)

function record(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null
}

function mapBroadcastNotification(value: unknown): MerchantNotification | null {
  const raw = record(value)
  if (!raw || (typeof raw.id !== 'number' && typeof raw.id !== 'string')) return null

  const metadata = record(raw.metadata)
  const deliveredAt = typeof raw.deliveredAt === 'string' ? raw.deliveredAt : new Date().toISOString()
  const orderId = metadata?.orderId

  return {
    id: raw.id,
    title: typeof raw.title === 'string' ? raw.title : 'Notification',
    body: typeof raw.body === 'string' ? raw.body : '',
    domain: typeof raw.domain === 'string' ? raw.domain : 'system',
    typeKey: typeof raw.typeKey === 'string' ? raw.typeKey : 'system.notification',
    sourceEntityId: typeof raw.sourceEntityId === 'string'
      ? raw.sourceEntityId
      : typeof orderId === 'number' || typeof orderId === 'string' ? String(orderId) : null,
    priority: typeof raw.priority === 'string' ? raw.priority : 'info',
    status: raw.status === 'read' || raw.status === 'dismissed' || raw.status === 'hidden' ? raw.status : 'unread',
    channel: typeof raw.channel === 'string' ? raw.channel : 'in_app',
    deliveredAt,
    seenAt: typeof raw.seenAt === 'string' ? raw.seenAt : null,
    readAt: typeof raw.readAt === 'string' ? raw.readAt : null,
    archivedAt: typeof raw.archivedAt === 'string' ? raw.archivedAt : null,
    createdAt: deliveredAt,
    metadata,
  }
}

function orderSoundPreferenceKey(userId: number | string) {
  return `tap2go:merchant:order-sound:${userId}`
}

function seenNotificationsKey(userId: number | string) {
  return `tap2go:merchant:notifications-seen:${userId}`
}

export function NotificationsProvider({ children, userId }: { children: React.ReactNode; userId?: number | string }) {
  const [notifications, setNotifications] = useState<MerchantNotification[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [realtimeStatus, setRealtimeStatus] = useState<RealtimeStatus>('disabled')
  const [orderSoundEnabled, setOrderSoundEnabled] = useState(false)
  const [orderSoundReady, setOrderSoundReady] = useState(false)
  const [orderSoundPreferenceLoaded, setOrderSoundPreferenceLoaded] = useState(false)
  const [orderSoundError, setOrderSoundError] = useState<string | null>(null)
  const soundRef = useRef<OrderAlertSound | null>(null)
  const notificationRequestRef = useRef(0)
  const notificationVersionRef = useRef(0)

  const unreadCount = useMemo(
    () => notifications.filter((notification) => notification.status === 'unread').length,
    [notifications],
  )
  const unseenCount = useMemo(
    () => notifications.filter((notification) => !notification.seenAt).length,
    [notifications],
  )
  const activeOrderAlertIds = useMemo(
    () => notifications
      .filter((notification) => notification.typeKey === 'order.created' && !notification.seenAt && !notification.archivedAt)
      .map((notification) => String(notification.id)),
    [notifications],
  )

  const fetchNotifications = useCallback(async () => {
    if (!userId) return
    const requestId = ++notificationRequestRef.current
    const version = notificationVersionRef.current
    setIsLoading(true)
    try {
      const result = await getMyNotifications()
      if (!result) return
      if (requestId !== notificationRequestRef.current || version !== notificationVersionRef.current) return
      setNotifications(result.docs)
    } catch (error) {
      console.error('[MerchantNotifications] Failed to fetch notifications', error)
    } finally {
      if (requestId === notificationRequestRef.current) setIsLoading(false)
    }
  }, [userId])

  useEffect(() => {
    notificationVersionRef.current += 1
    notificationRequestRef.current += 1
    setNotifications([])
    setIsLoading(Boolean(userId))
    setRealtimeStatus(userId ? 'connecting' : 'disabled')
    setOrderSoundEnabled(false)
    setOrderSoundReady(false)
    setOrderSoundPreferenceLoaded(false)
    setOrderSoundError(null)

    if (userId) {
      try {
        setOrderSoundEnabled(window.localStorage.getItem(orderSoundPreferenceKey(userId)) === 'true')
      } catch (error) {
        console.error('[MerchantNotifications] Failed to load order sound preference', error)
        setOrderSoundError('Could not load the saved sound preference.')
      }
    }
    setOrderSoundPreferenceLoaded(true)

    return () => {
      const sound = soundRef.current
      soundRef.current = null
      if (sound) {
        void sound.close().catch((error) => console.error('[MerchantNotifications] Failed to close order sound', error))
      }
    }
  }, [userId])

  useEffect(() => { void fetchNotifications() }, [fetchNotifications])

  useEffect(() => {
    if (!userId) return
    const refresh = () => { void fetchNotifications() }
    const interval = window.setInterval(refresh, 30000)
    window.addEventListener('focus', refresh)
    return () => { window.clearInterval(interval); window.removeEventListener('focus', refresh) }
  }, [fetchNotifications, userId])

  useEffect(() => {
    if (!userId) {
      setRealtimeStatus('disabled')
      return
    }
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key) {
      setRealtimeStatus('disabled')
      console.error('[MerchantNotifications] Supabase Realtime is not configured; order alerts will use polling.')
      return
    }

    const supabase = createClient(url, key)
    const channel = supabase.channel(`notifications:user:${userId}`, { config: { broadcast: { self: true } } })
      .on('broadcast', { event: 'new_notification' }, (payload) => {
        const outer = record(payload)
        const nested = record(outer?.payload)
        const notification = mapBroadcastNotification(outer?.notification ?? nested?.notification)
        if (notification) {
          notificationVersionRef.current += 1
          setNotifications((items) => {
            if (items.some((item) => String(item.id) === String(notification.id))) return items
            return [notification, ...items].slice(0, 100)
          })
        }
        void fetchNotifications()
      })
      .on('broadcast', { event: 'notification_read' }, () => { void fetchNotifications() })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setRealtimeStatus('connected')
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          setRealtimeStatus('disconnected')
        } else {
          setRealtimeStatus('connecting')
        }
      })

    return () => {
      void supabase.removeChannel(channel).catch((error) => {
        console.error('[MerchantNotifications] Failed to close Supabase Realtime channel', error)
      })
    }
  }, [fetchNotifications, userId])

  const markAsRead = useCallback(async (id: number | string) => {
    const item = notifications.find((notification) => String(notification.id) === String(id))
    if (!item || item.status !== 'unread') return
    const readAt = new Date().toISOString()
    const seenAt = item.typeKey === 'order.created' && !item.seenAt ? readAt : undefined
    notificationVersionRef.current += 1
    try {
      const result = await updateMyNotification(id, { status: 'read', readAt, ...(seenAt ? { seenAt } : {}) })
      if (!result) throw new Error('Unable to mark notification as read')
      setNotifications((items) => items.map((notification) => String(notification.id) === String(id)
        ? { ...notification, status: 'read', readAt, ...(seenAt ? { seenAt } : {}) }
        : notification))
      if (seenAt && userId) announceNotificationsSeen(userId, [id], seenAt)
    } catch (error) {
      console.error('[MerchantNotifications] Failed to mark notification as read', error)
      await fetchNotifications()
    }
  }, [fetchNotifications, notifications, userId])

  const markAsUnread = useCallback(async (id: number | string) => {
    const item = notifications.find((notification) => String(notification.id) === String(id))
    if (!item || item.status === 'unread') return
    notificationVersionRef.current += 1
    try {
      const result = await updateMyNotification(id, { status: 'unread', readAt: null })
      if (!result) throw new Error('Unable to mark notification as unread')
      setNotifications((items) => items.map((notification) => String(notification.id) === String(id)
        ? { ...notification, status: 'unread', readAt: null }
        : notification))
    } catch (error) {
      console.error('[MerchantNotifications] Failed to mark notification as unread', error)
      await fetchNotifications()
    }
  }, [fetchNotifications, notifications])

  const markAsSeen = useCallback(async (id: number | string) => {
    const item = notifications.find((notification) => String(notification.id) === String(id))
    if (!item || item.seenAt) return
    const seenAt = new Date().toISOString()
    notificationVersionRef.current += 1
    setNotifications((items) => items.map((notification) => String(notification.id) === String(id)
      ? { ...notification, seenAt }
      : notification))
    try {
      const result = await updateMyNotification(id, { seenAt })
      if (!result) throw new Error('Unable to mark notification as seen')
      if (userId) announceNotificationsSeen(userId, [id], seenAt)
    } catch (error) {
      console.error('[MerchantNotifications] Failed to mark notification as seen', error)
      await fetchNotifications()
    }
  }, [fetchNotifications, notifications, userId])

  const markOrderAsSeen = useCallback(async (orderId: number | string) => {
    const targetId = String(orderId)
    const alertIds = notifications
      .filter((item) => {
        if (item.typeKey !== 'order.created' || item.seenAt) return false
        const metadataOrderId = item.metadata?.orderId
        const notificationOrderId = metadataOrderId ?? item.sourceEntityId
        return notificationOrderId !== null && notificationOrderId !== undefined
          && String(notificationOrderId) === targetId
      })
      .map((item) => item.id)
    await Promise.all(alertIds.map(markAsSeen))
  }, [markAsSeen, notifications])

  const markAllAsRead = useCallback(async () => {
    if (!unreadCount) return
    const readAt = new Date().toISOString()
    const seenAt = new Date().toISOString()
    const ids = notifications.filter((item) => !item.seenAt).map((item) => item.id)
    notificationVersionRef.current += 1
    try {
      const result = await markAllMyNotifications({ status: 'read', seenAt })
      if (!result) throw new Error('Unable to mark notifications as read')
      setNotifications((items) => items.map((item) => ({
        ...item,
        status: 'read',
        readAt: item.readAt || readAt,
        seenAt: item.seenAt || seenAt,
      })))
      if (userId) announceNotificationsSeen(userId, ids, seenAt)
    } catch (error) {
      console.error('[MerchantNotifications] Failed to mark all notifications as read', error)
      await fetchNotifications()
    }
  }, [fetchNotifications, notifications, unreadCount, userId])

  const markAllAsSeen = useCallback(async () => {
    if (!unseenCount) return
    const seenAt = new Date().toISOString()
    const ids = notifications.filter((item) => !item.seenAt).map((item) => item.id)
    notificationVersionRef.current += 1
    setNotifications((items) => items.map((item) => ({ ...item, seenAt: item.seenAt || seenAt })))
    try {
      const result = await markAllMyNotifications({ seenAt })
      if (!result) throw new Error('Unable to mark notifications as seen')
      if (userId) announceNotificationsSeen(userId, ids, seenAt)
    } catch (error) {
      console.error('[MerchantNotifications] Failed to mark notifications seen', error)
      await fetchNotifications()
    }
  }, [fetchNotifications, notifications, unseenCount, userId])

  const enableOrderSound = useCallback(async () => {
    setOrderSoundError(null)
    const sound = soundRef.current ?? new OrderAlertSound()
    soundRef.current = sound
    try {
      await sound.unlock()
      if (activeOrderAlertIds.length === 0 && !sound.playBell()) {
        throw new Error('Order sound playback is not available.')
      }
      setOrderSoundEnabled(true)
      setOrderSoundReady(true)
      if (userId) {
        try {
          window.localStorage.setItem(orderSoundPreferenceKey(userId), 'true')
        } catch (error) {
          console.error('[MerchantNotifications] Failed to save order sound preference', error)
          setOrderSoundError('Sound is enabled for this session, but the preference could not be saved.')
        }
      }
    } catch (error) {
      console.error('[MerchantNotifications] Failed to enable order sound', error)
      setOrderSoundReady(false)
      setOrderSoundError('Sound could not be enabled. Check your browser audio settings and try again.')
    }
  }, [activeOrderAlertIds.length, userId])

  const disableOrderSound = useCallback(() => {
    setOrderSoundEnabled(false)
    setOrderSoundReady(false)
    setOrderSoundError(null)
    if (userId) {
      try {
        window.localStorage.setItem(orderSoundPreferenceKey(userId), 'false')
      } catch (error) {
        console.error('[MerchantNotifications] Failed to save order sound preference', error)
        setOrderSoundError('Sound is disabled for this session, but the preference could not be saved.')
      }
    }
    const sound = soundRef.current
    soundRef.current = null
    if (sound) {
      void sound.close().catch((error) => console.error('[MerchantNotifications] Failed to close order sound', error))
    }
  }, [userId])

  useEffect(() => {
    if (!orderSoundEnabled || !orderSoundReady || activeOrderAlertIds.length === 0) return
    const sound = soundRef.current
    if (!sound) return

    const ring = () => {
      if (!sound.playBell()) {
        setOrderSoundReady(false)
        setOrderSoundError('Audio playback was interrupted. Click the sound control to reactivate it.')
      }
    }
    ring()
    const interval = window.setInterval(ring, 2800)
    return () => window.clearInterval(interval)
  }, [activeOrderAlertIds.length, orderSoundEnabled, orderSoundReady])

  useEffect(() => {
    if (!userId) return
    const preferenceKey = orderSoundPreferenceKey(userId)
    const seenKey = seenNotificationsKey(userId)
    const onStorage = (event: StorageEvent) => {
      if (event.key === preferenceKey) {
        setOrderSoundEnabled(event.newValue === 'true')
        if (event.newValue !== 'true') {
          setOrderSoundReady(false)
          const sound = soundRef.current
          soundRef.current = null
          if (sound) {
            void sound.close().catch((error) => console.error('[MerchantNotifications] Failed to close order sound', error))
          }
        }
      }
      if (event.key !== seenKey || !event.newValue) return
      try {
        const update = JSON.parse(event.newValue) as { ids?: unknown; seenAt?: unknown }
        if (!Array.isArray(update.ids) || typeof update.seenAt !== 'string') return
        const ids = new Set(update.ids.filter((id): id is string => typeof id === 'string'))
        if (!ids.size) return
        notificationVersionRef.current += 1
        setNotifications((items) => items.map((item) => ids.has(String(item.id)) ? { ...item, seenAt: update.seenAt as string } : item))
      } catch (error) {
        console.error('[MerchantNotifications] Failed to sync seen notifications across tabs', error)
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [userId])

  return (
    <NotificationsContext.Provider value={{
      notifications,
      unreadCount,
      unseenCount,
      isLoading,
      realtimeStatus,
      orderSoundEnabled,
      orderSoundReady,
      orderSoundPreferenceLoaded,
      orderSoundError,
      activeOrderAlertCount: activeOrderAlertIds.length,
      markAsRead,
      markAsUnread,
      markAsSeen,
      markOrderAsSeen,
      markAllAsRead,
      markAllAsSeen,
      enableOrderSound,
      disableOrderSound,
    }}>
      {children}
    </NotificationsContext.Provider>
  )
}

function announceNotificationsSeen(userId: number | string, ids: Array<number | string>, seenAt: string) {
  if (!ids.length) return
  try {
    window.localStorage.setItem(seenNotificationsKey(userId), JSON.stringify({
      ids: ids.map(String),
      seenAt,
      nonce: Date.now(),
    }))
  } catch (error) {
    console.error('[MerchantNotifications] Failed to sync seen notifications across tabs', error)
  }
}

export function useNotifications() { return useContext(NotificationsContext) }

export function getNotificationIcon(typeKey: string) {
  if (typeKey.startsWith('order.')) return 'fa-shopping-bag'
  if (typeKey.startsWith('payment.')) return 'fa-credit-card'
  if (typeKey.startsWith('delivery.')) return 'fa-truck'
  if (typeKey.startsWith('security.')) return 'fa-shield'
  return 'fa-bell'
}

export function getNotificationPath(notification: MerchantNotification) {
  if (notification.typeKey.startsWith('order.')) {
    const orderId = notification.metadata?.orderId ?? notification.sourceEntityId
    if (typeof orderId !== 'number' && typeof orderId !== 'string') return null
    return `/orders/${encodeURIComponent(String(orderId))}`
  }
  return null
}

export function getTimeAgo(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const minutes = Math.floor((Date.now() - date.getTime()) / 60000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`
  return date.toLocaleDateString()
}
