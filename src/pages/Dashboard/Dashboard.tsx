import React from 'react';
import { StatsGrid } from './components/StatsGrid';
import { CampaignOverview } from './components/CampaignOverview';
import { RecentActivity } from './components/RecentActivity';
import { PerformanceChart } from './components/PerformanceChart';
import { AudienceInsights } from './components/AudienceInsights';

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      <StatsGrid />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <PerformanceChart />
          <CampaignOverview />
        </div>
        <div className="space-y-6">
          <AudienceInsights />
          <RecentActivity />
        </div>
      </div>
    </div>
  );
};