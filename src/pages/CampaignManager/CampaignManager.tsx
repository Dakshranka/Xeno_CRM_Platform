import React, { useState } from 'react';
import { CampaignList } from './components/CampaignList';
import { CampaignCreator } from './components/CampaignCreator';
import { CampaignTemplates } from './components/CampaignTemplates';
import { CampaignScheduler } from './components/CampaignScheduler';
import { Plus, Zap, Calendar, BookTemplate as Template } from 'lucide-react';

type TabType = 'campaigns' | 'create' | 'templates' | 'scheduler';

export const CampaignManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('campaigns');
  const [showCreator, setShowCreator] = useState(false);

  const tabs = [
    { id: 'campaigns' as TabType, name: 'All Campaigns', icon: Zap },
    { id: 'create' as TabType, name: 'Create New', icon: Plus },
    { id: 'templates' as TabType, name: 'Templates', icon: Template },
    { id: 'scheduler' as TabType, name: 'Scheduler', icon: Calendar }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'campaigns':
        return <CampaignList onCreateNew={() => setActiveTab('create')} />;
      case 'create':
        return <CampaignCreator onCancel={() => setActiveTab('campaigns')} />;
      case 'templates':
        return <CampaignTemplates onUseTemplate={() => setActiveTab('create')} />;
      case 'scheduler':
        return <CampaignScheduler />;
      default:
        return <CampaignList onCreateNew={() => setActiveTab('create')} />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Campaign Manager</h1>
          <p className="text-gray-600 mt-1">Create, manage, and optimize your marketing campaigns</p>
        </div>
        <button
          onClick={() => setActiveTab('create')}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 transition-all duration-200"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Campaign
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