'use client';

// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import {
  ChatBubbleLeftRightIcon,
  MagnifyingGlassIcon,

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

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.customerEmail.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || ticket.status === selectedStatus;
    const matchesPriority = selectedPriority === 'all' || ticket.priority === selectedPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getPriorityBadge = (priority: string) => {
    const badges = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800',
    };
    return badges[priority as keyof typeof badges] || badges.low;
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      open: 'bg-green-100 text-green-800',
      in_progress: 'bg-blue-100 text-blue-800',
      waiting_customer: 'bg-yellow-100 text-yellow-800',
      resolved: 'bg-purple-100 text-purple-800',
      closed: 'bg-gray-100 text-gray-800',
    };
    return badges[status as keyof typeof badges] || badges.open;
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
      <AdminLayout>
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <div className="h-96 bg-gray-200 rounded"></div>
              </div>
              <div className="lg:col-span-2">
                <div className="h-96 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Support Chat</h1>
            <p className="text-sm lg:text-base text-gray-600">Manage customer support tickets and live chat.</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
              {tickets.filter(t => t.status === 'open').length} Open
            </div>
            <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              {tickets.filter(t => t.status === 'in_progress').length} In Progress
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Tickets List */}
          <div className="lg:col-span-1 bg-white rounded-lg shadow border flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Support Tickets</h3>
              
              {/* Filters */}
              <div className="space-y-3">
                <div className="relative">
                  <MagnifyingGlassIcon className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search tickets..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:ring-orange-500 focus:border-orange-500"
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
                    className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:ring-orange-500 focus:border-orange-500"
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
            <div className="flex-1 overflow-y-auto">
              {filteredTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
                    selectedTicket?.id === ticket.id ? 'bg-orange-50 border-orange-200' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-900 truncate">{ticket.subject}</h4>
                    <div className="flex items-center space-x-1 ml-2">
                      <span className={`inline-flex px-1.5 py-0.5 rounded text-xs font-medium ${getPriorityBadge(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">{ticket.customerName}</p>
                  <p className="text-xs text-gray-500 truncate mb-2">{ticket.lastMessage}</p>
                  
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${getStatusBadge(ticket.status)}`}>
                      {ticket.status.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(ticket.lastReply).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow border flex flex-col">
            {selectedTicket ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{selectedTicket.subject}</h3>
                      <p className="text-sm text-gray-600">{selectedTicket.customerName} • {selectedTicket.customerEmail}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${getStatusBadge(selectedTicket.status)}`}>
                        {selectedTicket.status.replace('_', ' ')}
                      </span>
                      <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${getPriorityBadge(selectedTicket.priority)}`}>
                        {selectedTicket.priority}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {/* Sample messages */}
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">C</span>
                    </div>
                    <div className="flex-1">
                      <div className="bg-gray-100 rounded-lg p-3">
                        <p className="text-sm text-gray-900">{selectedTicket.lastMessage}</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{selectedTicket.customerName} • {new Date(selectedTicket.createdAt).toLocaleString()}</p>
                    </div>
                  </div>

                  {chatMessages.map((message) => (
                    <div key={message.id} className={`flex items-start space-x-3 ${message.sender === 'agent' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        message.sender === 'agent' ? 'bg-orange-500' : 'bg-blue-500'
                      }`}>
                        <span className="text-white text-sm font-medium">
                          {message.sender === 'agent' ? 'A' : 'C'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className={`rounded-lg p-3 ${
                          message.sender === 'agent' ? 'bg-orange-100' : 'bg-gray-100'
                        }`}>
                          <p className="text-sm text-gray-900">{message.message}</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {message.senderName} • {new Date(message.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200">
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Type your message..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <PaperAirplaneIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <ChatBubbleLeftRightIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a ticket to start chatting</h3>
                  <p className="text-gray-600">Choose a support ticket from the list to view and respond to customer messages.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
