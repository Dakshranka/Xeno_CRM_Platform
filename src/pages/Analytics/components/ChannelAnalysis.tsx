import React from 'react';
import { useCampaigns } from '../../../contexts/CampaignContext';
import { Mail, MessageSquare, Bell, TrendingUp } from 'lucide-react';

interface ChannelAnalysisProps {
  dateRange: string;
}

export const ChannelAnalysis: React.FC<ChannelAnalysisProps> = ({ dateRange }) => {
  const { campaigns } = useCampaigns();

  const channelData = campaigns.reduce((acc, campaign) => {
    if (!acc[campaign.type]) {
      acc[campaign.type] = {
        count: 0,
        totalSent: 0,
        totalOpened: 0,
        totalClicked: 0,
        avgOpenRate: 0,
        avgClickRate: 0
      };
    }
    
    acc[campaign.type].count++;
    acc[campaign.type].totalSent += campaign.audienceSize;
    acc[campaign.type].totalOpened += campaign.audienceSize * (campaign.openRate / 100);
    acc[campaign.type].totalClicked += campaign.audienceSize * (campaign.clickRate / 100);
    
    return acc;
  }, {} as Record<string, any>);

  // Calculate averages
  Object.keys(channelData).forEach(channel => {
    const data = channelData[channel];
    data.avgOpenRate = (data.totalOpened / data.totalSent) * 100;
    data.avgClickRate = (data.totalClicked / data.totalSent) * 100;
  });

  const getChannelIcon = (type: string) => {
    switch (type) {
      case 'email': return Mail;
      case 'sms': return MessageSquare;
      case 'push': return Bell;
      default: return Mail;
    }
  };

  const getChannelColor = (type: string) => {
    switch (type) {
      case 'email': return 'bg-indigo-500';
      case 'sms': return 'bg-green-500';
      case 'push': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const channels = Object.entries(channelData);
  const totalSent = channels.reduce((sum, [, data]) => sum + data.totalSent, 0);

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5 text-gray-700" />
          <h3 className="text-lg font-semibold text-gray-900">Channel Performance</h3>
        </div>
      </div>
      
      <div className="p-6">
        <div className="space-y-6">
          {/* Channel Distribution */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Message Distribution</h4>
            <div className="space-y-3">
              {channels.map(([type, data]) => {
                const Icon = getChannelIcon(type);
                const percentage = (data.totalSent / totalSent) * 100;
                
                return (
                  <div key={type} className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-lg ${getChannelColor(type)} flex items-center justify-center`}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900 capitalize">{type}</span>
                        <span className="text-sm text-gray-600">
                          {data.totalSent.toLocaleString()} ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${getChannelColor(type)}`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Performance Comparison */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Engagement Rates</h4>
            <div className="space-y-4">
              {channels.map(([type, data]) => {
                const Icon = getChannelIcon(type);
                
                return (
                  <div key={type} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className={`w-6 h-6 rounded ${getChannelColor(type)} flex items-center justify-center`}>
                        <Icon className="h-3 w-3 text-white" />
                      </div>
                      <span className="text-sm font-medium text-gray-900 capitalize">{type}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-lg font-bold text-gray-900">
                          {data.avgOpenRate.toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-500">Open Rate</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-gray-900">
                          {data.avgClickRate.toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-500">Click Rate</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Best Performing Channel */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200 p-4">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-900">Top Performer</span>
            </div>
            <p className="text-sm text-green-800">
              Email campaigns are showing the highest engagement with an average open rate of{' '}
              {channelData.email ? channelData.email.avgOpenRate.toFixed(1) : 'N/A'}% 
              this {dateRange === '7d' ? 'week' : 'period'}.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};