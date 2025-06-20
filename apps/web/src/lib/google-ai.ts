import { GoogleGenerativeAI, GenerativeModel, ChatSession } from '@google/generative-ai';

// Initialize Google AI with API key
const apiKey = process.env.GOOGLE_AI_API_KEY;

if (!apiKey) {
  throw new Error('GOOGLE_AI_API_KEY is not set in environment variables');
}

const genAI = new GoogleGenerativeAI(apiKey);

// Available models
export const MODELS = {
  GEMINI_1_5_FLASH: 'gemini-1.5-flash',
  GEMINI_1_5_PRO: 'gemini-1.5-pro',
  GEMINI_2_0_FLASH: 'gemini-2.0-flash-exp',
  GEMINI_2_5_FLASH: 'gemini-2.5-flash-exp',
} as const;

// Default model
const DEFAULT_MODEL = process.env.AI_MODEL_DEFAULT || MODELS.GEMINI_1_5_FLASH;

// Configuration options
export interface AIConfig {
  model?: string;
  temperature?: number;
  maxOutputTokens?: number;
  topP?: number;
  topK?: number;
}

// Default configuration
const defaultConfig: AIConfig = {
  model: DEFAULT_MODEL,
  temperature: 0.7,
  maxOutputTokens: 2048,
  topP: 0.8,
  topK: 40,
};

/**
 * Get a generative model instance
 */
export function getModel(config: AIConfig = {}): GenerativeModel {
  const modelConfig = { ...defaultConfig, ...config };
  
  return genAI.getGenerativeModel({
    model: modelConfig.model!,
    generationConfig: {
      temperature: modelConfig.temperature,
      maxOutputTokens: modelConfig.maxOutputTokens,
      topP: modelConfig.topP,
      topK: modelConfig.topK,
    },
  });
}

/**
 * Generate text from a prompt
 */
export async function generateText(
  prompt: string,
  config: AIConfig = {}
): Promise<string> {
  try {
    const model = getModel(config);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating text:', error);
    throw new Error('Failed to generate text');
  }
}

/**
 * Generate text with image input
 */
export async function generateTextWithImage(
  prompt: string,
  imageData: string | Buffer,
  mimeType: string = 'image/jpeg',
  config: AIConfig = {}
): Promise<string> {
  try {
    const model = getModel(config);
    
    // Convert image data to the required format
    const imagePart = {
      inlineData: {
        data: typeof imageData === 'string' ? imageData : imageData.toString('base64'),
        mimeType,
      },
    };

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating text with image:', error);
    throw new Error('Failed to generate text with image');
  }
}

/**
 * Start a chat session
 */
export function startChat(config: AIConfig = {}): ChatSession {
  const model = getModel(config);
  return model.startChat();
}

/**
 * Continue a chat conversation
 */
export async function chatMessage(
  chat: ChatSession,
  message: string
): Promise<string> {
  try {
    const result = await chat.sendMessage(message);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error sending chat message:', error);
    throw new Error('Failed to send chat message');
  }
}

/**
 * Generate content for restaurant descriptions
 */
export async function generateRestaurantDescription(
  restaurantName: string,
  cuisine: string,
  specialties: string[],
  config: AIConfig = {}
): Promise<string> {
  const prompt = `
Write a compelling and appetizing description for a restaurant called "${restaurantName}" that serves ${cuisine} cuisine.

Key specialties: ${specialties.join(', ')}

Requirements:
- Keep it between 100-150 words
- Make it sound appetizing and inviting
- Highlight the unique aspects
- Use engaging, descriptive language
- Focus on the dining experience

Please write only the description without any additional text or formatting.
  `.trim();

  return generateText(prompt, config);
}

/**
 * Generate menu item descriptions
 */
export async function generateMenuItemDescription(
  itemName: string,
  ingredients: string[],
  cuisine: string,
  config: AIConfig = {}
): Promise<string> {
  const prompt = `
Write an appetizing description for a ${cuisine} dish called "${itemName}".

Main ingredients: ${ingredients.join(', ')}

Requirements:
- Keep it between 30-50 words
- Make it sound delicious and appealing
- Mention key ingredients naturally
- Use descriptive, mouth-watering language
- Don't include price or availability information

Please write only the description without any additional text or formatting.
  `.trim();

  return generateText(prompt, config);
}

/**
 * Generate customer service responses
 */
export async function generateCustomerServiceResponse(
  customerMessage: string,
  context: string,
  config: AIConfig = {}
): Promise<string> {
  const prompt = `
You are a helpful customer service representative for Tap2Go, a food delivery platform.

Customer message: "${customerMessage}"
Context: ${context}

Please provide a helpful, professional, and friendly response that:
- Addresses the customer's concern directly
- Is empathetic and understanding
- Offers practical solutions when possible
- Maintains a positive tone
- Keeps the response concise (under 100 words)

Please write only the response without any additional text or formatting.
  `.trim();

  return generateText(prompt, config);
}

/**
 * Analyze food images and generate descriptions
 */
export async function analyzeFoodImage(
  imageData: string | Buffer,
  mimeType: string = 'image/jpeg',
  config: AIConfig = {}
): Promise<string> {
  const prompt = `
Analyze this food image and provide a detailed description including:
- What type of dish this appears to be
- Key ingredients you can identify
- Cooking method or preparation style
- Visual appeal and presentation
- Estimated cuisine type

Keep the description appetizing and professional, suitable for a food delivery app.
  `.trim();

  return generateTextWithImage(prompt, imageData, mimeType, config);
}

// Export the main AI instance for advanced usage
export { genAI };
