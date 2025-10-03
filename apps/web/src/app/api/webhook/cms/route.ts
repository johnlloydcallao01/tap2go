import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

/**
 * CMS Webhook endpoint for automatic cache revalidation
 * This endpoint should be configured in your CMS to trigger when:
 * - Product categories are created, updated, or deleted
 * - Any content that affects the home page is modified
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { collection, operation, doc } = body;

    // Optional: Verify webhook signature/secret for security
    const webhookSecret = request.headers.get('x-webhook-secret');
    if (process.env.CMS_WEBHOOK_SECRET && webhookSecret !== process.env.CMS_WEBHOOK_SECRET) {
      console.error('Invalid webhook secret');
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    console.log(`CMS Webhook received: ${collection} ${operation}`, { docId: doc?.id });

    // Handle product category changes
    if (collection === 'product-categories') {
      // Revalidate the product categories cache tag
      revalidateTag('product-categories');
      
      // Also revalidate the home page since it displays categories
      revalidatePath('/');
      
      console.log('Revalidated product categories and home page');
      
      return NextResponse.json({ 
        revalidated: true, 
        collection,
        operation,
        timestamp: new Date().toISOString()
      });
    }



    // Handle other collections that might affect the home page
    if (['merchants', 'posts', 'media'].includes(collection)) {
      // Revalidate home page for these collections
      revalidatePath('/');
      
      console.log(`Revalidated home page for ${collection} change`);
      
      return NextResponse.json({ 
        revalidated: true, 
        collection,
        operation,
        timestamp: new Date().toISOString()
      });
    }

    // For unknown collections, just acknowledge the webhook
    console.log(`Webhook received for ${collection} but no revalidation needed`);
    
    return NextResponse.json({ 
      received: true, 
      collection,
      operation,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('CMS Webhook error:', error);
    return NextResponse.json(
      { 
        message: 'Webhook processing failed', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }, 
      { status: 500 }
    );
  }
}

/**
 * GET endpoint for webhook health check
 */
export async function GET() {
  return NextResponse.json({ 
    status: 'ok', 
    endpoint: 'CMS Webhook',
    timestamp: new Date().toISOString()
  });
}