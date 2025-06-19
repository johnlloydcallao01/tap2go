/**
 * Simple Email Test Script
 */

async function testEmail() {
  try {
    console.log('🧪 Testing ORDER CONFIRMATION email to johnlloydcallao@gmail.com...\n');

    const response = await fetch('http://localhost:3001/api/email/test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        testEmail: 'johnlloydcallao@gmail.com',
        testType: 'order_confirmation'
      })
    });

    const result = await response.json();

    if (response.ok && result.success) {
      console.log('✅ EMAIL SENT SUCCESSFULLY!');
      console.log(`📧 Sent to: johnlloydcallao@gmail.com`);
      console.log(`📨 Message ID: ${result.messageId}`);
      console.log(`🕒 Timestamp: ${result.metadata?.timestamp}`);
      console.log(`📤 From: ${result.metadata?.fromEmail || 'onboarding@resend.dev'}`);
      console.log('\n🎉 Check your inbox (and spam folder) for the test email!');
      console.log('\n📊 Next steps:');
      console.log('1. ✅ Email service is working perfectly');
      console.log('2. 🔗 You can now integrate emails into your app');
      console.log('3. 🧪 Test order confirmation emails');
      console.log('4. 🚀 Deploy to production when ready');
    } else {
      console.log('❌ Email test failed:');
      console.log(`Status: ${response.status}`);
      console.log(`Error: ${result.error || 'Unknown error'}`);
      if (result.details) {
        console.log(`Details: ${result.details}`);
      }
    }

  } catch (error) {
    console.log('❌ Test failed with error:');
    console.log(`Error: ${error.message}`);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n🔧 Make sure your Next.js server is running:');
      console.log('npm run dev');
    }
  }
}

testEmail();
