import { NextApiRequest, NextApiResponse } from 'next';
import { setupOrdersDatabase } from '@/lib/database/setup-orders';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🚀 Adding orders to Firestore database...');
    
    await setupOrdersDatabase();
    
    console.log('🎉 Successfully added all orders data to Firestore!');
    
    res.status(200).json({
      success: true,
      message: 'Successfully added orders data to Firestore!',
      summary: {
        orders: 3,
        statuses: ['delivered', 'picked_up', 'preparing'],
        features: [
          'Order tracking',
          'Payment processing', 
          'Driver assignment',
          'Real-time updates',
          'Rating system'
        ]
      }
    });
    
  } catch (error) {
    console.error('❌ Error adding orders to Firestore:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
