#!/usr/bin/env node

/**
 * Cloudinary Setup Script for Tap2Go Media Library
 * Creates upload presets and configures webhooks for the admin panel
 * 
 * Usage: node scripts/setup-cloudinary.js
 */

const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

// Get environment variables
const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;
const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

if (!cloudName || !apiKey || !apiSecret) {
  console.error('❌ Missing Cloudinary environment variables');
  console.error('Please ensure NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET are set in .env.local');
  process.exit(1);
}

// Create authenticated axios instance
const cloudinaryClient = axios.create({
  baseURL: `https://api.cloudinary.com/v1_1/${cloudName}`,
  auth: {
    username: apiKey,
    password: apiSecret,
  },
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Create upload preset
 */
async function createUploadPreset(presetData) {
  try {
    console.log(`🔧 Creating upload preset: ${presetData.name}`);
    
    const response = await cloudinaryClient.post('/upload_presets', presetData);
    
    console.log(`✅ Upload preset created: ${response.data.name}`);
    return response.data;
    
  } catch (error) {
    if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
      console.log(`⚠️  Upload preset already exists: ${presetData.name}`);
      return null;
    }
    
    console.error(`❌ Failed to create upload preset ${presetData.name}:`, error.response?.data || error.message);
    throw error;
  }
}

/**
 * Create webhook
 */
async function createWebhook(webhookData) {
  try {
    console.log(`🔧 Creating webhook: ${webhookData.notification_url}`);
    
    const response = await cloudinaryClient.post('/webhooks', webhookData);
    
    console.log(`✅ Webhook created: ${response.data.notification_url}`);
    return response.data;
    
  } catch (error) {
    if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
      console.log(`⚠️  Webhook already exists: ${webhookData.notification_url}`);
      return null;
    }
    
    console.error(`❌ Failed to create webhook:`, error.response?.data || error.message);
    throw error;
  }
}

/**
 * List existing upload presets
 */
async function listUploadPresets() {
  try {
    const response = await cloudinaryClient.get('/upload_presets');
    return response.data.presets || [];
  } catch (error) {
    console.error('❌ Failed to list upload presets:', error.response?.data || error.message);
    return [];
  }
}

/**
 * List existing webhooks
 */
async function listWebhooks() {
  try {
    const response = await cloudinaryClient.get('/webhooks');
    return response.data.webhooks || [];
  } catch (error) {
    console.error('❌ Failed to list webhooks:', error.response?.data || error.message);
    return [];
  }
}

async function main() {
  console.log('🚀 Cloudinary Setup for Tap2Go Media Library');
  console.log('=============================================\n');

  try {
    // List existing presets and webhooks
    console.log('📋 Checking existing configuration...');
    const existingPresets = await listUploadPresets();
    const existingWebhooks = await listWebhooks();
    
    console.log(`Found ${existingPresets.length} existing upload presets`);
    console.log(`Found ${existingWebhooks.length} existing webhooks\n`);

    // Define upload presets for the admin panel
    const uploadPresets = [
      {
        name: 'tap2go-uploads',
        unsigned: true, // For admin panel uploads
        settings: {
          folder: 'main-uploads',
          resource_type: 'auto',
          allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'mp4', 'mov', 'avi', 'webm', 'pdf', 'doc', 'docx'],
          max_file_size: 10485760, // 10MB
          quality: 'auto',
          format: 'auto',
          unique_filename: true,
          use_filename: true,
          filename_override: false,
          tags: ['admin-upload', 'media-library'],
          context: {
            source: 'admin-panel',
            uploaded_by: 'admin'
          },
          auto_tagging: 0.7, // Auto-tag with 70% confidence
          categorization: 'google_tagging',
          detection: 'adv_face',
          background_removal: false,
          overwrite: false,
          invalidate: true,
          notification_url: `${appUrl}/api/webhooks/cloudinary`,
        }
      }
    ];

    // Create upload presets
    console.log('📤 Creating upload presets...');
    for (const preset of uploadPresets) {
      await createUploadPreset(preset);
    }

    // Create webhook for upload notifications
    console.log('\n🔔 Setting up webhooks...');
    const webhookUrl = `${appUrl}/api/webhooks/cloudinary`;
    
    // Check if webhook already exists
    const existingWebhook = existingWebhooks.find(w => w.notification_url === webhookUrl);
    
    if (!existingWebhook) {
      await createWebhook({
        notification_url: webhookUrl,
        events: ['upload', 'delete', 'update'],
        settings: {
          resource_type: 'auto',
          notification_type: 'webhook',
        }
      });
    } else {
      console.log(`⚠️  Webhook already exists: ${webhookUrl}`);
    }

    console.log('\n✅ Cloudinary setup completed successfully!');
    console.log('\n📋 Configuration Summary:');
    console.log(`   Cloud Name: ${cloudName}`);
    console.log(`   Upload Presets: ${uploadPresets.map(p => p.name).join(', ')}`);
    console.log(`   Webhook URL: ${webhookUrl}`);
    console.log('\n🔧 Next Steps:');
    console.log('   1. Ensure your webhook endpoint is accessible');
    console.log('   2. Test file uploads in the admin panel');
    console.log('   3. Check webhook logs for successful notifications');
    
    if (appUrl.includes('localhost')) {
      console.log('\n⚠️  Note: Webhooks to localhost may not work in production.');
      console.log('   Consider using ngrok for local development:');
      console.log('   npx ngrok http 3000');
    }

  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    process.exit(1);
  }
}

// Run the setup
main().catch(console.error);
