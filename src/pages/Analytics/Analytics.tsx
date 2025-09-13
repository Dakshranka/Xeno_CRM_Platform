import React, { useState, lazy, Suspense } from 'react';
import { OverviewMetrics } from './components/OverviewMetrics';
import { PerformanceChart, PerformanceStats } from './components/PerformanceChart';
import { AudienceInsights } from './components/AudienceInsights';
import { CampaignComparison } from './components/CampaignComparison';
import { ExportReports } from './components/ExportReports';
import { BarChart3, Users, Zap, FileText, Calendar } from 'lucide-react';

const AIInsights = lazy(() =>
  import('./components/AIInsights').then((module) => ({ default: module.AIInsights }))
);

type TabType = 'overview' | 'campaigns' | 'audience' | 'reports';

export const Analytics: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [dateRange, setDateRange] = useState('7d');
  const [performanceStats, setPerformanceStats] = useState<PerformanceStats | null>(null);

  const tabs = [
    { id: 'overview' as TabType, name: 'Overview', icon: BarChart3 },
    { id: 'campaigns' as TabType, name: 'Campaigns', icon: Zap },
    { id: 'audience' as TabType, name: 'Audience', icon: Users },
    { id: 'reports' as TabType, name: 'Reports', icon: FileText },
  ];

  const dateRanges = [
    { value: '1d', label: 'Last 24 hours' },
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
    { value: 'custom', label: 'Custom range' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <OverviewMetrics dateRange={dateRange} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PerformanceChart dateRange={dateRange} onStats={setPerformanceStats} />
              {performanceStats && (
                <Suspense fallback={<div>Loading AI Insights...</div>}>
                  <AIInsights stats={performanceStats} />
                </Suspense>
              )}
            </div>
          </div>
        );
      case 'campaigns':
        return <CampaignComparison dateRange={dateRange} />;
      case 'audience':
        return <AudienceInsights dateRange={dateRange} />;
      case 'reports':
        return <ExportReports />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Track performance and gain insights from your campaigns
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {dateRanges.map((range) => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                </div>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">{renderTabContent()}</div>
      </div>
    </div>
  );
};
