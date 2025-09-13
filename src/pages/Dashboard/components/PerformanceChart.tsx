import React from 'react';
import { BarChart3 } from 'lucide-react';


import { useEffect, useState } from 'react';

interface ChartDatum {
  day: string;
  delivered: number;
  opened: number;
  clicked: number;
}

export const PerformanceChart: React.FC = () => {
  const [chartData, setChartData] = useState<ChartDatum[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/analytics/weekly`, {
      credentials: 'include',
    })
      .then(res => res.json())
      .then(data => setChartData(data))
      .catch(() => setError('Failed to load weekly data'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  const maxValue = chartData.length > 0 ? Math.max(...chartData.map(d => d.delivered)) : 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-gray-700" />
            <h3 className="text-lg font-semibold text-gray-900">Weekly Performance</h3>
          </div>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-gray-600">Delivered</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-600">Opened</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span className="text-gray-600">Clicked</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="h-64 flex items-end justify-between space-x-4">
          {chartData.map((data) => (
            <div key={data.day} className="flex-1 flex flex-col items-center">
              <div className="w-full flex flex-col items-center space-y-1 mb-2">
                <div 
                  className="w-full bg-blue-500 rounded-t-lg transition-all duration-500 hover:bg-blue-600"
                  style={{ height: `${(data.delivered / maxValue) * 180}px` }}
                  title={`Delivered: ${data.delivered.toLocaleString()}`}
                ></div>
                <div 
                  className="w-full bg-green-500 rounded-t-lg transition-all duration-500 hover:bg-green-600"
                  style={{ height: `${(data.opened / maxValue) * 180}px` }}
                  title={`Opened: ${data.opened.toLocaleString()}`}
                ></div>
                <div 
                  className="w-full bg-purple-500 rounded-t-lg transition-all duration-500 hover:bg-purple-600"
                  style={{ height: `${(data.clicked / maxValue) * 180}px` }}
                  title={`Clicked: ${data.clicked.toLocaleString()}`}
                ></div>
              </div>
              <span className="text-xs font-medium text-gray-600">{data.day}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};