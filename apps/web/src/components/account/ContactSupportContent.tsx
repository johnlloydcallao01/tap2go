'use client';

import React, { useState } from 'react';
import {
  ChatBubbleLeftRightIcon,
  PhoneIcon,
  EnvelopeIcon,
  ExclamationTriangleIcon,
  PaperAirplaneIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

export default function ContactSupportContent() {
  const [selectedIssue, setSelectedIssue] = useState('');
  const [message, setMessage] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [priority, setPriority] = useState('normal');
  const [contactMethod, setContactMethod] = useState('chat');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const issueTypes = [
    { id: 'order_issue', label: 'Order Issue', description: 'Problems with your current or past orders' },
    { id: 'payment_issue', label: 'Payment Issue', description: 'Billing, refunds, or payment method problems' },
    { id: 'delivery_issue', label: 'Delivery Issue', description: 'Late delivery, wrong address, or driver issues' },
    { id: 'app_issue', label: 'App/Website Issue', description: 'Technical problems with the app or website' },
    { id: 'account_issue', label: 'Account Issue', description: 'Login, profile, or account settings problems' },
    { id: 'restaurant_issue', label: 'Restaurant Issue', description: 'Food quality, missing items, or restaurant concerns' },
    { id: 'other', label: 'Other', description: 'General questions or other concerns' },
  ];

  const contactMethods = [
    {
      id: 'chat',
      name: 'Live Chat',
      icon: ChatBubbleLeftRightIcon,
      description: 'Get instant help from our support team',
      availability: 'Available 24/7',
      responseTime: 'Usually responds in 2-3 minutes',
      color: 'blue',
    },
    {
      id: 'phone',
      name: 'Phone Support',
      icon: PhoneIcon,
      description: 'Speak directly with a support representative',
      availability: 'Mon-Sun, 8 AM - 10 PM',
      responseTime: 'Average wait time: 3-5 minutes',
      color: 'green',
    },
    {
      id: 'email',
      name: 'Email Support',
      icon: EnvelopeIcon,
      description: 'Send us a detailed message about your issue',
      availability: 'Available 24/7',
      responseTime: 'Usually responds within 2-4 hours',
      color: 'purple',
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate form submission
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setMessage('');
      setOrderNumber('');
      setSelectedIssue('');
    }, 3000);
  };

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return 'border-blue-200 bg-blue-50 text-blue-600';
      case 'green':
        return 'border-green-200 bg-green-50 text-green-600';
      case 'purple':
        return 'border-purple-200 bg-purple-50 text-purple-600';
      default:
        return 'border-gray-200 bg-gray-50 text-gray-600';
    }
  };

  if (isSubmitted) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <CheckCircleIcon className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Message Sent Successfully!</h2>
          <p className="text-gray-600 mb-6">
            Thank you for contacting us. We&apos;ve received your message and will get back to you soon.
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-800 font-medium">
              {contactMethod === 'chat' && 'A support agent will join the chat shortly.'}
              {contactMethod === 'phone' && 'We&apos;ll call you back within the next few minutes.'}
              {contactMethod === 'email' && 'Check your email for our response within 2-4 hours.'}
            </p>
          </div>
          <button
            onClick={() => setIsSubmitted(false)}
            className="bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            Send Another Message
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Contact Support</h1>
          <p className="text-gray-600">We&apos;re here to help! Choose how you&apos;d like to get in touch.</p>
        </div>

        {/* Contact Methods */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {contactMethods.map((method) => {
            const IconComponent = method.icon;
            return (
              <button
                key={method.id}
                onClick={() => setContactMethod(method.id)}
                className={`p-6 rounded-xl border-2 transition-all text-left ${
                  contactMethod === method.id
                    ? `${getColorClasses(method.color)} border-opacity-100`
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-3 mb-3">
                  <IconComponent className={`h-6 w-6 ${
                    contactMethod === method.id ? '' : 'text-gray-600'
                  }`} />
                  <h3 className={`font-semibold ${
                    contactMethod === method.id ? '' : 'text-gray-900'
                  }`}>
                    {method.name}
                  </h3>
                </div>
                <p className={`text-sm mb-2 ${
                  contactMethod === method.id ? 'text-current' : 'text-gray-600'
                }`}>
                  {method.description}
                </p>
                <div className="space-y-1">
                  <p className={`text-xs ${
                    contactMethod === method.id ? 'text-current' : 'text-gray-500'
                  }`}>
                    {method.availability}
                  </p>
                  <p className={`text-xs ${
                    contactMethod === method.id ? 'text-current' : 'text-gray-500'
                  }`}>
                    {method.responseTime}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Support Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Tell us about your issue</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Issue Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              What can we help you with?
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {issueTypes.map((issue) => (
                <button
                  key={issue.id}
                  type="button"
                  onClick={() => setSelectedIssue(issue.id)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    selectedIssue === issue.id
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <h4 className="font-medium text-gray-900 mb-1">{issue.label}</h4>
                  <p className="text-sm text-gray-600">{issue.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Order Number (conditional) */}
          {(selectedIssue === 'order_issue' || selectedIssue === 'delivery_issue' || selectedIssue === 'restaurant_issue') && (
            <div>
              <label htmlFor="orderNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Order Number (Optional)
              </label>
              <input
                type="text"
                id="orderNumber"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="e.g., ORD-2024-001"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
              <p className="text-sm text-gray-500 mt-1">
                Providing your order number helps us assist you faster
              </p>
            </div>
          )}

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Priority Level</label>
            <div className="flex space-x-4">
              {[
                { id: 'low', label: 'Low', description: 'General questions' },
                { id: 'normal', label: 'Normal', description: 'Standard issues' },
                { id: 'high', label: 'High', description: 'Urgent problems' },
              ].map((level) => (
                <button
                  key={level.id}
                  type="button"
                  onClick={() => setPriority(level.id)}
                  className={`flex-1 p-3 rounded-lg border-2 text-center transition-all ${
                    priority === level.id
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="font-medium text-gray-900">{level.label}</p>
                  <p className="text-xs text-gray-600">{level.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Message */}
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
              Describe your issue
            </label>
            <textarea
              id="message"
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Please provide as much detail as possible about your issue..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              The more details you provide, the better we can help you
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!selectedIssue || !message.trim()}
            className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
          >
            <PaperAirplaneIcon className="h-5 w-5 mr-2" />
            {contactMethod === 'chat' && 'Start Live Chat'}
            {contactMethod === 'phone' && 'Request Phone Call'}
            {contactMethod === 'email' && 'Send Email'}
          </button>
        </form>
      </div>

      {/* Emergency Contact */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-start space-x-3">
          <ExclamationTriangleIcon className="h-6 w-6 text-red-600 mt-1" />
          <div>
            <h3 className="font-semibold text-red-900 mb-2">Emergency or Safety Issues?</h3>
            <p className="text-red-800 mb-3">
              If you&apos;re experiencing a safety emergency or urgent issue with your delivery,
              please call us immediately at:
            </p>
            <a
              href="tel:+1-555-911-HELP"
              className="inline-flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              <PhoneIcon className="h-4 w-4" />
              <span>+1 (555) 911-HELP</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
