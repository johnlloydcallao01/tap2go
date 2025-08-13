import type { CollectionConfig } from 'payload'

export const Restaurants: CollectionConfig = {
  slug: 'restaurants',
  admin: {
    useAsTitle: 'name',
    description: 'Manage restaurants and food vendors in the Tap2Go platform',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => !!user,
    delete: ({ req: { user } }) => !!user,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Restaurant Name',
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      label: 'URL Slug',
      admin: {
        description: 'Used for generating restaurant URLs',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
      admin: {
        description: 'Brief description of the restaurant',
      },
    },
    {
      name: 'cuisine',
      type: 'select',
      required: true,
      options: [
        { label: 'Asian', value: 'asian' },
        { label: 'Italian', value: 'italian' },
        { label: 'Mexican', value: 'mexican' },
        { label: 'American', value: 'american' },
        { label: 'Indian', value: 'indian' },
        { label: 'Chinese', value: 'chinese' },
        { label: 'Thai', value: 'thai' },
        { label: 'Japanese', value: 'japanese' },
        { label: 'Mediterranean', value: 'mediterranean' },
        { label: 'Fast Food', value: 'fast-food' },
        { label: 'Desserts', value: 'desserts' },
        { label: 'Other', value: 'other' },
      ],
      label: 'Cuisine Type',
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      label: 'Restaurant Logo',
    },
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Cover Image',
    },
    {
      name: 'address',
      type: 'group',
      label: 'Address',
      fields: [
        {
          name: 'street',
          type: 'text',
          required: true,
          label: 'Street Address',
        },
        {
          name: 'city',
          type: 'text',
          required: true,
          label: 'City',
        },
        {
          name: 'state',
          type: 'text',
          label: 'State/Province',
        },
        {
          name: 'zipCode',
          type: 'text',
          label: 'ZIP/Postal Code',
        },
        {
          name: 'country',
          type: 'text',
          required: true,
          label: 'Country',
          defaultValue: 'Malaysia',
        },
      ],
    },
    {
      name: 'location',
      type: 'group',
      label: 'GPS Coordinates',
      fields: [
        {
          name: 'latitude',
          type: 'number',
          required: true,
          label: 'Latitude',
          admin: {
            step: 0.000001,
          },
        },
        {
          name: 'longitude',
          type: 'number',
          required: true,
          label: 'Longitude',
          admin: {
            step: 0.000001,
          },
        },
      ],
    },
    {
      name: 'contact',
      type: 'group',
      label: 'Contact Information',
      fields: [
        {
          name: 'phone',
          type: 'text',
          label: 'Phone Number',
        },
        {
          name: 'email',
          type: 'email',
          label: 'Email Address',
        },
        {
          name: 'website',
          type: 'text',
          label: 'Website URL',
        },
      ],
    },
    {
      name: 'operatingHours',
      type: 'array',
      label: 'Operating Hours',
      fields: [
        {
          name: 'day',
          type: 'select',
          required: true,
          options: [
            { label: 'Monday', value: 'monday' },
            { label: 'Tuesday', value: 'tuesday' },
            { label: 'Wednesday', value: 'wednesday' },
            { label: 'Thursday', value: 'thursday' },
            { label: 'Friday', value: 'friday' },
            { label: 'Saturday', value: 'saturday' },
            { label: 'Sunday', value: 'sunday' },
          ],
        },
        {
          name: 'openTime',
          type: 'text',
          label: 'Opening Time',
          admin: {
            placeholder: 'e.g., 09:00',
          },
        },
        {
          name: 'closeTime',
          type: 'text',
          label: 'Closing Time',
          admin: {
            placeholder: 'e.g., 22:00',
          },
        },
        {
          name: 'isClosed',
          type: 'checkbox',
          label: 'Closed on this day',
          defaultValue: false,
        },
      ],
    },
    {
      name: 'deliveryInfo',
      type: 'group',
      label: 'Delivery Information',
      fields: [
        {
          name: 'deliveryFee',
          type: 'number',
          label: 'Delivery Fee (RM)',
          admin: {
            step: 0.01,
          },
        },
        {
          name: 'minimumOrder',
          type: 'number',
          label: 'Minimum Order Amount (RM)',
          admin: {
            step: 0.01,
          },
        },
        {
          name: 'estimatedDeliveryTime',
          type: 'text',
          label: 'Estimated Delivery Time',
          admin: {
            placeholder: 'e.g., 30-45 minutes',
          },
        },
        {
          name: 'deliveryRadius',
          type: 'number',
          label: 'Delivery Radius (km)',
          admin: {
            step: 0.1,
          },
        },
      ],
    },
    {
      name: 'rating',
      type: 'number',
      label: 'Average Rating',
      admin: {
        step: 0.1,
        description: 'Average customer rating (0-5)',
      },
      min: 0,
      max: 5,
    },
    {
      name: 'totalReviews',
      type: 'number',
      label: 'Total Reviews',
      defaultValue: 0,
    },
    {
      name: 'isActive',
      type: 'checkbox',
      label: 'Restaurant Active',
      defaultValue: true,
      admin: {
        description: 'Whether the restaurant is currently accepting orders',
      },
    },
    {
      name: 'isFeatured',
      type: 'checkbox',
      label: 'Featured Restaurant',
      defaultValue: false,
      admin: {
        description: 'Show this restaurant in featured sections',
      },
    },
    {
      name: 'tags',
      type: 'array',
      label: 'Tags',
      fields: [
        {
          name: 'tag',
          type: 'text',
          required: true,
        },
      ],
      admin: {
        description: 'Tags for filtering and search (e.g., "halal", "vegetarian", "spicy")',
      },
    },
  ],
  timestamps: true,
}
