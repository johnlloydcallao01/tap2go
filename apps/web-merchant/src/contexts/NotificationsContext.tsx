'use client'

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import {
  acknowledgeMyOrderNotifications,
  getMyNotifications,
  markAllMyNotifications,
  updateMyNotification,
  type MerchantNotification,
} from '@/app/actions/notifications'
import {
  ORDER_ALERT_SOUND_ERROR_EVENT,
  ORDER_ALERT_SOUND_READY_EVENT,
  orderAlertSound,
} from '@/utils/orderAlertSound'

type RealtimeStatus = 'disabled' | 'connecting' | 'connected' | 'disconnected'

interface NotificationsContextValue {
  notifications: MerchantNotification[]
  unreadCount: number
  unseenCount: number
  isLoading: boolean
  realtimeStatus: RealtimeStatus
  activeOrderNotice: MerchantNotification | null
  orderSoundError: string | null
  activeOrderAlertCount: number
  markAsRead: (id: number | string) => Promise<void>
  markAsUnread: (id: number | string) => Promise<void>
  markAsSeen: (id: number | string) => Promise<void>
  markAllAsRead: () => Promise<void>
  markAllAsSeen: () => Promise<void>
  dismissAllOrderNotices: () => Promise<void>
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

function seenNotificationsKey(userId: number | string) {
  return `tap2go:merchant:notifications-seen:${userId}`
}

export function NotificationsProvider({ children, userId }: { children: React.ReactNode; userId?: number | string }) {
  const [notifications, setNotifications] = useState<MerchantNotification[]>([])
  const [orderNoticeQueue, setOrderNoticeQueue] = useState<MerchantNotification[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [realtimeStatus, setRealtimeStatus] = useState<RealtimeStatus>('disabled')
  const [orderSoundReady, setOrderSoundReady] = useState(orderAlertSound.isReady)
  const [orderSounding, setOrderSounding] = useState(false)
  const [orderSoundError, setOrderSoundError] = useState<string | null>(null)
  const notificationRequestRef = useRef(0)
  const notificationVersionRef = useRef(0)
  const orderNoticeIdsRef = useRef(new Set<string>())

  const unreadCount = useMemo(
    () => notifications.filter((notification) => notification.status === 'unread').length,
    [notifications],
  )
  const unseenCount = useMemo(
    () => notifications.filter((notification) => !notification.seenAt).length,
    [notifications],
  )
  const enqueueOrderNotices = useCallback((items: MerchantNotification[]) => {
    const newNotices = items.filter((notification) => {
      if (notification.typeKey !== 'order.created' || notification.seenAt || notification.archivedAt) return false
      const id = String(notification.id)
      if (orderNoticeIdsRef.current.has(id)) return false
      orderNoticeIdsRef.current.add(id)
      return true
    })
    if (newNotices.length) setOrderNoticeQueue((queue) => [...queue, ...newNotices])
  }, [])

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
      enqueueOrderNotices(result.docs)
    } catch (error) {
      console.error('[MerchantNotifications] Failed to fetch notifications', error)
    } finally {
      if (requestId === notificationRequestRef.current) setIsLoading(false)
    }
  }, [enqueueOrderNotices, userId])

  useEffect(() => {
    notificationVersionRef.current += 1
    notificationRequestRef.current += 1
    setNotifications([])
    setOrderNoticeQueue([])
    orderNoticeIdsRef.current = new Set()
    setIsLoading(Boolean(userId))
    setRealtimeStatus(userId ? 'connecting' : 'disabled')
    setOrderSoundReady(orderAlertSound.isReady)
    setOrderSounding(false)
    setOrderSoundError(null)
  }, [userId])

  useEffect(() => {
    const onSoundReady = () => {
      setOrderSoundReady(orderAlertSound.isReady)
      setOrderSoundError(null)
    }
    const onSoundError = () => {
      setOrderSoundReady(false)
      setOrderSounding(false)
      orderAlertSound.stop()
      setOrderSoundError('Order alert audio could not start. Click or press a key to retry.')
    }
    window.addEventListener(ORDER_ALERT_SOUND_READY_EVENT, onSoundReady)
    window.addEventListener(ORDER_ALERT_SOUND_ERROR_EVENT, onSoundError)
    return () => {
      window.removeEventListener(ORDER_ALERT_SOUND_READY_EVENT, onSoundReady)
      window.removeEventListener(ORDER_ALERT_SOUND_ERROR_EVENT, onSoundError)
    }
  }, [])

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
          enqueueOrderNotices([notification])
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
  }, [enqueueOrderNotices, fetchNotifications, userId])

  const markAsRead = useCallback(async (id: number | string) => {
    const item = notifications.find((notification) => String(notification.id) === String(id))
    if (!item || item.status !== 'unread') return
    const readAt = new Date().toISOString()
    notificationVersionRef.current += 1
    try {
      const result = await updateMyNotification(id, { status: 'read', readAt })
      if (!result) throw new Error('Unable to mark notification as read')
      setNotifications((items) => items.map((notification) => String(notification.id) === String(id)
        ? { ...notification, status: 'read', readAt }
        : notification))
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

  const dismissAllOrderNotices = useCallback(async () => {
    if (!orderNoticeQueue.length) return

    const seenAt = new Date().toISOString()
    const ids = new Set([
      ...orderNoticeQueue.map((item) => String(item.id)),
      ...notifications
        .filter((item) => item.typeKey === 'order.created' && !item.seenAt)
        .map((item) => String(item.id)),
    ])
    setOrderNoticeQueue([])
    setOrderSounding(false)
    orderAlertSound.stop()
    notificationVersionRef.current += 1
    setNotifications((items) => items.map((item) => item.typeKey === 'order.created' && !item.seenAt
      ? { ...item, seenAt }
      : item))
    if (userId) announceNotificationsSeen(userId, [...ids], seenAt)

    try {
      const result = await acknowledgeMyOrderNotifications(seenAt)
      if (!result) throw new Error('Unable to acknowledge new order notifications')
      setOrderSoundError(null)
    } catch (error) {
      console.error('[MerchantNotifications] Failed to acknowledge all new order notifications', error)
      setOrderSoundError('The alert was closed, but its dismissal could not be saved.')
    }
  }, [notifications, orderNoticeQueue, userId])

  const markAllAsRead = useCallback(async () => {
    if (!unreadCount) return
    const readAt = new Date().toISOString()
    notificationVersionRef.current += 1
    try {
      const result = await markAllMyNotifications({ status: 'read' })
      if (!result) throw new Error('Unable to mark notifications as read')
      setNotifications((items) => items.map((item) => ({
        ...item,
        status: 'read',
        readAt: item.readAt || readAt,
      })))
    } catch (error) {
      console.error('[MerchantNotifications] Failed to mark all notifications as read', error)
      await fetchNotifications()
    }
  }, [fetchNotifications, notifications, unreadCount, userId])

  const markAllAsSeen = useCallback(async () => {
    const ids = notifications
      .filter((item) => !item.seenAt && item.typeKey !== 'order.created')
      .map((item) => item.id)
    await Promise.all(ids.map(markAsSeen))
  }, [markAsSeen, notifications])

  useEffect(() => {
    if (!orderSoundReady || orderNoticeQueue.length === 0) {
      if (orderNoticeQueue.length === 0) {
        orderAlertSound.stop()
        setOrderSounding(false)
      }
      return
    }

    const ring = () => {
      if (!orderAlertSound.playBell()) {
        orderAlertSound.stop()
        setOrderSoundReady(false)
        setOrderSounding(false)
        setOrderSoundError('Order alert audio stopped. Click or press a key to resume it.')
        return
      }
      setOrderSounding(true)
    }
    ring()
    const interval = window.setInterval(ring, 2800)
    return () => window.clearInterval(interval)
  }, [orderNoticeQueue.length, orderSoundReady])

  useEffect(() => {
    if (!userId) return
    const seenKey = seenNotificationsKey(userId)
    const onStorage = (event: StorageEvent) => {
      if (event.key !== seenKey || !event.newValue) return
      try {
        const update = JSON.parse(event.newValue) as { ids?: unknown; seenAt?: unknown }
        if (!Array.isArray(update.ids) || typeof update.seenAt !== 'string') return
        const ids = new Set(update.ids.filter((id): id is string => typeof id === 'string'))
        if (!ids.size) return
        notificationVersionRef.current += 1
        setNotifications((items) => items.map((item) => ids.has(String(item.id)) ? { ...item, seenAt: update.seenAt as string } : item))
        setOrderNoticeQueue((items) => items.filter((item) => !ids.has(String(item.id))))
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
      activeOrderNotice: orderSounding ? orderNoticeQueue[0] ?? null : null,
      orderSoundError,
      activeOrderAlertCount: orderNoticeQueue.length,
      markAsRead,
      markAsUnread,
      markAsSeen,
      markAllAsRead,
      markAllAsSeen,
      dismissAllOrderNotices,
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
