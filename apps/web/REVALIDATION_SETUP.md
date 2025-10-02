# Product Categories Revalidation Setup

This document explains how to solve the issue where product category changes require a full rebuild to be reflected on the website.

## Problem
Previously, when product categories were updated in the CMS, the changes wouldn't appear on the website until a new build was deployed. This was due to Next.js ISR (Incremental Static Regeneration) caching the data for 5 minutes.

## Solution
We've implemented **On-Demand Revalidation** using Next.js 13+ features that allow cache invalidation without rebuilding the entire application.

## Implementation

### 1. Manual Revalidation API (`/api/revalidate`)

**Usage:**
```bash
# Revalidate home page
curl -X POST http://localhost:3000/api/revalidate \
  -H "Content-Type: application/json" \
  -d '{"path": "/"}'

# Revalidate specific cache tag
curl -X POST http://localhost:3000/api/revalidate \
  -H "Content-Type: application/json" \
  -d '{"tag": "product-categories"}'

# GET method for quick testing
curl "http://localhost:3000/api/revalidate?path=/"
```

### 2. CMS Webhook (`/api/webhook/cms`)

This endpoint automatically revalidates when the CMS sends webhook notifications.

**Webhook URL:** `https://yourdomain.com/api/webhook/cms`

**Supported Collections:**
- `product-categories` - Revalidates categories cache and home page
- `courses` - Revalidates courses cache and home page  
- `merchants`, `posts`, `media` - Revalidates home page

### 3. Environment Variables (Optional)

Add these to your `.env.local` for enhanced security:

```env
# Optional: Secret for manual revalidation API
REVALIDATION_SECRET=your-secret-key

# Optional: Secret for CMS webhook verification
CMS_WEBHOOK_SECRET=your-webhook-secret
```

## CMS Configuration

### PayloadCMS Hook Setup

Add this to your PayloadCMS collection configuration:

```javascript
// In your product-categories collection config
export const ProductCategories = {
  // ... other config
  hooks: {
    afterChange: [
      async ({ doc, operation }) => {
        // Trigger revalidation webhook
        try {
          await fetch('https://yourdomain.com/api/webhook/cms', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-webhook-secret': process.env.CMS_WEBHOOK_SECRET
            },
            body: JSON.stringify({
              collection: 'product-categories',
              operation,
              doc
            })
          });
        } catch (error) {
          console.error('Webhook failed:', error);
        }
      }
    ]
  }
};
```

## How It Works

1. **Cache Tags**: Product categories are fetched with a `product-categories` cache tag
2. **Targeted Revalidation**: Only the specific cache is invalidated, not the entire application
3. **Automatic Updates**: When categories change in CMS, webhook triggers revalidation
4. **Immediate Refresh**: Next page refresh will show updated data without rebuild

## Testing

1. **Update a product category** in your CMS
2. **Refresh the home page** - changes should appear immediately
3. **No rebuild required** - the cache is invalidated on-demand

## Benefits

- ✅ **No more rebuilds** required for content changes
- ✅ **Immediate updates** on page refresh
- ✅ **Maintains ISR performance** benefits
- ✅ **Selective cache invalidation** - only affected data is refreshed
- ✅ **Automatic via webhooks** - no manual intervention needed

## Troubleshooting

### Changes not appearing?
1. Check if webhook is configured correctly in CMS
2. Verify webhook secret matches environment variable
3. Manually trigger revalidation: `curl -X POST /api/revalidate -d '{"path":"/"}'`
4. Check server logs for webhook/revalidation errors

### Still requiring rebuilds?
1. Ensure cache tags are properly set in the fetch request
2. Verify the revalidation API is being called successfully
3. Check that `revalidatePath('/')` and `revalidateTag('product-categories')` are both called