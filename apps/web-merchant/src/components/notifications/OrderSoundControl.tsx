'use client'

import { useNotifications } from '@/contexts/NotificationsContext'

export function OrderSoundControl() {
  const notifications = useNotifications()
  if (!notifications) return null

  const isReady = notifications.orderSoundEnabled && notifications.orderSoundReady
  const label = isReady
    ? 'Disable order sound'
    : notifications.orderSoundEnabled
      ? 'Click to activate order sound for this session'
      : 'Enable order sound'
  const realtimeLabel = notifications.realtimeStatus === 'connected'
    ? 'real-time connected'
    : notifications.realtimeStatus === 'connecting'
      ? 'real-time connecting'
      : notifications.realtimeStatus === 'disabled'
        ? 'real-time unavailable'
        : 'real-time disconnected'

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          if (isReady) notifications.disableOrderSound()
          else void notifications.enableOrderSound()
        }}
        disabled={!notifications.orderSoundPreferenceLoaded}
        aria-label={`${label}; ${realtimeLabel}${notifications.activeOrderAlertCount ? `; ${notifications.activeOrderAlertCount} unacknowledged new order${notifications.activeOrderAlertCount === 1 ? '' : 's'}` : ''}`}
        aria-pressed={isReady}
        title={`${label} — ${realtimeLabel}`}
        className="relative flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-wait disabled:opacity-60 dark:border-[#262626] dark:bg-[#171717] dark:text-gray-200 dark:hover:bg-[#262626] sm:h-10 sm:w-10"
      >
        <i className={`fa ${isReady ? 'fa-volume-up' : 'fa-volume-off'} text-sm`} />
        <span
          aria-hidden="true"
          className={`absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white dark:border-[#171717] ${
            notifications.realtimeStatus === 'connected'
              ? 'bg-emerald-500'
              : notifications.realtimeStatus === 'connecting'
                ? 'bg-amber-400'
                : 'bg-red-500'
          }`}
        />
        {!!notifications.activeOrderAlertCount && (
          <span className="absolute -bottom-0.5 -left-0.5 h-2.5 w-2.5 animate-pulse rounded-full bg-red-500" aria-hidden="true" />
        )}
      </button>
      {notifications.orderSoundError && (
        <span role="status" className="absolute right-0 top-full z-[70] mt-2 w-56 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs text-red-700 shadow-lg dark:border-red-900 dark:bg-[#171717] dark:text-red-300">
          {notifications.orderSoundError}
        </span>
      )}
    </div>
  )
}
