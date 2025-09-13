import React, { useState } from 'react';
import { useData } from '../../../contexts/DataContext';
import { Users, Brain, TrendingUp } from 'lucide-react';

export const AudienceInsights: React.FC = () => {
  const { getAudienceInsights } = useData();
  const insights = getAudienceInsights();
  const [aiInsight, setAiInsight] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const fetchAiInsight = async () => {
    setAiLoading(true);
    try {
      const jwt = localStorage.getItem('jwt');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/ai/dashboard-insight`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(jwt ? { Authorization: `Bearer ${jwt}` } : {})
        },
        body: JSON.stringify({ audience: insights })
      });
      const data = await res.json();
      setAiInsight(data.insight || 'No AI insight available.');
    } catch {
      setAiInsight('Error fetching AI insight.');
    }
    setAiLoading(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center space-x-2">
          <Brain className="h-5 w-5 text-gray-700" />
          <h3 className="text-lg font-semibold text-gray-900">AI Insights</h3>
        </div>
      </div>
      
      <div className="p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center space-x-3">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-900">Total Audience</p>
                <p className="text-xs text-blue-700">All active contacts</p>
              </div>
            </div>
            <span className="text-lg font-bold text-blue-900">
              {insights.totalRecords.toLocaleString()}
            </span>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Top Segments</h4>
            <div className="space-y-3">
              {insights.topSegments.map((segment, index) => (
                <div key={segment.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      index === 0 ? 'bg-blue-500' : 
                      index === 1 ? 'bg-green-500' : 
                      index === 2 ? 'bg-purple-500' : 'bg-gray-400'
                    }`}></div>
                    <span className="text-sm text-gray-700 capitalize">{segment.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">
                      {segment.count.toLocaleString()}
                    </span>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          index === 0 ? 'bg-blue-500' : 
                          index === 1 ? 'bg-green-500' : 
                          index === 2 ? 'bg-purple-500' : 'bg-gray-400'
                        }`}
                        style={{ width: `${(segment.count / insights.totalRecords) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-900">AI Recommendation</span>
              <button
                className="ml-auto bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                onClick={fetchAiInsight}
                disabled={aiLoading}
              >
                {aiLoading ? 'Loading...' : 'AI Insights'}
              </button>
            </div>
            <p className="text-sm text-green-800">
              {aiInsight || 'Your high-engagement segment shows 34% higher open rates. Consider creating targeted campaigns for this audience.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};