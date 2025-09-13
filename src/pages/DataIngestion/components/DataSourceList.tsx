import React from 'react';
import { useData } from '../../../contexts/DataContext';
import { Database, Cloud, FileText, Globe, MoreVertical, RefreshCw, AlertCircle } from 'lucide-react';

const getSourceIcon = (type: string) => {
  switch (type) {
    case 'database': return Database;
    case 'api': return Globe;
    case 'csv': return FileText;
    case 'webhook': return Cloud;
    default: return Database;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'connected': return 'bg-green-100 text-green-800 border-green-200';
    case 'syncing': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'disconnected': return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'error': return 'bg-red-100 text-red-800 border-red-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const DataSourceList: React.FC = () => {
  const { dataSources, updateDataSource } = useData();

  const handleSync = (sourceId: string) => {
    updateDataSource(sourceId, { status: 'syncing' });
    
    setTimeout(() => {
      updateDataSource(sourceId, { 
        status: 'connected',
        lastSync: new Date().toISOString()
      });
    }, 3000);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Connected Data Sources</h3>
        <div className="text-sm text-gray-500">
          {dataSources.length} sources • {dataSources.reduce((sum, s) => sum + s.recordCount, 0).toLocaleString()} total records
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {dataSources.map((source) => {
          const Icon = getSourceIcon(source.type);
          
          return (
            <div key={source.id} className="bg-gray-50 rounded-lg border border-gray-200 p-4 hover:bg-gray-100 transition-colors duration-200">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center">
                    <Icon className="h-5 w-5 text-gray-700" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{source.name}</h4>
                    <p className="text-xs text-gray-500 capitalize">{source.type} source</p>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-gray-600 transition-colors">
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Status</span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(source.status)}`}>
                    {source.status === 'syncing' && <RefreshCw className="w-3 h-3 mr-1 animate-spin" />}
                    {source.status === 'error' && <AlertCircle className="w-3 h-3 mr-1" />}
                    {source.status}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Records</span>
                  <span className="text-sm font-medium text-gray-900">
                    {source.recordCount.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Last Sync</span>
                  <span className="text-xs text-gray-600">
                    {new Date(source.lastSync).toLocaleTimeString()}
                  </span>
                </div>

                <button
                  onClick={() => handleSync(source.id)}
                  disabled={source.status === 'syncing'}
                  className="w-full mt-3 px-3 py-2 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {source.status === 'syncing' ? 'Syncing...' : 'Sync Now'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};