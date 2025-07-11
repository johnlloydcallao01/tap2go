'use client';

import React, { useState, useEffect } from 'react';
import {
  QuestionMarkCircleIcon,
  MagnifyingGlassIcon,
  PhoneIcon,
  ChatBubbleLeftRightIcon,
  EnvelopeIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/outline';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  helpful: number;
}

interface HelpCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  articleCount: number;
}

export default function HelpCenterContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [categories, setCategories] = useState<HelpCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading help data
    setTimeout(() => {
      setCategories([
        {
          id: 'all',
          name: 'All Topics',
          icon: '📚',
          description: 'Browse all help articles',
          articleCount: 24,
        },
        {
          id: 'orders',
          name: 'Orders & Delivery',
          icon: '🚚',
          description: 'Questions about placing and tracking orders',
          articleCount: 8,
        },
        {
          id: 'payment',
          name: 'Payment & Billing',
          icon: '💳',
          description: 'Payment methods, billing, and refunds',
          articleCount: 6,
        },
        {
          id: 'account',
          name: 'Account & Profile',
          icon: '👤',
          description: 'Managing your account and personal information',
          articleCount: 5,
        },
        {
          id: 'technical',
          name: 'Technical Issues',
          icon: '⚙️',
          description: 'App problems and troubleshooting',
          articleCount: 5,
        },
      ]);

      setFaqs([
        {
          id: '1',
          question: 'How do I track my order?',
          answer: 'You can track your order in real-time by going to the "Track Order" section in your account. You\'ll see live updates from when your order is confirmed until it\'s delivered to your door.',
          category: 'orders',
          helpful: 45,
        },
        {
          id: '2',
          question: 'What payment methods do you accept?',
          answer: 'We accept all major credit cards (Visa, MasterCard, American Express), debit cards, PayPal, Apple Pay, and Google Pay. You can also pay with cash on delivery in select areas.',
          category: 'payment',
          helpful: 38,
        },
        {
          id: '3',
          question: 'How do I cancel my order?',
          answer: 'You can cancel your order within 5 minutes of placing it by going to your order history and clicking "Cancel Order". After this window, please contact customer support for assistance.',
          category: 'orders',
          helpful: 42,
        },
        {
          id: '4',
          question: 'Why was my order cancelled?',
          answer: 'Orders may be cancelled due to restaurant closure, item unavailability, payment issues, or delivery area restrictions. You\'ll receive a full refund within 3-5 business days.',
          category: 'orders',
          helpful: 29,
        },
        {
          id: '5',
          question: 'How do I update my delivery address?',
          answer: 'Go to "Account Settings" > "Addresses" to add, edit, or delete delivery addresses. You can also change the address during checkout before confirming your order.',
          category: 'account',
          helpful: 33,
        },
        {
          id: '6',
          question: 'What are the delivery fees?',
          answer: 'Delivery fees vary by restaurant and distance, typically ranging from $1.99 to $4.99. Some restaurants offer free delivery on orders over a certain amount. You\'ll see the exact fee before confirming your order.',
          category: 'orders',
          helpful: 51,
        },
        {
          id: '7',
          question: 'How do I get a refund?',
          answer: 'If you\'re not satisfied with your order, contact customer support within 24 hours. We\'ll review your case and process refunds to your original payment method within 3-5 business days.',
          category: 'payment',
          helpful: 27,
        },
        {
          id: '8',
          question: 'The app is not working properly',
          answer: 'Try closing and reopening the app, checking your internet connection, or updating to the latest version. If problems persist, restart your device or contact technical support.',
          category: 'technical',
          helpful: 19,
        },
        {
          id: '9',
          question: 'How do I change my password?',
          answer: 'Go to "Account Settings" > "Security" and click "Change Password". You\'ll need to enter your current password and then your new password twice to confirm.',
          category: 'account',
          helpful: 22,
        },
        {
          id: '10',
          question: 'What are your delivery hours?',
          answer: 'Most restaurants deliver from 11 AM to 11 PM, but hours vary by location and restaurant. You can see each restaurant\'s delivery hours on their profile page.',
          category: 'orders',
          helpful: 35,
        },
      ]);

      setLoading(false);
    }, 1000);
  }, []);

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleFAQ = (faqId: string) => {
    setExpandedFAQ(expandedFAQ === faqId ? null : faqId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Help Center</h1>
          <p className="text-gray-600">Find answers to frequently asked questions</p>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md mx-auto">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search for help..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
        </div>
      </div>

      {/* Quick Contact */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Need More Help?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/account/support"
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ChatBubbleLeftRightIcon className="h-6 w-6 text-blue-600" />
            <div>
              <p className="font-medium text-gray-900">Live Chat</p>
              <p className="text-sm text-gray-500">Available 24/7</p>
            </div>
          </a>
          <a
            href="tel:+1-555-123-4567"
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <PhoneIcon className="h-6 w-6 text-green-600" />
            <div>
              <p className="font-medium text-gray-900">Call Us</p>
              <p className="text-sm text-gray-500">+1 (555) 123-4567</p>
            </div>
          </a>
          <a
            href="mailto:support@tap2go.com"
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <EnvelopeIcon className="h-6 w-6 text-purple-600" />
            <div>
              <p className="font-medium text-gray-900">Email Support</p>
              <p className="text-sm text-gray-500">support@tap2go.com</p>
            </div>
          </a>
        </div>
      </div>

      {/* Categories */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Browse by Category</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`text-left p-4 rounded-lg border-2 transition-all ${
                selectedCategory === category.id
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-2xl">{category.icon}</span>
                <h3 className="font-medium text-gray-900">{category.name}</h3>
              </div>
              <p className="text-sm text-gray-600 mb-2">{category.description}</p>
              <p className="text-xs text-gray-500">{category.articleCount} articles</p>
            </button>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            Frequently Asked Questions
            {searchQuery && (
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({filteredFAQs.length} results for &quot;{searchQuery}&quot;)
              </span>
            )}
          </h2>
        </div>
        <div className="p-6">
          {filteredFAQs.length > 0 ? (
            <div className="space-y-4">
              {filteredFAQs.map((faq) => (
                <div key={faq.id} className="border border-gray-200 rounded-lg">
                  <button
                    onClick={() => toggleFAQ(faq.id)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                  >
                    <h3 className="font-medium text-gray-900 pr-4">{faq.question}</h3>
                    {expandedFAQ === faq.id ? (
                      <ChevronUpIcon className="h-5 w-5 text-gray-500 flex-shrink-0" />
                    ) : (
                      <ChevronDownIcon className="h-5 w-5 text-gray-500 flex-shrink-0" />
                    )}
                  </button>
                  {expandedFAQ === faq.id && (
                    <div className="px-4 pb-4">
                      <p className="text-gray-700 leading-relaxed mb-3">{faq.answer}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-gray-500">Was this helpful?</span>
                          <div className="flex space-x-2">
                            <button className="text-sm text-green-600 hover:text-green-700">👍 Yes</button>
                            <button className="text-sm text-red-600 hover:text-red-700">👎 No</button>
                          </div>
                        </div>
                        <span className="text-xs text-gray-400">{faq.helpful} people found this helpful</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <QuestionMarkCircleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
              <p className="text-gray-500 mb-4">
                {searchQuery 
                  ? `No articles match &quot;${searchQuery}&quot;. Try different keywords or browse by category.`
                  : 'No articles available in this category.'}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-orange-600 hover:text-orange-700 font-medium"
                >
                  Clear search
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
