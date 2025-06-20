'use client';

import React, { useState, useEffect } from 'react';
import {
  ChatBubbleLeftRightIcon,
  MagnifyingGlassIcon,

  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,

  PaperAirplaneIcon,
} from '@heroicons/react/24/outline';

interface SupportTicket {
  id: string;
  customerName: string;
  customerEmail: string;
  subject: string;
  category: 'order' | 'payment' | 'delivery' | 'account' | 'technical' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed';
  createdAt: string;
  lastReply: string;
  assignedAgent?: string;
  messageCount: number;
  lastMessage: string;
}

interface ChatMessage {
  id: string;
  sender: 'customer' | 'agent';
  senderName: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}

export default function AdminSupport() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');

  useEffect(() => {
    const loadTickets = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));

        const mockTickets: SupportTicket[] = [
          {
            id: '1',
            customerName: 'Sarah Johnson',
            customerEmail: 'sarah.j@email.com',
            subject: 'Order not delivered',
            category: 'delivery',
            priority: 'high',
            status: 'open',
            createdAt: '2024-01-15T10:30:00Z',
            lastReply: '2024-01-15T10:30:00Z',
            assignedAgent: 'John Smith',
            messageCount: 3,
            lastMessage: 'My order was supposed to arrive 2 hours ago but I still haven\'t received it.',
          },
          {
            id: '2',
            customerName: 'Mike Chen',
            customerEmail: 'mike.chen@email.com',
            subject: 'Payment issue with credit card',
            category: 'payment',
            priority: 'medium',
            status: 'in_progress',
            createdAt: '2024-01-14T18:45:00Z',
            lastReply: '2024-01-15T09:15:00Z',
            assignedAgent: 'Lisa Wilson',
            messageCount: 5,
            lastMessage: 'I tried multiple cards but none of them work on your platform.',
          },
          {
            id: '3',
            customerName: 'Emily Rodriguez',
            customerEmail: 'emily.r@email.com',
            subject: 'Cannot access my account',
            category: 'account',
            priority: 'medium',
            status: 'waiting_customer',
            createdAt: '2024-01-14T14:20:00Z',
            lastReply: '2024-01-14T16:30:00Z',
            assignedAgent: 'David Brown',
            messageCount: 4,
            lastMessage: 'Please try the password reset link we sent to your email.',
          },
          {
            id: '4',
            customerName: 'David Wilson',
            customerEmail: 'david.w@email.com',
            subject: 'App keeps crashing',
            category: 'technical',
            priority: 'urgent',
            status: 'open',
            createdAt: '2024-01-13T20:15:00Z',
            lastReply: '2024-01-13T20:15:00Z',
            messageCount: 1,
            lastMessage: 'The app crashes every time I try to place an order. This is very frustrating!',
          },
          {
            id: '5',
            customerName: 'Lisa Thompson',
            customerEmail: 'lisa.t@email.com',
            subject: 'Refund request for cancelled order',
            category: 'payment',
            priority: 'low',
            status: 'resolved',
            createdAt: '2024-01-13T16:30:00Z',
            lastReply: '2024-01-14T10:00:00Z',
            assignedAgent: 'John Smith',
            messageCount: 6,
            lastMessage: 'Thank you for processing my refund so quickly!',
          },
        ];

        setTickets(mockTickets);
      } catch (error) {
        console.error('Error loading tickets:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTickets();
  }, []);

  const loadChatMessages = async () => {
    // Mock chat messages for the selected ticket
    const mockMessages: ChatMessage[] = [
      {
        id: '1',
        sender: 'customer',
        senderName: 'Sarah Johnson',
        message: 'Hi, I placed an order 2 hours ago but it hasn\'t arrived yet. Can you help?',
        timestamp: '2024-01-15T10:30:00Z',
        isRead: true,
      },
      {
        id: '2',
        sender: 'agent',
        senderName: 'John Smith',
        message: 'Hello Sarah! I\'m sorry to hear about the delay. Let me check your order status right away.',
        timestamp: '2024-01-15T10:32:00Z',
        isRead: true,
      },
      {
        id: '3',
        sender: 'agent',
        senderName: 'John Smith',
        message: 'I can see your order is currently with the driver. They should arrive within the next 15 minutes. I\'ll also apply a 20% discount to your next order for the inconvenience.',
        timestamp: '2024-01-15T10:35:00Z',
        isRead: true,
      },
    ];

    setChatMessages(mockMessages);
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.customerEmail.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || ticket.status === selectedStatus;
    const matchesPriority = selectedPriority === 'all' || ticket.priority === selectedPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusBadge = (status: SupportTicket['status']) => {
    const badges = {
      open: 'bg-red-100 text-red-800',
      in_progress: 'bg-blue-100 text-blue-800',
      waiting_customer: 'bg-yellow-100 text-yellow-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800',
    };
    
    return badges[status] || badges.open;
  };

  const getPriorityBadge = (priority: SupportTicket['priority']) => {
    const badges = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800',
    };
    
    return badges[priority] || badges.medium;
  };

  const handleTicketSelect = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    loadChatMessages();
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedTicket) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      sender: 'agent',
      senderName: 'Admin Agent',
      message: newMessage,
      timestamp: new Date().toISOString(),
      isRead: true,
    };

    setChatMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="lg:col-span-2 h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
        <div className="mb-4 sm:mb-0">
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Support Chat</h1>
          <p className="text-sm lg:text-base text-gray-600">Manage customer support tickets and live chat.</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <span>Active Tickets: {tickets.filter(t => t.status === 'open' || t.status === 'in_progress').length}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Open</p>
              <p className="text-lg font-semibold text-gray-900">
                {tickets.filter(t => t.status === 'open').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ClockIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-lg font-semibold text-gray-900">
                {tickets.filter(t => t.status === 'in_progress').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Resolved</p>
              <p className="text-lg font-semibold text-gray-900">
                {tickets.filter(t => t.status === 'resolved').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <ChatBubbleLeftRightIcon className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-lg font-semibold text-gray-900">{tickets.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tickets List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow border">
            {/* Filters */}
            <div className="p-4 border-b border-gray-200">
              <div className="space-y-3">
                <div className="relative">
                  <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search tickets..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                <div className="flex space-x-2">
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="all">All Status</option>
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="waiting_customer">Waiting</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>

                  <select
                    value={selectedPriority}
                    onChange={(e) => setSelectedPriority(e.target.value)}
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="all">All Priority</option>
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Tickets */}
            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {filteredTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  onClick={() => handleTicketSelect(ticket)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 ${
                    selectedTicket?.id === ticket.id ? 'bg-orange-50 border-r-2 border-orange-500' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {ticket.subject}
                      </h4>
                      <p className="text-xs text-gray-500">{ticket.customerName}</p>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityBadge(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(ticket.status)}`}>
                        {ticket.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                    {ticket.lastMessage}
                  </p>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{ticket.messageCount} messages</span>
                    <span>{new Date(ticket.lastReply).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>

            {filteredTickets.length === 0 && (
              <div className="p-8 text-center">
                <ChatBubbleLeftRightIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-sm font-medium text-gray-900 mb-2">No tickets found</h3>
                <p className="text-xs text-gray-600">Try adjusting your search or filter criteria.</p>
              </div>
            )}
          </div>
        </div>

        {/* Chat Interface */}
        <div className="lg:col-span-2">
          {selectedTicket ? (
            <div className="bg-white rounded-lg shadow border h-96 flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{selectedTicket.subject}</h3>
                    <p className="text-sm text-gray-600">
                      {selectedTicket.customerName} • {selectedTicket.customerEmail}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusBadge(selectedTicket.status)}`}>
                      {selectedTicket.status.replace('_', ' ')}
                    </span>
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${getPriorityBadge(selectedTicket.priority)}`}>
                      {selectedTicket.priority}
                    </span>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'agent' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.sender === 'agent'
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-xs font-medium">{message.senderName}</span>
                        <span className="text-xs opacity-75">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm">{message.message}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type your message..."
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <PaperAirplaneIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow border h-96 flex items-center justify-center">
              <div className="text-center">
                <ChatBubbleLeftRightIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a ticket to start chatting</h3>
                <p className="text-gray-600">Choose a support ticket from the list to view the conversation.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
