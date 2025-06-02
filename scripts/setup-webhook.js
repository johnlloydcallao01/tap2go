/**
 * PayMongo Webhook Setup Script
 * Run this script to create webhooks for your PayMongo account
 * 
 * Usage: node scripts/setup-webhook.js
 */

const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

const PAYMONGO_BASE_URL = 'https://api.paymongo.com/v1';

// Get environment variables
const isTestMode = process.env.PAYMONGO_ENVIRONMENT === 'test';
const secretKey = isTestMode 
  ? process.env.PAYMONGO_SECRET_KEY_TEST 
  : process.env.PAYMONGO_SECRET_KEY_LIVE;
const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

if (!secretKey) {
  console.error('❌ PayMongo secret key not found in environment variables');
  console.error('Please set PAYMONGO_SECRET_KEY_TEST in your .env.local file');
  process.exit(1);
}

// Create authenticated axios instance
const paymongoClient = axios.create({
  baseURL: PAYMONGO_BASE_URL,
  headers: {
    'Authorization': `Basic ${Buffer.from(`${secretKey}:`).toString('base64')}`,
    'Content-Type': 'application/json',
  },
});

async function createWebhook() {
  try {
    console.log('🔧 Setting up PayMongo webhook...');
    console.log(`📍 Environment: ${isTestMode ? 'TEST' : 'LIVE'}`);
    console.log(`🌐 Webhook URL: ${appUrl}/api/webhooks/paymongo`);

    const webhookData = {
      data: {
        attributes: {
          url: `${appUrl}/api/webhooks/paymongo`,
          events: [
            'payment.paid',
            'payment.failed',
            'payment.refunded',
            'source.chargeable', // For e-wallet payments
          ],
        },
      },
    };

    const response = await paymongoClient.post('/webhooks', webhookData);
    const webhook = response.data.data;

    console.log('✅ Webhook created successfully!');
    console.log(`📋 Webhook ID: ${webhook.id}`);
    console.log(`🔗 Webhook URL: ${webhook.attributes.url}`);
    console.log(`📅 Created: ${new Date(webhook.attributes.created_at * 1000).toLocaleString()}`);
    console.log(`🎯 Events: ${webhook.attributes.events.join(', ')}`);
    console.log(`🔄 Status: ${webhook.attributes.status}`);

    // Save webhook secret to environment file reminder
    if (webhook.attributes.secret_key) {
      console.log('\n⚠️  IMPORTANT: Update your .env.local file with the webhook secret:');
      console.log(`PAYMONGO_WEBHOOK_SECRET=${webhook.attributes.secret_key}`);
    }

    return webhook;

  } catch (error) {
    console.error('❌ Failed to create webhook:', error.response?.data || error.message);
    
    if (error.response?.data?.errors) {
      error.response.data.errors.forEach(err => {
        console.error(`   - ${err.detail}`);
      });
    }
    
    process.exit(1);
  }
}

async function listExistingWebhooks() {
  try {
    console.log('\n📋 Checking existing webhooks...');
    
    const response = await paymongoClient.get('/webhooks');
    const webhooks = response.data.data;

    if (webhooks.length === 0) {
      console.log('📭 No existing webhooks found');
      return [];
    }

    console.log(`📦 Found ${webhooks.length} existing webhook(s):`);
    webhooks.forEach((webhook, index) => {
      console.log(`   ${index + 1}. ID: ${webhook.id}`);
      console.log(`      URL: ${webhook.attributes.url}`);
      console.log(`      Status: ${webhook.attributes.status}`);
      console.log(`      Events: ${webhook.attributes.events.join(', ')}`);
      console.log('');
    });

    return webhooks;

  } catch (error) {
    console.error('❌ Failed to list webhooks:', error.response?.data || error.message);
    return [];
  }
}

async function main() {
  console.log('🚀 PayMongo Webhook Setup for Tap2Go');
  console.log('=====================================\n');

  // List existing webhooks first
  const existingWebhooks = await listExistingWebhooks();
  
  // Check if webhook already exists for this URL
  const webhookUrl = `${appUrl}/api/webhooks/paymongo`;
  const existingWebhook = existingWebhooks.find(w => w.attributes.url === webhookUrl);
  
  if (existingWebhook) {
    console.log(`⚠️  Webhook already exists for URL: ${webhookUrl}`);
    console.log(`   Webhook ID: ${existingWebhook.id}`);
    console.log(`   Status: ${existingWebhook.attributes.status}`);
    
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    const answer = await new Promise(resolve => {
      readline.question('\nDo you want to create another webhook? (y/N): ', resolve);
    });
    
    readline.close();
    
    if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
      console.log('✅ Using existing webhook');
      return;
    }
  }

  // Create new webhook
  await createWebhook();
  
  console.log('\n🎉 Webhook setup completed!');
  console.log('\n📝 Next steps:');
  console.log('1. Update your .env.local file with the webhook secret (if provided)');
  console.log('2. Test the webhook by making a test payment');
  console.log('3. Check your server logs to verify webhook events are received');
  console.log('\n🧪 Test your integration at: http://localhost:3000/test-payment');
}

// Run the script
main().catch(console.error);
