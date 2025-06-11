/**
 * Development Email Testing Script
 * Test email functionality without domain setup
 */

require('dotenv').config({ path: '.env.local' });

async function testEmailDevelopment() {
  console.log('🧪 Testing Email Service in Development Mode\n');

  // Check environment
  const isDevelopment = process.env.NODE_ENV === 'development';
  const hasApiKey = !!process.env.RESEND_API_KEY;
  const fromEmail = process.env.NEXT_PUBLIC_RESEND_FROM_EMAIL;
  const isUsingTestDomain = !fromEmail || fromEmail.includes('resend.dev');

  console.log('📋 Current Configuration:');
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   API Key: ${hasApiKey ? '✅ Present' : '❌ Missing'}`);
  console.log(`   From Email: ${fromEmail || 'onboarding@resend.dev (default)'}`);
  console.log(`   Using Test Domain: ${isUsingTestDomain ? '✅ Yes (resend.dev)' : '❌ No (custom domain)'}`);
  console.log(`   Email Enabled: ${process.env.ENABLE_EMAIL_NOTIFICATIONS === 'true' ? '✅ Yes' : '❌ No'}\n`);

  if (isUsingTestDomain) {
    console.log('🎯 DEVELOPMENT MODE DETECTED');
    console.log('   ✅ You can test emails immediately using Resend\'s test domain');
    console.log('   ✅ No domain setup required for testing');
    console.log('   ✅ Emails will be sent from: onboarding@resend.dev');
    console.log('   ⚠️  Test emails may go to spam folder\n');
  } else {
    console.log('🏢 PRODUCTION MODE DETECTED');
    console.log('   ⚠️  Using custom domain - requires DNS setup');
    console.log('   ⚠️  Emails may fail if domain not verified');
    console.log('   💡 Switch to test domain for development\n');
  }

  if (!hasApiKey) {
    console.log('❌ SETUP REQUIRED:');
    console.log('1. Sign up at https://resend.com/signup');
    console.log('2. Get API key from https://resend.com/api-keys');
    console.log('3. Add to .env.local: RESEND_API_KEY=re_your_key_here\n');
    return;
  }

  // Test email functionality
  const testEmail = process.argv[2];
  
  if (!testEmail) {
    console.log('💡 To test email sending, run:');
    console.log('   node scripts/test-email-development.js your-email@example.com\n');
    return;
  }

  console.log(`📧 Testing email send to: ${testEmail}\n`);

  try {
    // Test basic email
    const response = await fetch('http://localhost:3000/api/email/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        testEmail: testEmail,
        testType: 'basic'
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.log('❌ Email test failed:');
      console.log(`   Status: ${response.status}`);
      console.log(`   Error: ${error}\n`);
      
      if (response.status === 500) {
        console.log('🔧 Troubleshooting:');
        console.log('1. Make sure your Next.js dev server is running: npm run dev');
        console.log('2. Check your RESEND_API_KEY is correct');
        console.log('3. Verify API key has sending permissions\n');
      }
      return;
    }

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ EMAIL SENT SUCCESSFULLY!');
      console.log(`   Message ID: ${result.messageId}`);
      console.log(`   Test Email: ${testEmail}`);
      console.log(`   From: ${result.metadata?.fromEmail || 'onboarding@resend.dev'}`);
      console.log(`   Using Test Domain: ${result.metadata?.usingTestDomain ? 'Yes' : 'No'}`);
      console.log('\n📬 Check your inbox (and spam folder) for the test email!\n');
      
      if (isUsingTestDomain) {
        console.log('🎉 SUCCESS! Your email service is working perfectly.');
        console.log('   You can now integrate email sending into your app.');
        console.log('   When ready for production, set up your custom domain.\n');
      }
    } else {
      console.log('❌ Email sending failed:');
      console.log(`   Error: ${result.error}\n`);
    }

  } catch (error) {
    console.log('❌ Test failed with error:');
    console.log(`   ${error.message}\n`);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('🔧 Make sure your Next.js development server is running:');
      console.log('   npm run dev\n');
    }
  }

  // Show next steps
  console.log('📚 Next Steps:');
  if (isUsingTestDomain) {
    console.log('1. ✅ Test emails are working - you\'re ready to develop!');
    console.log('2. 🔗 Integrate email sending into your order flow');
    console.log('3. 🧪 Test different email types (order confirmation, welcome, etc.)');
    console.log('4. 🏢 When ready for production, set up your custom domain');
  } else {
    console.log('1. 🌐 Verify your domain in Resend dashboard');
    console.log('2. 🔧 Add DNS records to your domain provider');
    console.log('3. ⏳ Wait for DNS propagation (5-30 minutes)');
    console.log('4. 🧪 Test again once domain is verified');
  }
  
  console.log('\n🔗 Useful Links:');
  console.log('   Resend Dashboard: https://resend.com/emails');
  console.log('   Domain Setup: https://resend.com/domains');
  console.log('   API Keys: https://resend.com/api-keys');
}

// Handle script execution
if (require.main === module) {
  testEmailDevelopment().catch(error => {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  });
}

module.exports = { testEmailDevelopment };
