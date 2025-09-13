import React, { useState } from 'react';
import { DataSourceList } from './components/DataSourceList';
import { DataUpload } from './components/DataUpload';
import { ApiConnector } from './components/ApiConnector';
import { DataValidation } from './components/DataValidation';
import { Plus, Database, Upload, Link, CheckCircle } from 'lucide-react';

type TabType = 'sources' | 'upload' | 'api' | 'validation';

export const DataIngestion: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('sources');

  const tabs = [
    { id: 'sources' as TabType, name: 'Data Sources', icon: Database },
    { id: 'upload' as TabType, name: 'File Upload', icon: Upload },
    { id: 'api' as TabType, name: 'API Integration', icon: Link },
    { id: 'validation' as TabType, name: 'Data Validation', icon: CheckCircle }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'sources':
        return <DataSourceList />;
      case 'upload':
        return <DataUpload />;
      case 'api':
        return <ApiConnector />;
      case 'validation':
        return <DataValidation />;
      default:
        return <DataSourceList />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Data Ingestion</h1>
          <p className="text-gray-600 mt-1">Manage data sources and import customer data</p>
        </div>
        <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 transition-all duration-200">
          <Plus className="w-4 h-4 mr-2" />
          Add Data Source
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                </div>
              </button>
            ))}
          </nav>
        </div>
        
        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};