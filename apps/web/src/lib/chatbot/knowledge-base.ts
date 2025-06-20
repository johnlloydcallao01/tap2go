/**
 * Tap2Go Knowledge Base
 * Contains FAQ patterns, quick replies, and knowledge base for the AI chatbot
 */

// Knowledge base for Tap2Go platform
export const TAP2GO_KNOWLEDGE_BASE = {
  platform: {
    name: "Tap2Go",
    description: "Food delivery platform connecting customers with local restaurants",
    features: [
      "Real-time order tracking",
      "Multiple payment options",
      "Restaurant discovery",
      "Driver tracking",
      "Customer support"
    ]
  },
  
  ordering: {
    process: [
      "Browse restaurants",
      "Select items and customize",
      "Add to cart",
      "Checkout with payment",
      "Track order in real-time"
    ],
    paymentMethods: ["Credit/Debit Cards", "PayPal", "Apple Pay", "Google Pay"],
    deliveryTime: "Typically 30-45 minutes",
    minimumOrder: "$10 for most restaurants"
  },

  delivery: {
    areas: "Available in major cities",
    fees: "Starting from $2.99",
    tracking: "Real-time GPS tracking available",
    contactless: "Contactless delivery option available"
  },

  support: {
    hours: "24/7 customer support",
    contact: {
      email: "support@tap2go.com",
      phone: "(555) 123-4567"
    },
    commonIssues: [
      "Order delays",
      "Payment issues",
      "Missing items",
      "Delivery problems",
      "Account issues"
    ]
  }
};

// FAQ patterns for intent detection
export const FAQ_PATTERNS: Record<string, string[]> = {
  order_status: [
    "where is my order",
    "order status",
    "track my order",
    "delivery time",
    "when will my food arrive",
    "order tracking"
  ],
  
  payment: [
    "payment failed",
    "refund",
    "billing",
    "charge",
    "payment method",
    "credit card",
    "paypal"
  ],
  
  delivery: [
    "delivery fee",
    "delivery time",
    "delivery area",
    "contactless delivery",
    "driver location",
    "delivery address"
  ],
  
  restaurant: [
    "restaurant hours",
    "menu",
    "restaurant location",
    "cuisine type",
    "restaurant rating",
    "food quality"
  ],
  
  account: [
    "login",
    "password",
    "account settings",
    "profile",
    "email change",
    "phone number"
  ],
  
  technical: [
    "app not working",
    "website down",
    "bug",
    "error",
    "crash",
    "loading issue"
  ],
  
  general: [
    "how does it work",
    "what is tap2go",
    "getting started",
    "help",
    "support",
    "contact"
  ]
};

// Quick replies (currently empty as per user preference)
export const QUICK_REPLIES: Record<string, string[]> = {
  // User prefers no quick reply buttons for natural conversation flow
};

// Response templates for common queries
export const RESPONSE_TEMPLATES = {
  greeting: "Hi! I'm Tap2Go's AI assistant. I can help you with orders, restaurant info, delivery questions, and more. How can I help you today?",
  
  order_status: "I can help you track your order! Please provide your order number or the email address associated with your order.",
  
  payment_issue: "I understand you're having payment issues. Let me help you resolve this. Can you tell me more about the specific problem you're experiencing?",
  
  delivery_question: "I'm here to help with delivery questions! What would you like to know about delivery times, fees, or areas?",
  
  restaurant_info: "I can help you find information about restaurants on our platform. What specific restaurant or cuisine are you looking for?",
  
  technical_support: "I'm sorry you're experiencing technical issues. Can you describe what's happening so I can better assist you?",
  
  escalation: "I understand this requires additional assistance. Let me connect you with our human support team who can provide more specialized help.",
  
  fallback: "I want to make sure I give you the most accurate information. Could you please rephrase your question or let me know specifically what you need help with?"
};

// Escalation triggers
export const ESCALATION_KEYWORDS = [
  "speak to human",
  "human agent",
  "customer service",
  "manager",
  "supervisor",
  "complaint",
  "angry",
  "frustrated",
  "legal",
  "lawsuit",
  "refund request",
  "cancel order",
  "emergency"
];

// Confidence thresholds
export const CONFIDENCE_THRESHOLDS = {
  high: 0.8,
  medium: 0.6,
  low: 0.4
};
