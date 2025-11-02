import type { CollectionConfig } from 'payload'

export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'sku', 'productType', 'basePrice', 'isActive', 'createdByVendor', 'createdByMerchant'],
    group: 'Food Delivery',
    description: 'Master product catalog for vendors and merchants',
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
      // Allow both service accounts and admins to create products
      return user?.role === 'service' || user?.role === 'admin' || false
    },
    update: ({ req: { user } }) => {
      // Allow both service accounts and admins to update products
      return user?.role === 'service' || user?.role === 'admin' || false
    },
    delete: ({ req: { user } }) => {
      // Allow both service accounts and admins to delete products
      return user?.role === 'service' || user?.role === 'admin' || false
    },
  },
  fields: [
    // === OWNERSHIP TRACKING ===
    {
      name: 'createdByVendor',
      type: 'relationship',
      relationTo: 'vendors',
      admin: {
        description: 'Vendor that created this product (mutually exclusive with merchant)',
        condition: (data) => !data.createdByMerchant,
      },
    },
    {
      name: 'createdByMerchant',
      type: 'relationship',
      relationTo: 'merchants',
      admin: {
        description: 'Merchant that created this product (mutually exclusive with vendor)',
        condition: (data) => !data.createdByVendor,
      },
    },

    // === PRODUCT TYPE AND HIERARCHY ===
    {
      name: 'productType',
      type: 'select',
      required: true,
      defaultValue: 'simple',
      options: [
        {
          label: 'Simple Product',
          value: 'simple',
        },
        {
          label: 'Variable Product',
          value: 'variable',
        },
        {
          label: 'Grouped Product',
          value: 'grouped',
        },
      ],
      admin: {
        description: 'Type of product (simple, variable for variations, or grouped for bundles)',
      },
    },
    {
      name: 'parentProduct',
      type: 'relationship',
      relationTo: 'products',
      admin: {
        description: 'Parent product (for variations, points to the variable product)',
        condition: (data) => data.productType === 'simple' && data.parentProduct,
      },
    },

    // === BASIC INFORMATION ===
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'Product name',
      },
    },
    {
      name: 'description',
      type: 'richText',
      admin: {
        description: 'Full product description',
      },
    },
    {
      name: 'shortDescription',
      type: 'textarea',
      maxLength: 500,
      admin: {
        description: 'Brief product description (max 500 characters)',
      },
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'product-categories',
      admin: {
        description: 'Product category',
      },
    },

    // === SKU AND PRICING ===
    {
      name: 'sku',
      type: 'text',
      unique: true,
      admin: {
        description: 'Stock Keeping Unit (unique identifier)',
      },
    },
    {
      name: 'basePrice',
      type: 'number',
      required: true,
      min: 0,
      admin: {
        description: 'Base price of the product',
        step: 0.01,
      },
    },
    {
      name: 'compareAtPrice',
      type: 'number',
      min: 0,
      admin: {
        description: 'Original price for showing discounts',
        step: 0.01,
      },
    },

    // === MEDIA ===
    {
      name: 'media',
      type: 'group',
      fields: [
        {
          name: 'primaryImage',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: 'Primary product image',
          },
        },
        {
          name: 'images',
          type: 'array',
          fields: [
            {
              name: 'image',
              type: 'upload',
              relationTo: 'media',
              required: true,
            },
          ],
          admin: {
            description: 'Additional product images',
          },
        },
      ],
      admin: {
        description: 'Product images and media',
      },
    },

    // === STATUS ===
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Whether the product is currently active',
      },
    },


    {
      name: 'assign_to_all_vendor_merchants',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Assign this product to all merchants of the same vendor',
      },
    },

    // === METADATA ===
    {
      name: 'createdAt',
      type: 'date',
      admin: {
        readOnly: true,
        description: 'Creation timestamp',
        position: 'sidebar',
      },
    },
    {
      name: 'updatedAt',
      type: 'date',
      admin: {
        readOnly: true,
        description: 'Last update timestamp',
        position: 'sidebar',
      },
    },
  ],
  hooks: {
    beforeValidate: [
      ({ data, operation: _operation }) => {
        // beforeValidate only runs for create/update operations
        // Ensure exactly one owner is specified
        if (!data) {
          throw new Error('Data is required')
        }
        
        const hasVendor = !!data.createdByVendor
        const hasMerchant = !!data.createdByMerchant
        
        if (!hasVendor && !hasMerchant) {
          throw new Error('Product must be created by either a vendor or merchant')
        }
        
        if (hasVendor && hasMerchant) {
          throw new Error('Product cannot be created by both vendor and merchant')
        }
        
        return data
      },
    ],
    beforeChange: [
      async ({ data, req, operation: _operation }) => {
        console.log('🚀 PRODUCTS BEFORECHANGE HOOK TRIGGERED - Operation:', _operation);
        console.log('🚀 User role:', req.user?.role);
        console.log('🚀 assign_to_all_vendor_merchants:', data?.assign_to_all_vendor_merchants);
        
        // beforeChange only runs for create/update operations
        // Set timestamps
        if (!data) {
          throw new Error('Data is required')
        }
        
        const now = new Date()
        if (!data.createdAt) {
          data.createdAt = now
        }
        data.updatedAt = now
        
        // Set createdByVendor based on the user's role and vendor association
        if (req.user) {
          if (req.user.role === 'vendor') {
            // Only set createdByVendor if it's not already set (for create operations)
            // For update operations, preserve existing createdByVendor unless it's empty
            if (!data.createdByVendor || _operation === 'create') {
              try {
                const vendorResult = await req.payload.find({
                  collection: 'vendors',
                  where: {
                    user: { equals: req.user.id }
                  },
                  limit: 1,
                });

                if (vendorResult.docs.length > 0) {
                  data.createdByVendor = vendorResult.docs[0].id;
                  console.log('✅ Set createdByVendor to:', vendorResult.docs[0].id, vendorResult.docs[0].businessName);
                }
              } catch (error) {
                console.error('❌ Error finding vendor for user:', error);
              }
            } else {
              console.log('✅ Preserving existing createdByVendor:', data.createdByVendor);
            }
          } else if (req.user.role === 'admin' && data.createdByVendor) {
            // Admin can manually set the vendor
            data.createdByVendor = data.createdByVendor;
          }
        }

        // Handle merchant assignment when assign_to_all_vendor_merchants is checked
        if (data.assign_to_all_vendor_merchants && req.user?.role === 'vendor') {
          console.log('🔄 Processing merchant assignment for vendor user:', req.user.id);
          console.log('🔄 Checkbox is checked:', data.assign_to_all_vendor_merchants);
          console.log('🔄 CreatedByVendor:', data.createdByVendor);
          
          try {
            // Use the vendor we just found or find it again if needed
            let vendorId = data.createdByVendor;
            
            if (!vendorId) {
              // Find the vendor record associated with this user
              const vendorResult = await req.payload.find({
                collection: 'vendors',
                where: {
                  user: { equals: req.user.id }
                },
                limit: 1,
              });

              if (vendorResult.docs.length === 0) {
                console.error('❌ No vendor found for user:', req.user.id);
                data.assign_to_all_vendor_merchants = false;
                return data;
              }

              vendorId = vendorResult.docs[0].id;
              console.log('✅ Found vendor for assignment:', vendorId, vendorResult.docs[0].businessName);
            }
            
            // Find all active merchants for this vendor
            const merchants = await req.payload.find({
              collection: 'merchants',
              where: {
                vendor: { equals: vendorId },
                isActive: { equals: true }
              },
              limit: 1000, // Reasonable limit
            });

            console.log(`📋 Found ${merchants.docs.length} active merchants for vendor ${vendorId}`);
            
            if (merchants.docs.length === 0) {
              console.log('ℹ️ No active merchants found for this vendor');
              data.assign_to_all_vendor_merchants = false;
              return data;
            }
            
            // Store merchant IDs in req.context for afterChange hook
            if (!req.context) req.context = {};
            req.context.merchantAssignmentData = merchants.docs.map(merchant => ({
              id: merchant.id,
              name: merchant.outletName || 'Unknown Merchant'
            }));
            
            // Reset the checkbox to prevent re-processing
            data.assign_to_all_vendor_merchants = false;
            console.log('✅ Prepared merchant assignment data and reset checkbox');
            console.log('✅ Merchant data prepared:', req.context.merchantAssignmentData);
            
          } catch (error) {
            console.error('❌ Error in merchant assignment preparation:', error);
            data.assign_to_all_vendor_merchants = false;
          }
        }
        
        return data
      },
    ],
    afterChange: [
      async ({ doc, previousDoc: _previousDoc, operation, req }) => {
        console.log(`🔄 AfterChange hook triggered for operation: ${operation}, product: ${doc.id}`);
        console.log(`🔄 Doc has _merchantAssignmentData:`, !!doc._merchantAssignmentData);
        
        // afterChange runs for create/update/delete operations
        // Use type assertion since PayloadCMS types don't include 'delete' in CreateOrUpdateOperation
        if ((operation as string) === 'delete') {
          return;
        }

        // Ensure we have valid doc and req objects
        if (!doc || !req || !req.payload) {
          console.warn('⚠️ Invalid doc or req object in afterChange hook');
          return;
        }

        // Process merchant assignments if data was prepared in beforeChange
        if (req.context?.merchantAssignmentData && Array.isArray(req.context.merchantAssignmentData)) {
          console.log(`🔄 Processing ${req.context.merchantAssignmentData.length} merchant assignments for product ${doc.id}`);
          console.log(`🔄 Merchant assignment data:`, req.context.merchantAssignmentData);
          
          try {
            let assignedCount = 0;
            let skippedCount = 0;
            
            // Process assignments sequentially to avoid database locks
            for (const merchantData of req.context.merchantAssignmentData) {
              console.log(`🔄 Processing merchant: ${merchantData.name} (${merchantData.id})`);
              
              try {
                // Check if assignment already exists
                const existingAssignment = await req.payload.find({
                  collection: 'merchant-products',
                  where: {
                    and: [
                      { merchant_id: { equals: merchantData.id } },
                      { product_id: { equals: doc.id } }
                    ]
                  },
                  limit: 1,
                });

                if (existingAssignment.docs.length > 0) {
                  console.log(`⏭️ Assignment already exists for merchant ${merchantData.name} (${merchantData.id})`);
                  skippedCount++;
                  continue;
                }

                // Create new assignment
                console.log(`🔄 Creating assignment for merchant ${merchantData.name} (${merchantData.id})`);
                await req.payload.create({
                  collection: 'merchant-products',
                  data: {
                    merchant_id: merchantData.id,
                    product_id: doc.id,
                  },
                });

                console.log(`✅ Created assignment for merchant: ${merchantData.name} (${merchantData.id})`);
                assignedCount++;
              } catch (merchantError) {
                console.error(`❌ Error creating assignment for merchant ${merchantData.name}:`, merchantError);
              }
            }

            console.log(`✅ Merchant assignment completed: ${assignedCount} created, ${skippedCount} skipped`);
          } catch (error) {
            console.error('❌ Error processing merchant assignments:', error);
          }
        } else {
          console.log('ℹ️ No merchant assignment data found in afterChange hook');
        }

        // Note: VendorProducts table has been removed in favor of simplified architecture
        // Products now directly belong to vendors via createdByVendor field
        // MerchantProducts handles the merchant-product relationships
        console.log(`✅ Product ${operation} completed for product ${doc.id}`);
      },
    ],
  },
}