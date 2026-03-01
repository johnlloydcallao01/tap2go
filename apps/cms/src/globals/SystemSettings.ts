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
  hooks: {
    afterChange: [
      async ({ doc, req }) => {
        // We only want to trigger this if the maintenanceMode field has changed
        // But globals afterChange provides the full doc.
        // We can just always send the update to Vercel to be safe/simple.

        const maintenanceMode = doc.maintenanceMode
        const EDGE_CONFIG_ID = process.env.VERCEL_EDGE_CONFIG_ID
        const VERCEL_API_TOKEN = process.env.VERCEL_API_TOKEN

        if (!EDGE_CONFIG_ID || !VERCEL_API_TOKEN) {
          req.payload.logger.warn(
            'Missing VERCEL_EDGE_CONFIG_ID or VERCEL_API_TOKEN. Skipping Edge Config update.',
          )
          return
        }

        try {
          // Construct the URL.
          const url = `https://api.vercel.com/v1/edge-config/${EDGE_CONFIG_ID}/items`

          const response = await fetch(url, {
            method: 'PATCH',
            headers: {
              Authorization: `Bearer ${VERCEL_API_TOKEN}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              items: [
                {
                  operation: 'update',
                  key: 'isInMaintenanceMode',
                  value: maintenanceMode,
                },
              ],
            }),
          })

          if (!response.ok) {
            const errorBody = await response.text()
            req.payload.logger.error(
              `Failed to update Vercel Edge Config: ${response.status} ${response.statusText} - ${errorBody}`,
            )
          } else {
            req.payload.logger.info(
              `Successfully updated Vercel Edge Config maintenance mode to: ${maintenanceMode}`,
            )
          }
        } catch (error) {
          req.payload.logger.error(
            `Error updating Vercel Edge Config: ${error instanceof Error ? error.message : String(error)}`,
          )
        }
      },
    ],
  },
}
