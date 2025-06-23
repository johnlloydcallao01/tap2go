'use client';

// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import {
  DocumentChartBarIcon,
  PlusIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CalendarIcon,
  ClockIcon,
  FunnelIcon,
  ChartBarIcon,
  TableCellsIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';

interface CustomReport {
  id: string;
  name: string;
  description: string;
  type: 'chart' | 'table' | 'dashboard' | 'export';
  category: 'sales' | 'users' | 'operations' | 'financial' | 'marketing';
  status: 'active' | 'draft' | 'scheduled';
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string;
    recipients: string[];
  };
  filters: {
    dateRange: string;
    restaurants?: string[];
    categories?: string[];
    userSegments?: string[];
  };
  metrics: string[];
  lastRun?: string;
  nextRun?: string;
  createdAt: string;
  createdBy: string;
  runCount: number;
}

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  metrics: string[];
  defaultFilters: Record<string, unknown>;
  usageCount: number;
}

export default function AdminCustomReports() {
  const [customReports, setCustomReports] = useState<CustomReport[]>([]);
  const [reportTemplates, setReportTemplates] = useState<ReportTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'reports' | 'templates'>('reports');

  useEffect(() => {
    const loadCustomReports = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));

        const mockCustomReports: CustomReport[] = [
          {
            id: 'report_001',
            name: 'Weekly Sales Performance',
            description: 'Comprehensive weekly sales analysis with restaurant breakdown',
            type: 'dashboard',
            category: 'sales',
            status: 'active',
            schedule: {
              frequency: 'weekly',
              time: '09:00',
              recipients: ['manager@tap2go.com', 'sales@tap2go.com'],
            },
            filters: {
              dateRange: '7d',
              restaurants: ['Pizza Palace', 'Burger Barn', 'Sushi Zen'],
            },
            metrics: ['revenue', 'orders', 'aov', 'commission'],
            lastRun: '2024-01-15T09:00:00Z',
            nextRun: '2024-01-22T09:00:00Z',
            createdAt: '2023-12-01T10:00:00Z',
            createdBy: 'John Smith',
            runCount: 24,
          },
          {
            id: 'report_002',
            name: 'Customer Retention Analysis',
            description: 'Monthly user retention and churn analysis by segments',
            type: 'chart',
            category: 'users',
            status: 'active',
            schedule: {
              frequency: 'monthly',
              time: '08:00',
              recipients: ['marketing@tap2go.com'],
            },
            filters: {
              dateRange: '30d',
              userSegments: ['new_users', 'regular_users', 'vip_users'],
            },
            metrics: ['retention_rate', 'churn_rate', 'ltv', 'engagement'],
            lastRun: '2024-01-01T08:00:00Z',
            nextRun: '2024-02-01T08:00:00Z',
            createdAt: '2023-11-15T14:30:00Z',
            createdBy: 'Lisa Wilson',
            runCount: 3,
          },
          {
            id: 'report_003',
            name: 'Delivery Performance Metrics',
            description: 'Daily operational metrics for delivery performance',
            type: 'table',
            category: 'operations',
            status: 'active',
            schedule: {
              frequency: 'daily',
              time: '07:00',
              recipients: ['operations@tap2go.com', 'logistics@tap2go.com'],
            },
            filters: {
              dateRange: '1d',
            },
            metrics: ['delivery_time', 'success_rate', 'driver_utilization', 'customer_satisfaction'],
            lastRun: '2024-01-15T07:00:00Z',
            nextRun: '2024-01-16T07:00:00Z',
            createdAt: '2023-10-20T11:15:00Z',
            createdBy: 'David Brown',
            runCount: 87,
          },
          {
            id: 'report_004',
            name: 'Marketing Campaign ROI',
            description: 'Campaign performance analysis with ROI calculations',
            type: 'export',
            category: 'marketing',
            status: 'draft',
            filters: {
              dateRange: '30d',
            },
            metrics: ['campaign_reach', 'conversion_rate', 'roi', 'cost_per_acquisition'],
            createdAt: '2024-01-10T16:45:00Z',
            createdBy: 'Emily Rodriguez',
            runCount: 0,
          },
          {
            id: 'report_005',
            name: 'Financial Summary Report',
            description: 'Monthly financial overview with revenue breakdown',
            type: 'dashboard',
            category: 'financial',
            status: 'scheduled',
            schedule: {
              frequency: 'monthly',
              time: '10:00',
              recipients: ['finance@tap2go.com', 'ceo@tap2go.com'],
            },
            filters: {
              dateRange: '30d',
            },
            metrics: ['gross_revenue', 'net_revenue', 'commission', 'refunds', 'profit_margin'],
            nextRun: '2024-02-01T10:00:00Z',
            createdAt: '2023-12-15T13:20:00Z',
            createdBy: 'Mike Chen',
            runCount: 2,
          },
        ];

        const mockReportTemplates: ReportTemplate[] = [
          {
            id: 'template_001',
            name: 'Restaurant Performance Dashboard',
            description: 'Standard restaurant performance metrics and KPIs',
            category: 'Sales',
            metrics: ['revenue', 'orders', 'aov', 'rating', 'delivery_time'],
            defaultFilters: { dateRange: '7d', groupBy: 'restaurant' },
            usageCount: 45,
          },
          {
            id: 'template_002',
            name: 'User Acquisition Report',
            description: 'New user acquisition and onboarding metrics',
            category: 'Marketing',
            metrics: ['new_users', 'acquisition_cost', 'conversion_rate', 'first_order_rate'],
            defaultFilters: { dateRange: '30d', groupBy: 'channel' },
            usageCount: 23,
          },
          {
            id: 'template_003',
            name: 'Operational Efficiency Report',
            description: 'Delivery and operational performance metrics',
            category: 'Operations',
            metrics: ['fulfillment_rate', 'delivery_time', 'driver_efficiency', 'order_accuracy'],
            defaultFilters: { dateRange: '1d', groupBy: 'zone' },
            usageCount: 67,
          },
          {
            id: 'template_004',
            name: 'Financial Performance Summary',
            description: 'Revenue, costs, and profitability analysis',
            category: 'Financial',
            metrics: ['revenue', 'costs', 'profit', 'margin', 'commission'],
            defaultFilters: { dateRange: '30d', groupBy: 'category' },
            usageCount: 34,
          },
        ];

        setCustomReports(mockCustomReports);
        setReportTemplates(mockReportTemplates);
      } catch (error) {
        console.error('Error loading custom reports:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCustomReports();
  }, []);

  const filteredReports = customReports.filter(report => {
    const matchesSearch = 
      report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || report.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || report.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusBadge = (status: CustomReport['status']) => {
    const badges = {
      active: 'bg-green-100 text-green-800',
      draft: 'bg-gray-100 text-gray-800',
      scheduled: 'bg-blue-100 text-blue-800',
    };
    
    return badges[status] || badges.draft;
  };

  const getTypeIcon = (type: CustomReport['type']) => {
    const icons = {
      chart: ChartBarIcon,
      table: TableCellsIcon,
      dashboard: DocumentChartBarIcon,
      export: DocumentTextIcon,
    };
    
    return icons[type] || DocumentChartBarIcon;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      sales: 'bg-green-100 text-green-800',
      users: 'bg-blue-100 text-blue-800',
      operations: 'bg-purple-100 text-purple-800',
      financial: 'bg-yellow-100 text-yellow-800',
      marketing: 'bg-pink-100 text-pink-800',
    };
    
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const runReport = (reportId: string) => {
    setCustomReports(prev => 
      prev.map(report => 
        report.id === reportId 
          ? { 
              ...report, 
              lastRun: new Date().toISOString(),
              runCount: report.runCount + 1 
            } 
          : report
      )
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
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
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Custom Reports</h1>
          <p className="text-sm lg:text-base text-gray-600">Create, schedule, and manage custom reports and analytics.</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 flex items-center text-sm"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Create Report
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DocumentChartBarIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Reports</p>
              <p className="text-lg font-semibold text-gray-900">{customReports.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <ClockIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Active Reports</p>
              <p className="text-lg font-semibold text-gray-900">
                {customReports.filter(r => r.status === 'active').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <CalendarIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Scheduled</p>
              <p className="text-lg font-semibold text-gray-900">
                {customReports.filter(r => r.schedule).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <ArrowDownTrayIcon className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Runs</p>
              <p className="text-lg font-semibold text-gray-900">
                {customReports.reduce((sum, r) => sum + r.runCount, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow border">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { id: 'reports', name: 'Custom Reports', icon: DocumentChartBarIcon },
              { id: 'templates', name: 'Templates', icon: DocumentTextIcon },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'reports' | 'templates')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <div className="space-y-6">
              {/* Filters */}
              <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search reports by name or description..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                </div>

                {/* Category Filter */}
                <div className="flex items-center space-x-2">
                  <FunnelIcon className="h-5 w-5 text-gray-400" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="all">All Categories</option>
                    <option value="sales">Sales</option>
                    <option value="users">Users</option>
                    <option value="operations">Operations</option>
                    <option value="financial">Financial</option>
                    <option value="marketing">Marketing</option>
                  </select>
                </div>

                {/* Status Filter */}
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="scheduled">Scheduled</option>
                </select>
              </div>

              {/* Reports List */}
              <div className="space-y-4">
                {filteredReports.map((report) => {
                  const TypeIcon = getTypeIcon(report.type);
                  return (
                    <div key={report.id} className="bg-white border rounded-lg p-6 hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start space-x-4">
                          <div className="p-3 bg-orange-100 rounded-lg">
                            <TypeIcon className="h-6 w-6 text-orange-600" />
                          </div>
                          <div>
                            <h4 className="text-lg font-medium text-gray-900">{report.name}</h4>
                            <p className="text-sm text-gray-600 mb-2">{report.description}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>Created by {report.createdBy}</span>
                              <span>•</span>
                              <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                              <span>•</span>
                              <span>Run {report.runCount} times</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <span className={`px-3 py-1 text-sm font-medium rounded-full ${getCategoryColor(report.category)}`}>
                            {report.category.charAt(0).toUpperCase() + report.category.slice(1)}
                          </span>
                          <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusBadge(report.status)}`}>
                            {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                          </span>
                        </div>
                      </div>

                      {/* Report Details */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Type & Metrics</p>
                          <p className="text-sm text-gray-900 capitalize">{report.type} Report</p>
                          <p className="text-xs text-gray-500">{report.metrics.length} metrics tracked</p>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-gray-600">Schedule</p>
                          {report.schedule ? (
                            <div>
                              <p className="text-sm text-gray-900 capitalize">{report.schedule.frequency}</p>
                              <p className="text-xs text-gray-500">at {report.schedule.time}</p>
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500">Manual run only</p>
                          )}
                        </div>

                        <div>
                          <p className="text-sm font-medium text-gray-600">Last Run</p>
                          {report.lastRun ? (
                            <div>
                              <p className="text-sm text-gray-900">
                                {new Date(report.lastRun).toLocaleDateString()}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(report.lastRun).toLocaleTimeString()}
                              </p>
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500">Never run</p>
                          )}
                        </div>
                      </div>

                      {/* Metrics Tags */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {report.metrics.slice(0, 5).map((metric, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {metric.replace('_', ' ')}
                          </span>
                        ))}
                        {report.metrics.length > 5 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            +{report.metrics.length - 5} more
                          </span>
                        )}
                      </div>

                      {/* Schedule Info */}
                      {report.schedule && (
                        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-center space-x-4 text-sm">
                            <CalendarIcon className="h-4 w-4 text-blue-500" />
                            <span className="text-blue-700">
                              Scheduled {report.schedule.frequency} at {report.schedule.time}
                            </span>
                            {report.nextRun && (
                              <span className="text-blue-600">
                                Next run: {new Date(report.nextRun).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          <div className="mt-2 text-xs text-blue-600">
                            Recipients: {report.schedule.recipients.join(', ')}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => runReport(report.id)}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded text-white bg-orange-600 hover:bg-orange-700"
                        >
                          <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                          Run Now
                        </button>
                        <button className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50">
                          <EyeIcon className="h-4 w-4 mr-1" />
                          View
                        </button>
                        <button className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50">
                          <PencilIcon className="h-4 w-4 mr-1" />
                          Edit
                        </button>
                        <button className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded text-white bg-red-600 hover:bg-red-700">
                          <TrashIcon className="h-4 w-4 mr-1" />
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredReports.length === 0 && (
                <div className="p-12 text-center">
                  <DocumentChartBarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No reports found</h3>
                  <p className="text-gray-600 mb-4">Try adjusting your search or filter criteria.</p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600"
                  >
                    Create Your First Report
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Templates Tab */}
          {activeTab === 'templates' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Report Templates</h3>
                <button className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 flex items-center text-sm">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Create Template
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {reportTemplates.map((template) => (
                  <div key={template.id} className="bg-white border rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">{template.name}</h4>
                        <p className="text-sm text-gray-600">{template.description}</p>
                      </div>
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        Used {template.usageCount} times
                      </span>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Category:</p>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(template.category.toLowerCase())}`}>
                        {template.category}
                      </span>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Metrics ({template.metrics.length}):</p>
                      <div className="flex flex-wrap gap-1">
                        {template.metrics.slice(0, 4).map((metric, index) => (
                          <span key={index} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                            {metric.replace('_', ' ')}
                          </span>
                        ))}
                        {template.metrics.length > 4 && (
                          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                            +{template.metrics.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <button className="flex-1 bg-orange-100 text-orange-700 px-3 py-2 rounded text-sm hover:bg-orange-200">
                        Use Template
                      </button>
                      <button className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm hover:bg-gray-200">
                        <PencilIcon className="h-4 w-4 inline mr-1" />
                        Edit
                      </button>
                      <button className="flex-1 bg-red-100 text-red-700 px-3 py-2 rounded text-sm hover:bg-red-200">
                        <TrashIcon className="h-4 w-4 inline mr-1" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Modal Placeholder */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Report</h3>
            <p className="text-gray-600 mb-4">Report creation functionality will be implemented here.</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-white bg-orange-500 rounded-md hover:bg-orange-600"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
