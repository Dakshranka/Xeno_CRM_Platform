import React, { useState } from 'react';
import { FileText, Download, Calendar, Settings, Mail, BarChart3, Users, TrendingUp } from 'lucide-react';

export const ExportReports: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState<string>('');
  const [dateRange, setDateRange] = useState('30d');
  const [format, setFormat] = useState('xlsx');
  const [isGenerating, setIsGenerating] = useState(false);

  const reportTypes = [
    {
      id: 'campaign-performance',
      name: 'Campaign Performance Report',
      description: 'Detailed performance metrics for all campaigns',
      icon: BarChart3,
      estimatedSize: '2.3 MB',
      lastGenerated: '2025-01-20 09:30'
    },
    {
      id: 'audience-analysis',
      name: 'Audience Analysis Report',
      description: 'Demographics, segments, and engagement patterns',
      icon: Users,
      estimatedSize: '1.8 MB',
      lastGenerated: '2025-01-19 16:45'
    },
    {
      id: 'delivery-logs',
      name: 'Delivery & Engagement Logs',
      description: 'Detailed logs of message delivery and user interactions',
      icon: Mail,
      estimatedSize: '5.7 MB',
      lastGenerated: '2025-01-20 08:15'
    },
    {
      id: 'roi-analysis',
      name: 'ROI & Attribution Report',
      description: 'Revenue attribution and return on investment analysis',
      icon: TrendingUp,
      estimatedSize: '1.2 MB',
      lastGenerated: '2025-01-18 14:20'
    }
  ];

  const quickReports = [
    { name: 'Yesterday\'s Performance', icon: Calendar, action: 'download-yesterday' },
    { name: 'Weekly Summary', icon: BarChart3, action: 'download-weekly' },
    { name: 'Top 10 Campaigns', icon: TrendingUp, action: 'download-top10' },
    { name: 'Audience Growth', icon: Users, action: 'download-growth' }
  ];

  const handleGenerateReport = async () => {
    if (!selectedReport) return;
    
    setIsGenerating(true);
    
    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Simulate download
    const reportName = reportTypes.find(r => r.id === selectedReport)?.name || 'Report';
    const filename = `${reportName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.${format}`;
    
    // Create a dummy file for download simulation
    const content = `${reportName} - Generated on ${new Date().toLocaleString()}\n\nThis would contain the actual report data...`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    setIsGenerating(false);
  };

  const handleQuickReport = async (action: string) => {
    // Simulate quick report generation
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const filename = `${action.replace('download-', '')}-report-${Date.now()}.xlsx`;
    console.log(`Generating ${filename}`);
    
    setIsGenerating(false);
  };

  return (
    <div className="space-y-6">
      {/* Quick Reports */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Reports</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickReports.map((report) => (
            <button
              key={report.action}
              onClick={() => handleQuickReport(report.action)}
              disabled={isGenerating}
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <report.icon className="h-6 w-6 text-gray-600 mb-2" />
              <div className="text-sm font-medium text-gray-900">{report.name}</div>
              <div className="text-xs text-gray-500 mt-1">Download instantly</div>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Report Generator */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Custom Report Generator</h3>
          <p className="text-sm text-gray-600 mt-1">Generate detailed reports with custom parameters</p>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Report Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Report Type
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reportTypes.map((report) => (
                <div
                  key={report.id}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                    selectedReport === report.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedReport(report.id)}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      selectedReport === report.id ? 'bg-blue-500' : 'bg-gray-100'
                    }`}>
                      <report.icon className={`h-5 w-5 ${
                        selectedReport === report.id ? 'text-white' : 'text-gray-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">{report.name}</h4>
                      <p className="text-xs text-gray-600 mt-1">{report.description}</p>
                      <div className="flex items-center space-x-3 mt-2 text-xs text-gray-500">
                        <span>~{report.estimatedSize}</span>
                        <span>•</span>
                        <span>Updated {report.lastGenerated}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Report Parameters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Range
              </label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="1d">Last 24 hours</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="custom">Custom range</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Export Format
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="xlsx">Excel (.xlsx)</option>
                <option value="csv">CSV (.csv)</option>
                <option value="pdf">PDF (.pdf)</option>
                <option value="json">JSON (.json)</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleGenerateReport}
                disabled={!selectedReport || isGenerating}
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isGenerating ? (
                  <>
                    <Settings className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Generate Report
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Report Preview */}
          {selectedReport && (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h5 className="text-sm font-medium text-gray-900 mb-2">Report Preview</h5>
              <div className="text-sm text-gray-600 space-y-1">
                <div>• Campaign performance metrics and trends</div>
                <div>• Audience engagement analytics</div>
                <div>• Delivery and bounce rate analysis</div>
                <div>• Channel comparison and recommendations</div>
                <div>• Export date: {new Date().toLocaleDateString()}</div>
                <div>• Data period: {dateRange === '30d' ? 'Last 30 days' : dateRange}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Automated Reports */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Automated Reports</h3>
          <button className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
            Configure Schedule
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Daily Summary</h4>
            <p className="text-xs text-gray-600 mb-3">
              Daily performance overview sent every morning
            </p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-green-600 font-medium">Enabled</span>
              <span className="text-xs text-gray-500">9:00 AM</span>
            </div>
          </div>
          
          <div className="p-4 border border-gray-200 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Weekly Report</h4>
            <p className="text-xs text-gray-600 mb-3">
              Comprehensive weekly analytics and insights
            </p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-green-600 font-medium">Enabled</span>
              <span className="text-xs text-gray-500">Monday 8:00 AM</span>
            </div>
          </div>
          
          <div className="p-4 border border-gray-200 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Monthly Analysis</h4>
            <p className="text-xs text-gray-600 mb-3">
              In-depth monthly performance and trends
            </p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Disabled</span>
              <span className="text-xs text-gray-500">1st of month</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};