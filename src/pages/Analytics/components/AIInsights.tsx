
import React, { useState } from 'react';
import { PerformanceStats } from './PerformanceChart';

interface AIInsightsProps {
  stats: PerformanceStats;
}

export const AIInsights: React.FC<AIInsightsProps> = ({ stats }) => {
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const jwt = localStorage.getItem('jwt');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/ai/performance-summary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(jwt ? { Authorization: `Bearer ${jwt}` } : {})
        },
        body: JSON.stringify({ stats })
      });
      const data = await res.json();
      setSummary(data.summary || 'No summary available.');
    } catch {
      setSummary('Error fetching AI summary.');
    }
    setLoading(false);
  };

  return (
    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200 p-6 mt-6">
      <div className="flex items-center space-x-2 mb-4">
        <span className="text-lg font-semibold text-purple-900">AI Campaign Insights</span>
        <button
          className="ml-auto bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700"
          onClick={fetchSummary}
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Generate Insights'}
        </button>
      </div>
      <div className="text-purple-800 text-sm whitespace-pre-line min-h-[48px]">
        {summary}
      </div>
    </div>
  );
};
