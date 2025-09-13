import React from 'react';
import { CampaignContext } from '../../../contexts/CampaignContext';
import { useData } from '../../../contexts/DataContext';
import { Users, Brain, TrendingUp, Smartphone, Clock } from 'lucide-react';

type AudienceInsightsProps = object;

export const AudienceInsights: React.FC<AudienceInsightsProps> = () => {
  const { getAudienceInsights, dataRecords } = useData();
  const [realtimeStats, setRealtimeStats] = React.useState({ sent: 0, opened: 0, clicked: 0, avgOpenRate: 0, avgClickRate: 0, avgEngagementRate: 0, graphData: [] });
  // Replace with actual campaignId from context or props
  const { selectedCampaignId = '' } = React.useContext(CampaignContext) || {};
  const campaignId = selectedCampaignId;
  React.useEffect(() => {
    if (!campaignId) return;
    const fetchStats = async () => {
      try {
        const res = await fetch(`/api/campaigns/${campaignId}/realtime-stats`);
        if (res.ok) {
          const stats = await res.json();
          setRealtimeStats(stats);
        }
      } catch (err) {
        console.error('Failed to fetch real-time campaign stats:', err);
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 5000); // Poll every 5s
    // Listen for instant refresh event
    const handler = () => fetchStats();
    window.addEventListener('refreshAnalytics', handler);
    return () => {
      clearInterval(interval);
      window.removeEventListener('refreshAnalytics', handler);
    };
  }, [campaignId]);
  // Defensive: filter out undefined/null records and attributes (keep for other calculations if needed)
  // const safeRecords = Array.isArray(dataRecords)
  //   ? dataRecords.filter(r => r && r.attributes && typeof r.attributes === 'object')
  //   : [];
  // Use real-time graphData from backend
  type GraphDataPoint = {
    day: string;
    delivered: number;
    opened: number;
    clicked: number;
  };
  const chartData: GraphDataPoint[] = Array.isArray(realtimeStats.graphData) ? realtimeStats.graphData : [];
  const maxTotal = chartData.length > 0 ? Math.max(...chartData.map(d => d.delivered)) : 0;
  const insights = typeof getAudienceInsights === 'function' ? getAudienceInsights() : null;

  // Example: Compute demographics from real dataRecords (replace with real logic as needed)
  const demographicData = React.useMemo(() => {
    // Suppose dataRecords have an 'age' field
    const ageGroups = [
      { label: 'Age 18-24', min: 18, max: 24, color: 'bg-blue-500' },
      { label: 'Age 25-34', min: 25, max: 34, color: 'bg-green-500' },
      { label: 'Age 35-44', min: 35, max: 44, color: 'bg-purple-500' },
      { label: 'Age 45-54', min: 45, max: 54, color: 'bg-orange-500' },
      { label: 'Age 55+', min: 55, max: 200, color: 'bg-red-500' }
    ];
    const counts = ageGroups.map(group => ({
      label: group.label,
      value: dataRecords.filter(r => {
        if (!r || !r.attributes) return false;
        const age = r.attributes.age;
        return age !== null && age !== undefined && !isNaN(Number(age)) && Number(age) >= group.min && Number(age) <= group.max;
      }).length,
      color: group.color
    }));
    return counts;
  }, [dataRecords]);

  // Example: Compute device usage from real dataRecords (replace with real logic as needed)
  const deviceData = React.useMemo(() => {
    const devices = ['Mobile', 'Desktop', 'Tablet'];
    return devices.map(label => ({
      label,
      value: dataRecords.filter(r => r && r.attributes && r.attributes.device === label.toLowerCase()).length,
      icon: label === 'Mobile' ? Smartphone : Users
    }));
  }, [dataRecords]);

  // Example: Compute engagement times from real dataRecords (replace with real logic as needed)
  const engagementTimes = React.useMemo(() => {
    // Suppose dataRecords have an 'engagementTime' field (hour of day)
    const times = ['9 AM', '12 PM', '2 PM', '5 PM', '8 PM', '10 PM'];
    return times.map(time => ({
      time,
      engagement: dataRecords.filter(r => r && r.attributes && r.attributes.engagementTime === time).length
    }));
  }, [dataRecords]);

  const maxEngagement = engagementTimes.length > 0 ? Math.max(...engagementTimes.map(t => t.engagement)) : 0;

  return (
  <div className="space-y-6" style={{ minHeight: 700, maxHeight: 700, overflowY: 'auto' }}>
      {/* Audience Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900">Total Audience</h4>
              <p className="text-sm text-gray-600">All active contacts</p>
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {realtimeStats.sent.toLocaleString()}
          </div>
          <div className="flex items-center space-x-1 mt-2 text-sm text-green-600">
            <TrendingUp className="h-4 w-4" />
            <span>+12.5% this month</span>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900">Engagement Rate</h4>
              <p className="text-sm text-gray-600">Average across channels</p>
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {(realtimeStats.avgEngagementRate * 100).toFixed(1)}%
          </div>
          <div className="flex items-center space-x-1 mt-2 text-sm text-green-600">
            <TrendingUp className="h-4 w-4" />
            <span>+5.7% this month</span>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Brain className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900">AI Score</h4>
              <p className="text-sm text-gray-600">Data quality rating</p>
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900">{(realtimeStats.avgOpenRate * 100).toFixed(1)}%</div>
          <div className="flex items-center space-x-1 mt-2 text-sm text-green-600">
            <TrendingUp className="h-4 w-4" />
            <span>+3 points this week</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Segment Distribution */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Audience Segments</h4>
          <div className="space-y-4">
            {insights?.topSegments?.map((segment, index) => (
              <div key={segment.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    index === 0 ? 'bg-blue-500' : 
                    index === 1 ? 'bg-green-500' : 
                    index === 2 ? 'bg-purple-500' : 
                    index === 3 ? 'bg-orange-500' : 'bg-gray-400'
                  }`}></div>
                  <span className="text-sm font-medium text-gray-900 capitalize">
                    {segment.name}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600">
                    {segment.count.toLocaleString()}
                  </span>
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        index === 0 ? 'bg-blue-500' : 
                        index === 1 ? 'bg-green-500' : 
                        index === 2 ? 'bg-purple-500' : 
                        index === 3 ? 'bg-orange-500' : 'bg-gray-400'
                      }`}
                      style={{ width: `${(segment.count / (insights?.totalRecords ?? 1)) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500 w-8 text-right">
                    {((segment.count / (insights?.totalRecords ?? 1)) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Normalized Analytics Chart */}
        <div className="w-full flex items-end justify-between space-x-2 h-80 mb-8">
          {chartData.map((d) => {
            const total = d.delivered + d.opened + d.clicked;
            // Normalize bar height
            const barHeight = maxTotal > 0 ? (d.delivered / maxTotal) * 200 : 0; // 200px max bar height
            const openedHeight = total > 0 ? (d.opened / total) * barHeight : 0;
            const clickedHeight = total > 0 ? (d.clicked / total) * barHeight : 0;
            const deliveredHeight = barHeight - openedHeight - clickedHeight;
            return (
              <div key={d.day} className="flex-1 flex flex-col items-center h-full justify-end">
                <div className="w-full flex flex-col justify-end" style={{ height: 200 }}>
                  <div className="w-full bg-blue-500 rounded-t-sm transition-all duration-500 hover:bg-blue-600 cursor-pointer group relative" title={`Delivered: ${d.delivered}`} style={{ height: deliveredHeight }}></div>
                  <div className="w-full bg-green-500 transition-all duration-500 hover:bg-green-600 cursor-pointer group relative" title={`Opened: ${d.opened}`} style={{ height: openedHeight }}></div>
                  <div className="w-full bg-purple-500 transition-all duration-500 hover:bg-purple-600 cursor-pointer group relative" title={`Clicked: ${d.clicked}`} style={{ height: clickedHeight }}></div>
                </div>
                <span className="text-xs font-medium text-gray-600 mt-2">{d.day}</span>
              </div>
            );
          })}
        </div>
  {/* Demographics */}
  <div className="bg-white rounded-lg border border-gray-200 p-6">

          <h4 className="text-lg font-medium text-gray-900 mb-4">Age Demographics</h4>
          <div className="space-y-3">
            {demographicData.map((demo) => (
              <div key={demo.label} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{demo.label}</span>
                <div className="flex items-center space-x-3">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${demo.color}`}
                      style={{ width: `${demo.value * 2}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-8 text-right">
                    {demo.value}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Device Usage */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Device Preferences</h4>
          <div className="space-y-4">
            {deviceData.map((device, index) => (
              <div key={device.label} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <device.icon className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-900">{device.label}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        index === 0 ? 'bg-blue-500' : 
                        index === 1 ? 'bg-green-500' : 'bg-purple-500'
                      }`}
                      style={{ width: `${device.value}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-8 text-right">
                    {device.value}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Engagement Times */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Clock className="h-5 w-5 text-gray-700" />
            <h4 className="text-lg font-medium text-gray-900">Best Engagement Times</h4>
          </div>
          <div className="space-y-3">
            {engagementTimes.map((timeData) => (
              <div key={timeData.time} className="flex items-center justify-between">
                <span className="text-sm text-gray-700 font-medium">{timeData.time}</span>
                <div className="flex items-center space-x-3">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                      style={{ width: `${(timeData.engagement / maxEngagement) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-8 text-right">
                    {timeData.engagement}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Brain className="h-5 w-5 text-purple-600" />
          <h4 className="text-lg font-semibold text-purple-900">AI Audience Insights</h4>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <p className="text-sm font-medium text-purple-900">Peak Engagement Window</p>
                <p className="text-sm text-purple-700">
                  2-4 PM shows 89% higher engagement for your audience demographics.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <p className="text-sm font-medium text-purple-900">Mobile-First Strategy</p>
                <p className="text-sm text-purple-700">
                  68% of your audience primarily uses mobile devices. Optimize for mobile-first design.
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <p className="text-sm font-medium text-purple-900">Segment Opportunity</p>
                <p className="text-sm text-purple-700">
                  High-value segment shows 45% better conversion rates. Consider targeted campaigns.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <p className="text-sm font-medium text-purple-900">Growth Trend</p>
                <p className="text-sm text-purple-700">
                  New user acquisition is trending upward by 12.5% month-over-month.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};