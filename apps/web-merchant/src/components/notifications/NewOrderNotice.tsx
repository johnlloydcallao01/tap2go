'use client'

import { useRouter } from 'next/navigation'
import { getNotificationPath, useNotifications } from '@/contexts/NotificationsContext'

export function NewOrderNotice() {
  const router = useRouter()
  const notifications = useNotifications()
  const notice = notifications?.activeOrderNotice
  if (!notifications) return null

  if (!notice) {
    if (!notifications.activeOrderAlertCount && !notifications.orderSoundError) return null
    return (
      <div
        role="status"
        className="fixed right-4 top-4 z-[100] max-w-sm rounded-lg border border-amber-300 bg-white px-4 py-3 text-sm text-amber-900 shadow-xl dark:border-amber-800 dark:bg-[#171717] dark:text-amber-200"
      >
        {notifications.orderSoundError || 'A new order is waiting. Click or press a key to start its sound alert.'}
      </div>
    )
  }

  const orderPath = getNotificationPath(notice)
  const orderId = notice.metadata?.orderId ?? notice.sourceEntityId
  const closeNotice = () => {
    void notifications.dismissAllOrderNotices()
  }
  const viewOrder = () => {
    closeNotice()
    if (orderPath) router.push(orderPath)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4" role="presentation">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-order-notice-title"
        aria-describedby="new-order-notice-description"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-[#171717]"
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
          <i className="fa fa-shopping-bag text-xl" aria-hidden="true" />
        </div>
        <h2 id="new-order-notice-title" className="mt-4 text-center text-xl font-bold text-gray-900 dark:text-white">
          {notice.title || 'New order received'}
        </h2>
        <p id="new-order-notice-description" className="mt-2 text-center text-sm text-gray-600 dark:text-gray-300">
          {orderId !== null && orderId !== undefined ? `Order #${orderId} has been placed.` : notice.body}
        </p>
        {notifications.activeOrderAlertCount > 1 && (
          <p className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
            {notifications.activeOrderAlertCount} orders need your attention
          </p>
        )}
        {notifications.orderSoundError && (
          <p role="status" className="mt-3 text-center text-xs text-amber-700 dark:text-amber-300">
            {notifications.orderSoundError}
          </p>
        )}
        <div className="mt-6 flex justify-center gap-3">
          <button
            type="button"
            onClick={closeNotice}
            className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            Okay
          </button>
          {orderPath && (
            <button
              type="button"
              onClick={viewOrder}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              View order
            </button>
          )}
        </div>
      </section>
    </div>
  )
}
