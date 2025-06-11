const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '.env.local' });

async function testGoogleAI() {
  console.log('🤖 Testing Google AI Studio (Gemini) Integration...\n');

  // Check if API key is set
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey || apiKey === 'your_google_ai_api_key_here') {
    console.error('❌ GOOGLE_AI_API_KEY is not set or still has placeholder value');
    console.log('\n📝 To fix this:');
    console.log('1. Go to https://aistudio.google.com/');
    console.log('2. Create an API key');
    console.log('3. Replace "your_google_ai_api_key_here" in .env.local with your actual API key');
    return;
  }

  try {
    // Initialize Google AI
    const genAI = new GoogleGenerativeAI(apiKey);
    console.log('✅ Google AI initialized successfully');

    // Test basic text generation
    console.log('\n🧪 Testing basic text generation...');
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = 'Write a short, friendly greeting for a food delivery app called Tap2Go.';
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('✅ Text generation successful!');
    console.log('📝 Generated text:', text);

    // Test restaurant description generation
    console.log('\n🏪 Testing restaurant description generation...');
    const restaurantPrompt = `
Write a compelling description for a Filipino restaurant called "Lola's Kitchen" that specializes in traditional dishes like adobo, lechon, and halo-halo. Keep it between 100-150 words and make it sound appetizing.
    `.trim();

    const restaurantResult = await model.generateContent(restaurantPrompt);
    const restaurantResponse = await restaurantResult.response;
    const restaurantText = restaurantResponse.text();

    console.log('✅ Restaurant description generation successful!');
    console.log('🏪 Generated description:', restaurantText);

    // Test menu item description
    console.log('\n🍽️ Testing menu item description generation...');
    const menuPrompt = `
Write an appetizing description for a Filipino dish called "Chicken Adobo" made with chicken, soy sauce, vinegar, garlic, and bay leaves. Keep it between 30-50 words and make it sound delicious.
    `.trim();

    const menuResult = await model.generateContent(menuPrompt);
    const menuResponse = await menuResult.response;
    const menuText = menuResponse.text();

    console.log('✅ Menu item description generation successful!');
    console.log('🍽️ Generated description:', menuText);

    // Test API quota information
    console.log('\n📊 API Information:');
    console.log('• Model: gemini-1.5-flash');
    console.log('• Daily quota: 500 requests/day (free tier)');
    console.log('• Rate limit: 15 requests/minute');
    console.log('• Context window: Up to 1M tokens');

    console.log('\n🎉 All tests passed! Google AI Studio integration is working correctly.');
    console.log('\n🚀 Next steps:');
    console.log('1. Start your development server: npm run dev');
    console.log('2. Visit: http://localhost:3000/ai-demo');
    console.log('3. Test the AI features in the web interface');

  } catch (error) {
    console.error('❌ Error testing Google AI:', error.message);
    
    if (error.message.includes('API_KEY_INVALID')) {
      console.log('\n💡 Your API key appears to be invalid. Please check:');
      console.log('1. The API key is correct');
      console.log('2. The API key has the necessary permissions');
      console.log('3. You have enabled the Generative AI API in Google Cloud Console');
    } else if (error.message.includes('QUOTA_EXCEEDED')) {
      console.log('\n💡 You have exceeded your API quota. Please check:');
      console.log('1. Your daily request limit (500 requests/day for free tier)');
      console.log('2. Your rate limit (15 requests/minute)');
      console.log('3. Wait for the quota to reset or upgrade your plan');
    } else {
      console.log('\n💡 Please check:');
      console.log('1. Your internet connection');
      console.log('2. The API key is correctly set in .env.local');
      console.log('3. Google AI Studio service is available');
    }
  }
}

// Run the test
testGoogleAI().catch(console.error);
