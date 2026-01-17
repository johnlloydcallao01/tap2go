import type { CollectionConfig } from 'payload'

export const UserNotifications: CollectionConfig = {
  slug: 'user-notifications',
  admin: {
    useAsTitle: 'notificationEvent',
    defaultColumns: ['user', 'notificationEvent', 'status', 'channel'],
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'notificationEvent',
      type: 'relationship',
      relationTo: 'notification-events',
      required: true,
    },
    {
      name: 'channel',
      type: 'select',
      required: true,
      defaultValue: 'in_app',
      options: [
        {
          label: 'In App',
          value: 'in_app',
        },
        {
          label: 'Email',
          value: 'email',
        },
        {
          label: 'Push',
          value: 'push',
        },
        {
          label: 'SMS',
          value: 'sms',
        },
      ],
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'unread',
      options: [
        {
          label: 'Unread',
          value: 'unread',
        },
        {
          label: 'Read',
          value: 'read',
        },
        {
          label: 'Dismissed',
          value: 'dismissed',
        },
        {
          label: 'Hidden',
          value: 'hidden',
        },
      ],
    },
    {
      name: 'deliveredAt',
      type: 'date',
    },
    {
      name: 'readAt',
      type: 'date',
    },
    {
      name: 'archivedAt',
      type: 'date',
    },
    {
      name: 'isPinned',
      type: 'checkbox',
      defaultValue: false,
    },
  ],
}

