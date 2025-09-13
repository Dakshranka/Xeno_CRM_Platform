import React, { useState } from 'react';
import { useCampaigns } from '../../../contexts/CampaignContext';
import { BarChart3, Mail, MessageSquare, Bell, TrendingUp, TrendingDown } from 'lucide-react';

interface CampaignComparisonProps {
  dateRange: string;
}

export const CampaignComparison: React.FC<CampaignComparisonProps> = ({ dateRange }) => {
  const { campaigns } = useCampaigns();
  const [sortBy, setSortBy] = useState<'openRate' | 'clickRate' | 'deliveryRate' | 'audienceSize'>('openRate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const sortedCampaigns = [...campaigns].sort((a, b) => {
    const modifier = sortOrder === 'desc' ? -1 : 1;
    return (a[sortBy] - b[sortBy]) * modifier;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email': return Mail;
      case 'sms': return MessageSquare;
      case 'push': return Bell;
      default: return Mail;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'email': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'sms': return 'bg-green-100 text-green-800 border-green-200';
      case 'push': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSort = (column: typeof sortBy) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const getSortIcon = (column: typeof sortBy) => {
    if (sortBy !== column) return null;
    return sortOrder === 'desc' ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />;
  };

  return (
    <div className="space-y-6">
      {/* Performance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
          <div className="text-2xl font-bold">
            {campaigns.length}
          </div>
          <div className="text-sm opacity-90">Total Campaigns</div>
          <div className="text-xs opacity-75 mt-1">Last {dateRange}</div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
          <div className="text-2xl font-bold">
            {(campaigns.reduce((sum, c) => sum + c.openRate, 0) / campaigns.length).toFixed(1)}%
          </div>
          <div className="text-sm opacity-90">Avg Open Rate</div>
          <div className="text-xs opacity-75 mt-1">+5.2% vs last period</div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
          <div className="text-2xl font-bold">
            {(campaigns.reduce((sum, c) => sum + c.clickRate, 0) / campaigns.length).toFixed(1)}%
          </div>
          <div className="text-sm opacity-90">Avg Click Rate</div>
          <div className="text-xs opacity-75 mt-1">+1.8% vs last period</div>
        </div>
        
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-4 text-white">
          <div className="text-2xl font-bold">
            {campaigns.reduce((sum, c) => sum + c.audienceSize, 0).toLocaleString()}
          </div>
          <div className="text-sm opacity-90">Total Reach</div>
          <div className="text-xs opacity-75 mt-1">+18.9% vs last period</div>
        </div>
      </div>

      {/* Campaign Comparison Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-gray-700" />
            <h3 className="text-lg font-semibold text-gray-900">Campaign Performance</h3>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Campaign
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('audienceSize')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Audience</span>
                    {getSortIcon('audienceSize')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('deliveryRate')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Delivery</span>
                    {getSortIcon('deliveryRate')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('openRate')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Open Rate</span>
                    {getSortIcon('openRate')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('clickRate')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Click Rate</span>
                    {getSortIcon('clickRate')}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performance
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedCampaigns.map((campaign, index) => {
                const TypeIcon = getTypeIcon(campaign.type);
                const performanceScore = (campaign.openRate + campaign.clickRate) / 2;
                
                return (
                  <tr key={campaign.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${getTypeColor(campaign.type)}`}>
                          <TypeIcon className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                            {campaign.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(campaign.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getTypeColor(campaign.type)}`}>
                        {campaign.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                        {campaign.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {campaign.audienceSize.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-sm text-gray-900 w-12">{campaign.deliveryRate}%</span>
                        <div className="ml-2 flex-1 max-w-16">
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div 
                              className="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
                              style={{ width: `${campaign.deliveryRate}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-sm text-gray-900 w-12">{campaign.openRate}%</span>
                        <div className="ml-2 flex-1 max-w-16">
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div 
                              className="bg-green-500 h-1.5 rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(campaign.openRate * 2, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-sm text-gray-900 w-12">{campaign.clickRate}%</span>
                        <div className="ml-2 flex-1 max-w-16">
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div 
                              className="bg-purple-500 h-1.5 rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(campaign.clickRate * 8, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className={`text-sm font-medium ${
                          performanceScore >= 15 ? 'text-green-600' :
                          performanceScore >= 10 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {performanceScore >= 15 ? 'Excellent' :
                           performanceScore >= 10 ? 'Good' : 'Needs Improvement'}
                        </span>
                        {index < 3 && (
                          <div className="ml-2">
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Top {index + 1}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Top Performers</h4>
          <div className="space-y-4">
            {sortedCampaigns.slice(0, 3).map((campaign, index) => {
              const TypeIcon = getTypeIcon(campaign.type);
              
              return (
                <div key={campaign.id} className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className={`w-6 h-6 rounded flex items-center justify-center text-white font-bold text-xs ${
                      index === 0 ? 'bg-yellow-500' :
                      index === 1 ? 'bg-gray-400' :
                      'bg-orange-600'
                    }`}>
                      {index + 1}
                    </div>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${getTypeColor(campaign.type)}`}>
                      <TypeIcon className="h-4 w-4" />
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {campaign.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {campaign.openRate}% open • {campaign.clickRate}% click
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm font-medium text-green-600">
                      {((campaign.openRate + campaign.clickRate) / 2).toFixed(1)} score
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Channel Breakdown</h4>
          <div className="space-y-4">
            {Object.entries(
              campaigns.reduce((acc, campaign) => {
                if (!acc[campaign.type]) {
                  acc[campaign.type] = { count: 0, totalAudience: 0, avgOpen: 0, avgClick: 0 };
                }
                acc[campaign.type].count++;
                acc[campaign.type].totalAudience += campaign.audienceSize;
                acc[campaign.type].avgOpen += campaign.openRate;
                acc[campaign.type].avgClick += campaign.clickRate;
                return acc;
              }, {} as Record<string, any>)
            ).map(([type, data]) => {
              const TypeIcon = getTypeIcon(type);
              const avgOpen = (data.avgOpen / data.count).toFixed(1);
              const avgClick = (data.avgClick / data.count).toFixed(1);
              
              return (
                <div key={type} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${getTypeColor(type)}`}>
                    <TypeIcon className="h-5 w-5" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900 capitalize">{type}</div>
                    <div className="text-xs text-gray-500">
                      {data.count} campaigns • {data.totalAudience.toLocaleString()} total reach
                    </div>
                  </div>
                  
                  <div className="text-right text-sm">
                    <div className="text-gray-900 font-medium">{avgOpen}% / {avgClick}%</div>
                    <div className="text-xs text-gray-500">Open / Click</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* AI Recommendations */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <TrendingUp className="h-5 w-5 text-purple-600" />
          <h4 className="text-lg font-semibold text-purple-900">AI Performance Insights</h4>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <p className="text-sm font-medium text-purple-900">Best Performing Strategy</p>
                <p className="text-sm text-purple-700">
                  Email campaigns sent on Tuesday afternoons show 34% higher engagement rates.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <p className="text-sm font-medium text-purple-900">Optimization Opportunity</p>
                <p className="text-sm text-purple-700">
                  Your SMS campaigns could benefit from shorter messages (under 120 characters).
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <p className="text-sm font-medium text-purple-900">Audience Insight</p>
                <p className="text-sm text-purple-700">
                  High-value segment shows 67% better conversion rates than general audience.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <p className="text-sm font-medium text-purple-900">Growth Potential</p>
                <p className="text-sm text-purple-700">
                  A/B testing subject lines could improve open rates by an estimated 15-25%.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};