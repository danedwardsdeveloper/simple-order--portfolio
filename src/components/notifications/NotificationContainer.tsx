'use client'

import clsx from 'clsx'

import NotificationItem from './NotificationItem'
import { useNotifications } from '@/providers/notifications'

export default function NotificationsContainer() {
  const { notifications, removeNotification } = useNotifications()

  return (
    <div
      data-component="NotificationsContainer"
      aria-live="assertive"
      className={clsx(
        'pointer-events-none fixed inset-0 flex items-end px-4 py-6 sm:items-start sm:p-6',
        'mt-menubar-offset z-notification-container',
      )}>
      <div className="flex w-full flex-col items-center space-y-4 sm:items-end">
        {notifications &&
          notifications.map(notification => (
            <NotificationItem key={notification.id} notification={notification} onClose={removeNotification} />
          ))}
      </div>
    </div>
  )
}
