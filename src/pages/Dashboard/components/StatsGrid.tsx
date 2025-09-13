import React from 'react';
import { useCampaigns } from '../../../contexts/CampaignContext';
import { useData } from '../../../contexts/DataContext';
import { TrendingUp, Users, Send, Target } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, trend, icon: Icon, color }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        <div className="flex items-center mt-2">
          <TrendingUp className={`h-4 w-4 mr-1 ${trend === 'up' ? 'text-green-500' : 'text-red-500'} ${trend === 'down' && 'rotate-180'}`} />
          <span className={`text-sm font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {change}
          </span>
          <span className="text-sm text-gray-500 ml-1">from last month</span>
        </div>
      </div>
      <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
    </div>
  </div>
);

export const StatsGrid: React.FC = () => {
  const { campaigns } = useCampaigns();
  const { getAudienceInsights } = useData();
  
  const insights = getAudienceInsights();
  const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
  const totalSent = campaigns.reduce((sum, c) => sum + c.audienceSize * (c.deliveryRate / 100), 0);
  const avgEngagement = campaigns.reduce((sum, c) => sum + (c.openRate + c.clickRate), 0) / campaigns.length / 2;

  const stats = [
    {
      title: 'Total Audience',
      value: insights.totalRecords.toLocaleString(),
      change: '+12.5%',
      trend: 'up' as const,
      icon: Users,
      color: 'bg-gradient-to-r from-blue-500 to-blue-600'
    },
    {
      title: 'Active Campaigns',
      value: activeCampaigns.toString(),
      change: '+3.2%',
      trend: 'up' as const,
      icon: Target,
      color: 'bg-gradient-to-r from-green-500 to-green-600'
    },
    {
      title: 'Messages Sent',
      value: Math.round(totalSent).toLocaleString(),
      change: '+28.4%',
      trend: 'up' as const,
      icon: Send,
      color: 'bg-gradient-to-r from-indigo-500 to-indigo-600'
    },
    {
      title: 'Engagement Rate',
      value: `${avgEngagement.toFixed(1)}%`,
      change: '+5.7%',
      trend: 'up' as const,
      icon: TrendingUp,
      color: 'bg-gradient-to-r from-purple-500 to-purple-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </div>
  );
};