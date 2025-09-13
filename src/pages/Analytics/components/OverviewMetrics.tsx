import React from 'react';
import { useCampaigns } from '../../../contexts/CampaignContext';
import { useData } from '../../../contexts/DataContext';
import { TrendingUp, TrendingDown, Send, Eye, MousePointer, Users } from 'lucide-react';

interface OverviewMetricsProps {
  dateRange: string;
}

export const OverviewMetrics: React.FC<OverviewMetricsProps> = ({ dateRange }) => {
  const { campaigns } = useCampaigns();
  const { dataRecords } = useData();

  // Calculate metrics based on date range
  const totalSent = campaigns.reduce((sum, c) => sum + c.audienceSize, 0);
  const avgDeliveryRate = campaigns.reduce((sum, c) => sum + c.deliveryRate, 0) / campaigns.length;
  const avgOpenRate = campaigns.reduce((sum, c) => sum + c.openRate, 0) / campaigns.length;
  const avgClickRate = campaigns.reduce((sum, c) => sum + c.clickRate, 0) / campaigns.length;

  const metrics = [
    {
      title: 'Messages Sent',
      value: totalSent.toLocaleString(),
      change: '+15.2%',
      trend: 'up' as const,
      icon: Send,
      color: 'bg-blue-500'
    },
    {
      title: 'Delivery Rate',
      value: `${avgDeliveryRate.toFixed(1)}%`,
      change: '+2.1%',
      trend: 'up' as const,
      icon: TrendingUp,
      color: 'bg-green-500'
    },
    {
      title: 'Open Rate',
      value: `${avgOpenRate.toFixed(1)}%`,
      change: '+8.7%',
      trend: 'up' as const,
      icon: Eye,
      color: 'bg-purple-500'
    },
    {
      title: 'Click Rate',
      value: `${avgClickRate.toFixed(1)}%`,
      change: '-1.3%',
      trend: 'down' as const,
      icon: MousePointer,
      color: 'bg-indigo-500'
    },
    {
      title: 'Total Audience',
      value: dataRecords.length.toLocaleString(),
      change: '+12.4%',
      trend: 'up' as const,
      icon: Users,
      color: 'bg-emerald-500'
    },
    {
      title: 'Revenue Attribution',
      value: '$47,892',
      change: '+23.8%',
      trend: 'up' as const,
      icon: TrendingUp,
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {metrics.map((metric) => (
        <div key={metric.title} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 rounded-lg ${metric.color} flex items-center justify-center`}>
              <metric.icon className="h-6 w-6 text-white" />
            </div>
            <div className={`flex items-center space-x-1 text-sm font-medium ${
              metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
              {metric.trend === 'up' ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              <span>{metric.change}</span>
            </div>
          </div>
          
          <div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {metric.value}
            </div>
            <div className="text-sm text-gray-600">
              {metric.title}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>vs previous {dateRange === '7d' ? 'week' : 'period'}</span>
              <span>
                {metric.trend === 'up' ? '↗' : '↘'} {metric.change}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};