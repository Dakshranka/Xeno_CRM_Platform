import React, { useEffect, useState } from 'react';
import { BarChart3 } from 'lucide-react';

export interface PerformanceStats {
  totalSent: number;
  totalDelivered: number;
  totalOpened: number;
  totalClicked: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
}

export interface PerformanceChartProps {
  dateRange: string;
  onStats?: (stats: PerformanceStats) => void;
}

export interface ChartDatum {
  date: string;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
}

export const PerformanceChart: React.FC<PerformanceChartProps> = ({ dateRange, onStats }) => {
  const [chartData, setChartData] = useState<ChartDatum[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/analytics/performance?range=${dateRange}`, {
      credentials: 'include',
    })
      .then(res => res.json())
      .then((data: ChartDatum[]) => {
        setChartData(data);
        if (typeof onStats === 'function') {
          // Aggregate stats for AI
          const stats: PerformanceStats = {
            totalSent: data.reduce((sum: number, d: ChartDatum) => sum + d.sent, 0),
            totalDelivered: data.reduce((sum: number, d: ChartDatum) => sum + d.delivered, 0),
            totalOpened: data.reduce((sum: number, d: ChartDatum) => sum + d.opened, 0),
            totalClicked: data.reduce((sum: number, d: ChartDatum) => sum + d.clicked, 0),
            deliveryRate: data.length ? (data.reduce((sum: number, d: ChartDatum) => sum + d.delivered, 0) / data.reduce((sum: number, d: ChartDatum) => sum + d.sent, 0)) : 0,
            openRate: data.length ? (data.reduce((sum: number, d: ChartDatum) => sum + d.opened, 0) / data.reduce((sum: number, d: ChartDatum) => sum + d.delivered, 0)) : 0,
            clickRate: data.length ? (data.reduce((sum: number, d: ChartDatum) => sum + d.clicked, 0) / data.reduce((sum: number, d: ChartDatum) => sum + d.opened, 0)) : 0,
          };
          onStats(stats);
        }
      })
      .catch(() => setError('Failed to load performance data'))
      .finally(() => setLoading(false));
  }, [dateRange, onStats]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

const maxValue = chartData.length > 0 ? Math.max(...chartData.map(d => d.sent)) : 0;

return (
  <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-gray-700" />
            <h3 className="text-lg font-semibold text-gray-900">Performance Trends</h3>
          </div>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-gray-600">Sent</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-600">Delivered</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span className="text-gray-600">Opened</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span className="text-gray-600">Clicked</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="h-72 w-full max-w-4xl mx-auto">
          <div className="flex items-end justify-between space-x-2 h-full">
            {chartData.map((data) => {
              const date = new Date(data.date);
              const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
              
              return (
                <div key={data.date} className="flex-1 flex flex-col items-center h-full justify-end">
                  <div className="w-full space-y-1 mb-3">
                    <div 
                      className="w-full bg-blue-500 rounded-t-sm transition-all duration-500 hover:bg-blue-600 cursor-pointer group relative"
                      style={{ height: `${(data.sent / maxValue) * 200}px` }}
                      title={`Sent: ${data.sent.toLocaleString()}`}
                    >
                      <div className="absolute inset-x-0 bottom-full mb-1 hidden group-hover:block">
                        <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 text-center">
                          {data.sent.toLocaleString()} sent
                        </div>
                      </div>
                    </div>
                    <div 
                      className="w-full bg-green-500 rounded-t-sm transition-all duration-500 hover:bg-green-600 cursor-pointer group relative"
                      style={{ height: `${(data.delivered / maxValue) * 200}px` }}
                      title={`Delivered: ${data.delivered.toLocaleString()}`}
                    >
                      <div className="absolute inset-x-0 bottom-full mb-1 hidden group-hover:block">
                        <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 text-center">
                          {data.delivered.toLocaleString()} delivered
                        </div>
                      </div>
                    </div>
                    <div 
                      className="w-full bg-purple-500 rounded-t-sm transition-all duration-500 hover:bg-purple-600 cursor-pointer group relative"
                      style={{ height: `${(data.opened / maxValue) * 200}px` }}
                      title={`Opened: ${data.opened.toLocaleString()}`}
                    >
                      <div className="absolute inset-x-0 bottom-full mb-1 hidden group-hover:block">
                        <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 text-center">
                          {data.opened.toLocaleString()} opened
                        </div>
                      </div>
                    </div>
                    <div 
                      className="w-full bg-orange-500 rounded-t-sm transition-all duration-500 hover:bg-orange-600 cursor-pointer group relative"
                      style={{ height: `${(data.clicked / maxValue) * 200}px` }}
                      title={`Clicked: ${data.clicked.toLocaleString()}`}
                    >
                      <div className="absolute inset-x-0 bottom-full mb-1 hidden group-hover:block">
                        <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 text-center">
                          {data.clicked.toLocaleString()} clicked
                        </div>
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-gray-600 mt-2">{dayName}</span>
                  <span className="text-xs text-gray-400">{date.getDate()}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">
              {chartData.reduce((sum, d) => sum + d.sent, 0).toLocaleString()}
            </div>
            <div className="text-xs text-gray-500">Total Sent</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">
              {(chartData.reduce((sum, d) => sum + d.delivered, 0) / chartData.reduce((sum, d) => sum + d.sent, 0) * 100).toFixed(1)}%
            </div>
            <div className="text-xs text-gray-500">Delivery Rate</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-purple-600">
              {(chartData.reduce((sum, d) => sum + d.opened, 0) / chartData.reduce((sum, d) => sum + d.delivered, 0) * 100).toFixed(1)}%
            </div>
            <div className="text-xs text-gray-500">Open Rate</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-orange-600">
              {(chartData.reduce((sum, d) => sum + d.clicked, 0) / chartData.reduce((sum, d) => sum + d.opened, 0) * 100).toFixed(1)}%
            </div>
            <div className="text-xs text-gray-500">Click Rate</div>
          </div>
        </div>
      </div>
    </div>
  );
};