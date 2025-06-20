/**
 * Resend Email Service Setup Script
 * Validates configuration and tests email functionality
 */

const { validateEmailConfig, testEmailConfig } = require('../src/lib/email/resend');

async function setupResendEmail() {
  console.log('🚀 Setting up Resend Email Service for Tap2Go...\n');

  // Step 1: Validate environment variables
  console.log('📋 Step 1: Validating environment configuration...');
  
  const requiredEnvVars = [
    'RESEND_API_KEY',
    'NEXT_PUBLIC_RESEND_FROM_EMAIL',
    'EMAIL_FROM_NAME',
    'EMAIL_REPLY_TO'
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:');
    missingVars.forEach(varName => {
      console.error(`   - ${varName}`);
    });
    console.log('\n📝 Please add these variables to your .env.local file:');
    console.log('RESEND_API_KEY=re_your_api_key_here');
    console.log('NEXT_PUBLIC_RESEND_FROM_EMAIL=noreply@yourdomain.com');
    console.log('EMAIL_FROM_NAME=Tap2Go');
    console.log('EMAIL_REPLY_TO=support@yourdomain.com');
    console.log('ENABLE_EMAIL_NOTIFICATIONS=true');
    process.exit(1);
  }

  console.log('✅ All required environment variables are present\n');

  // Step 2: Validate email service configuration
  console.log('🔧 Step 2: Validating email service configuration...');
  
  try {
    const validation = validateEmailConfig();
    
    if (!validation.valid) {
      console.error('❌ Email configuration validation failed:');
      validation.errors.forEach(error => {
        console.error(`   - ${error}`);
      });
      process.exit(1);
    }
    
    console.log('✅ Email service configuration is valid\n');
  } catch (error) {
    console.error('❌ Error validating email configuration:', error.message);
    process.exit(1);
  }

  // Step 3: Test email functionality (optional)
  const testEmail = process.argv[2];
  
  if (testEmail) {
    console.log(`📧 Step 3: Testing email functionality with ${testEmail}...`);
    
    try {
      const testResult = await testEmailConfig(testEmail);
      
      if (testResult.success) {
        console.log('✅ Test email sent successfully!');
        console.log(`   Message ID: ${testResult.messageId}`);
        console.log('   Check your inbox for the test email.\n');
      } else {
        console.error('❌ Test email failed:', testResult.error);
        process.exit(1);
      }
    } catch (error) {
      console.error('❌ Error sending test email:', error.message);
      process.exit(1);
    }
  } else {
    console.log('⏭️  Step 3: Skipping email test (no test email provided)');
    console.log('   To test email functionality, run:');
    console.log('   node scripts/setup-resend-email.js your-email@example.com\n');
  }

  // Step 4: Display setup summary
  console.log('🎉 Resend Email Service Setup Complete!\n');
  console.log('📊 Configuration Summary:');
  console.log(`   API Key: ${process.env.RESEND_API_KEY ? '✅ Configured' : '❌ Missing'}`);
  console.log(`   From Email: ${process.env.NEXT_PUBLIC_RESEND_FROM_EMAIL}`);
  console.log(`   From Name: ${process.env.EMAIL_FROM_NAME}`);
  console.log(`   Reply To: ${process.env.EMAIL_REPLY_TO}`);
  console.log(`   Enabled: ${process.env.ENABLE_EMAIL_NOTIFICATIONS === 'true' ? '✅ Yes' : '❌ No'}`);
  
  console.log('\n🔗 Available API Endpoints:');
  console.log('   POST /api/email/send - Send emails');
  console.log('   POST /api/email/test - Test email functionality');
  console.log('   GET  /api/email/test - View test endpoint documentation');
  
  console.log('\n📚 Next Steps:');
  console.log('1. Verify your domain in Resend dashboard');
  console.log('2. Test email sending via API endpoints');
  console.log('3. Integrate with your notification system');
  console.log('4. Monitor email delivery in Resend dashboard');
  
  console.log('\n🆘 Need Help?');
  console.log('   - Resend Documentation: https://resend.com/docs');
  console.log('   - Domain Setup: https://resend.com/domains');
  console.log('   - API Keys: https://resend.com/api-keys');
}

// Handle script execution
if (require.main === module) {
  setupResendEmail().catch(error => {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  });
}

module.exports = { setupResendEmail };
