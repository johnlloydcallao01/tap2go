import { GlobalConfig } from 'payload'

export const SystemSettings: GlobalConfig = {
  slug: 'system-settings',
  label: 'System Settings',
  access: {
    read: () => true,
    update: ({ req: { user } }) => {
      // Allow only admins to update
      return Boolean(user?.role === 'admin')
    },
  },
  fields: [
    {
      name: 'maintenanceMode',
      label: 'Maintenance Mode',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Toggle maintenance mode for the public website. When enabled, all non-admin users will be redirected to the maintenance page.',
      },
    },
  ],
}
