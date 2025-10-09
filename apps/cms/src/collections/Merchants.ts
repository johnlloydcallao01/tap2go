import type { CollectionConfig } from 'payload'
import { googleMapsService } from '../services/GoogleMapsService'

export const Merchants: CollectionConfig = {
  slug: 'merchants',
  admin: {
    useAsTitle: 'outletName',
    defaultColumns: ['outletName', 'vendor', 'isActive', 'isAcceptingOrders'],
    group: 'Food Delivery',
    description: 'Manage individual merchant locations and outlets',
  },
  access: {
    // PayloadCMS automatically authenticates API keys and populates req.user
    read: ({ req: { user } }) => {
      // If user exists, they've been authenticated (either via API key or login)
      if (user) {
        // Allow service accounts (for website display) and admins
        if (user.role === 'service' || user.role === 'admin') {
          return true
        }
      }
      
      // Block all unauthenticated requests and other roles
      return false
    },
    create: ({ req: { user } }) => {
      // Allow both service accounts and admins to create merchants
      return user?.role === 'service' || user?.role === 'admin' || false
    },
    update: ({ req: { user } }) => {
      // Allow both service accounts and admins to update merchants
      return user?.role === 'service' || user?.role === 'admin' || false
    },
    delete: ({ req: { user } }) => {
      // Allow both service accounts and admins to delete merchants
      return user?.role === 'service' || user?.role === 'admin' || false
    },
  },
  fields: [
    // === VENDOR RELATIONSHIP ===
    {
      name: 'vendor',
      type: 'relationship',
      relationTo: 'vendors',
      required: true,
      admin: {
        description: 'Parent vendor/business entity',
      },
    },

    // === LOCATION IDENTIFICATION ===
    {
      name: 'outletName',
      type: 'text',
      required: true,
      admin: {
        description: 'Specific outlet name (e.g., "Jollibee Manila", "McDonald\'s Quezon City")',
      },
    },
    {
      name: 'outletCode',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Internal reference code for the outlet (e.g., JB-MNL-001)',
      },
    },



    // === CONTACT INFORMATION ===
    {
      name: 'contactInfo',
      type: 'group',
      fields: [
        {
          name: 'phone',
          type: 'text',
          admin: {
            description: 'Outlet contact phone number',
          },
        },
        {
          name: 'email',
          type: 'email',
          admin: {
            description: 'Outlet contact email',
          },
        },
        {
          name: 'managerName',
          type: 'text',
          admin: {
            description: 'Store manager name',
          },
        },
        {
          name: 'managerPhone',
          type: 'text',
          admin: {
            description: 'Store manager contact number',
          },
        },
      ],
      admin: {
        description: 'Contact information for this specific outlet',
      },
    },

    // === OPERATIONAL STATUS ===
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Whether the merchant is currently active',
      },
    },
    {
      name: 'isAcceptingOrders',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Whether the merchant is currently accepting new orders',
      },
    },
    {
      name: 'operationalStatus',
      type: 'select',
      defaultValue: 'open',
      options: [
        { label: 'Open', value: 'open' },
        { label: 'Closed', value: 'closed' },
        { label: 'Busy', value: 'busy' },
        { label: 'Temporarily Closed', value: 'temp_closed' },
        { label: 'Maintenance', value: 'maintenance' },
      ],
      admin: {
        description: 'Current operational status',
      },
    },

    // === OPERATING HOURS ===
    {
      name: 'operatingHours',
      type: 'json',
      admin: {
        description: 'Weekly operating schedule (JSON format)',
      },
    },
    {
      name: 'specialHours',
      type: 'json',
      admin: {
        description: 'Special operating hours for holidays or events (JSON array of objects with date, openTime, closeTime, isClosed, reason)',
      },
    },

    // === DELIVERY SETTINGS ===
    {
      name: 'deliverySettings',
      type: 'group',
      fields: [
        {
          name: 'minimumOrderAmount',
          type: 'number',
          min: 0,
          defaultValue: 0,
          admin: {
            description: 'Minimum order amount (PHP)',
          },
        },
        {
          name: 'deliveryFee',
          type: 'number',
          min: 0,
          defaultValue: 0,
          admin: {
            description: 'Base delivery fee (PHP)',
          },
        },
        {
          name: 'freeDeliveryThreshold',
          type: 'number',
          min: 0,
          admin: {
            description: 'Order amount for free delivery (PHP)',
          },
        },
        {
          name: 'estimatedDeliveryTimeMinutes',
          type: 'number',
          min: 5,
          max: 120,
          defaultValue: 30,
          admin: {
            description: 'Estimated delivery time in minutes',
          },
        },
        {
          name: 'maxDeliveryTimeMinutes',
          type: 'number',
          min: 10,
          max: 180,
          defaultValue: 60,
          admin: {
            description: 'Maximum delivery time promise',
          },
        },
      ],
      admin: {
        description: 'Delivery policies and settings',
      },
    },



    // === MEDIA AND BRANDING ===
    {
      name: 'media',
      type: 'group',
      fields: [
        {
          name: 'thumbnail',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: 'Merchant thumbnail image (original size from Cloudinary)',
          },
        },
        {
          name: 'storeFrontImage',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: 'Store front photo',
          },
        },
        {
          name: 'interiorImages',
          type: 'json',
          admin: {
            description: 'Interior photos of the outlet (JSON array of media IDs)',
          },
        },
        {
          name: 'menuImages',
          type: 'json',
          admin: {
            description: 'Menu board or promotional images (JSON array of media IDs)',
          },
        },
      ],
      admin: {
        description: 'Visual content for the merchant',
      },
    },





    // === ADDITIONAL INFORMATION ===
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Outlet description and special features',
      },
    },
    {
      name: 'specialInstructions',
      type: 'textarea',
      admin: {
        description: 'Special delivery or pickup instructions',
      },
    },
    {
      name: 'tags',
      type: 'json',
      admin: {
        description: 'Tags for search and categorization (JSON array of strings)',
      },
    },
    {
      name: 'activeAddress',
      type: 'relationship',
      relationTo: 'addresses',
      filterOptions: async ({ relationTo: _relationTo, data, user: _user, req }) => {
        // If we have merchant data with a vendor relationship
        if (data?.vendor) {
          try {
            let vendorUserId;
            
            // If vendor is just an ID (string/number), we need to fetch the vendor to get the user
            if (typeof data.vendor === 'string' || typeof data.vendor === 'number') {
              const vendor = await req.payload.findByID({
                collection: 'vendors',
                id: data.vendor,
                depth: 1, // This will populate the user relationship
              });
              
              if (vendor?.user) {
                vendorUserId = typeof vendor.user === 'object' ? vendor.user.id : vendor.user;
              }
            } else if (data.vendor?.user) {
              // If vendor is populated, get the user ID
              vendorUserId = typeof data.vendor.user === 'object' ? data.vendor.user.id : data.vendor.user;
            }
            
            if (vendorUserId) {
              return {
                user: {
                  equals: vendorUserId,
                },
              };
            }
          } catch (error) {
            console.error('Error in activeAddress filterOptions:', error);
          }
        }
        
        // If no vendor data available or error occurred, return false to show no addresses
        return false;
      },
      admin: {
        description: 'Currently active address for this merchant outlet (business location) - only addresses owned by the vendor user',
      },
    },

    // === SYNCHRONIZED GEOSPATIAL FIELDS ===
    {
      name: 'merchant_coordinates',
      type: 'json',
      admin: {
        description: 'PostGIS GEOMETRY(POINT, 4326) synced from activeAddress - stored as GeoJSON',
        readOnly: true,
      },
    },
    {
      name: 'merchant_latitude',
      type: 'number',
      admin: {
        description: 'Latitude synced from activeAddress',
        readOnly: true,
        step: 0.00000001,
      },
    },
    {
      name: 'merchant_longitude',
      type: 'number',
      admin: {
        description: 'Longitude synced from activeAddress',
        readOnly: true,
        step: 0.00000001,
      },
    },
    {
      name: 'location_accuracy_radius',
      type: 'number',
      min: 0,
      admin: {
        description: 'Location accuracy radius in meters',
      },
    },

    // === DELIVERY CONFIGURATION ===
    {
      name: 'delivery_radius_meters',
      type: 'number',
      min: 0,
      defaultValue: 5000,
      admin: {
        description: 'Current delivery radius in meters',
      },
    },
    {
      name: 'max_delivery_radius_meters',
      type: 'number',
      min: 0,
      defaultValue: 10000,
      admin: {
        description: 'Maximum possible delivery radius in meters',
      },
    },
    {
      name: 'min_order_amount',
      type: 'number',
      min: 0,
      admin: {
        description: 'Minimum order amount for delivery (PHP)',
      },
    },
    {
      name: 'delivery_fee_base',
      type: 'number',
      min: 0,
      admin: {
        description: 'Base delivery fee (PHP)',
      },
    },
    {
      name: 'delivery_fee_per_km',
      type: 'number',
      min: 0,
      admin: {
        description: 'Per-kilometer delivery fee (PHP)',
      },
    },
    {
      name: 'free_delivery_threshold',
      type: 'number',
      min: 0,
      admin: {
        description: 'Order amount for free delivery (PHP)',
      },
    },

    // === SERVICE AREAS & ZONES ===
    {
      name: 'service_area',
      type: 'json',
      admin: {
        description: 'PostGIS POLYGON for delivery coverage area - stored as GeoJSON',
      },
    },
    {
      name: 'priority_zones',
      type: 'json',
      admin: {
        description: 'PostGIS MULTIPOLYGON for premium delivery areas - stored as GeoJSON',
      },
    },
    {
      name: 'restricted_areas',
      type: 'json',
      admin: {
        description: 'PostGIS MULTIPOLYGON for no-delivery zones - stored as GeoJSON',
      },
    },
    {
      name: 'delivery_zones',
      type: 'json',
      admin: {
        description: 'Zone-specific pricing configuration (JSONB format)',
      },
    },

    // === OPERATIONAL STATUS & PERFORMANCE ===
    {
      name: 'is_location_verified',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Location verified through GPS or delivery confirmation',
      },
    },
    {
      name: 'last_location_sync',
      type: 'date',
      admin: {
        description: 'Timestamp of last address synchronization',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'avg_delivery_time_minutes',
      type: 'number',
      min: 0,
      admin: {
        description: 'Average delivery time in minutes',
      },
    },
    {
      name: 'delivery_success_rate',
      type: 'number',
      min: 0,
      max: 1,
      admin: {
        description: 'Delivery success rate (0.0 to 1.0)',
        step: 0.0001,
      },
    },
    {
      name: 'peak_hours_multiplier',
      type: 'number',
      min: 1,
      defaultValue: 1,
      admin: {
        description: 'Surge pricing multiplier during peak hours',
        step: 0.1,
      },
    },

    // === BUSINESS HOURS & AVAILABILITY ===
    {
      name: 'delivery_hours',
      type: 'json',
      admin: {
        description: 'Delivery-specific operating hours (JSONB format)',
      },
    },
    {
      name: 'is_currently_delivering',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Real-time delivery availability status',
      },
    },
    {
      name: 'next_available_slot',
      type: 'date',
      admin: {
        description: 'Next available delivery time slot',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
  ],
  indexes: [
    {
      fields: ['vendor'],
    },
    {
      fields: ['outletCode'],
    },
    {
      fields: ['isActive', 'isAcceptingOrders'],
    },
    {
      fields: ['operationalStatus'],
    },
    // Enhanced geospatial indexes
    {
      fields: ['merchant_latitude', 'merchant_longitude'],
    },
    {
      fields: ['delivery_radius_meters'],
    },
    {
      fields: ['is_currently_delivering'],
    },
    {
      fields: ['is_location_verified'],
    },
    {
      fields: ['avg_delivery_time_minutes'],
    },
    {
      fields: ['delivery_success_rate'],
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        // Auto-generate outlet code if not provided
        if (!data.outletCode && data.outletName) {
          const name = data.outletName.replace(/[^a-zA-Z0-9]/g, '').substring(0, 6).toUpperCase()
          const timestamp = Date.now().toString().slice(-4)
          data.outletCode = `${name}-${timestamp}`
        }
        return data
      },
    ],
    afterChange: [
      async ({ doc, req, operation }) => {
        // Synchronize coordinates from activeAddress when merchant is created or updated
        if ((operation === 'create' || operation === 'update') && doc.activeAddress) {
          try {
            const addressDoc = await req.payload.findByID({
              collection: 'addresses',
              id: doc.activeAddress,
            })

            if (addressDoc && addressDoc.latitude && addressDoc.longitude) {
              // Update merchant coordinates to match address
              await req.payload.update({
                collection: 'merchants',
                id: doc.id,
                data: {
                  merchant_latitude: addressDoc.latitude,
                  merchant_longitude: addressDoc.longitude,
                  merchant_coordinates: {
                    type: 'Point',
                    coordinates: [addressDoc.longitude, addressDoc.latitude],
                  },
                  last_location_sync: new Date().toISOString(),
                  is_location_verified: addressDoc.is_verified || false,
                },
              })
              console.log(`Merchant ${doc.id} coordinates synced from address ${doc.activeAddress}`)
            } else {
              // Geocoding fallback: if address has a formatted address but no coordinates, geocode it
              if (addressDoc?.formatted_address) {
                try {
                  const geocodingResult = await googleMapsService.geocodeAddress(addressDoc.formatted_address)
                  if (geocodingResult && geocodingResult.latitude && geocodingResult.longitude) {
                    // Update address with geocoded fields
                    await req.payload.update({
                      collection: 'addresses',
                      id: addressDoc.id,
                      data: {
                        google_place_id: geocodingResult.google_place_id,
                        latitude: geocodingResult.latitude,
                        longitude: geocodingResult.longitude,
                        coordinates: {
                          type: 'Point',
                          coordinates: [geocodingResult.longitude, geocodingResult.latitude],
                        },
                        geocoding_accuracy: geocodingResult.geocoding_accuracy,
                        address_quality_score: geocodingResult.address_quality_score,
                        coordinate_source: 'GOOGLE_GEOCODING',
                        last_geocoded_at: new Date().toISOString(),
                        is_verified: true,
                      },
                    })
                    // Sync merchant after address update
                    await req.payload.update({
                      collection: 'merchants',
                      id: doc.id,
                      data: {
                        merchant_latitude: geocodingResult.latitude,
                        merchant_longitude: geocodingResult.longitude,
                        merchant_coordinates: {
                          type: 'Point',
                          coordinates: [geocodingResult.longitude, geocodingResult.latitude],
                        },
                        last_location_sync: new Date().toISOString(),
                        is_location_verified: true,
                      },
                    })
                    console.log(`Geocoded address ${doc.activeAddress} and synced merchant ${doc.id} coordinates`)
                  } else {
                    console.warn(`Failed to geocode activeAddress ${doc.activeAddress} for merchant ${doc.id}`)
                  }
                } catch (error) {
                  console.error('Error geocoding activeAddress in merchant afterChange:', error)
                }
              } else {
                console.warn(`Address ${doc.activeAddress} for merchant ${doc.id} has no coordinates`)
              }
            }
          } catch (error) {
            console.error('Error syncing merchant coordinates:', error)
          }
        }
      },
    ],
  },
}