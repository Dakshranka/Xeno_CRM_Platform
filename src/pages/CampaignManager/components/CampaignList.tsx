import React, { useState } from 'react';
import { useCampaigns } from '../../../contexts/CampaignContext';
import * as LucideIcons from 'lucide-react';
import {
  Mail,
  MessageSquare,
  Bell,
  Search,
  Filter,
  MoreHorizontal,
  Pause,
  Play,
  Edit,
  Copy,
  Trash2,
} from 'lucide-react';

interface CampaignListProps {
  onCreateNew: () => void;
}

export const CampaignList: React.FC<CampaignListProps> = ({ onCreateNew }) => {
  const { campaigns, updateCampaign, deleteCampaign, sendCampaign } = useCampaigns();
  const [deliveryStats, setDeliveryStats] = React.useState<Record<string, { sent: number; failed: number; total: number }>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
    const matchesType = typeFilter === 'all' || campaign.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'paused': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

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

  type CampaignStatus = 'active' | 'paused' | 'draft' | 'completed';

  const handleStatusChange = (campaignId: string, newStatus: CampaignStatus) => {
    updateCampaign(campaignId, { status: newStatus });
  };

  const duplicateCampaign = (campaignId: string) => {
    const campaign = campaigns.find(c => c.id === campaignId);
    if (campaign) {
      const duplicate = {
        ...campaign,
        name: `${campaign.name} (Copy)`,
        status: 'draft' as const,
        createdAt: new Date().toISOString()
      };
      // Would call addCampaign here
      console.log('Duplicate campaign:', duplicate);
    }
  };

  const handleSendCampaign = async (id: string) => {
    const stats = await sendCampaign(id);
    if (stats) {
      setDeliveryStats(prev => ({ ...prev, [id]: stats }));
      // Trigger instant analytics refresh
      if (window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('refreshAnalytics'));
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search campaigns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="email">Email</option>
            <option value="sms">SMS</option>
            <option value="push">Push</option>
          </select>
        </div>
      </div>

      {/* Campaign Grid */}
      {filteredCampaigns.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <LucideIcons.Zap className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns found</h3>
          <p className="text-gray-600 mb-4">Get started by creating your first campaign</p>
          <button
            onClick={onCreateNew}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            <LucideIcons.Plus className="w-4 h-4 mr-2" />
            Create Campaign
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCampaigns.map((campaign) => {
            const TypeIcon = getTypeIcon(campaign.type);
            
            return (
              <div key={campaign.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getTypeColor(campaign.type)}`}>
                        <TypeIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
                          {campaign.name}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">
                          Created {new Date(campaign.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="relative">
                      <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(campaign.status)}`}>
                        {campaign.status}
                      </span>
                      <span className="text-sm font-medium text-gray-600">
                        {campaign.audienceSize.toLocaleString()} recipients
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Delivery Rate</span>
                        <span className="font-medium">{campaign.deliveryRate}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${campaign.deliveryRate}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Open: {campaign.openRate}%</span>
                      <span className="text-gray-600">Click: {campaign.clickRate}%</span>
                    </div>

                    {campaign.scheduledAt && (
                      <div className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                        Scheduled: {new Date(campaign.scheduledAt).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>

                  <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                    <button
                      onClick={() => handleSendCampaign(campaign.id)}
                      className="p-1 text-indigo-600 hover:text-indigo-700 transition-colors mr-2"
                      title="Send campaign"
                    >
                      <LucideIcons.Send className="h-4 w-4" />
                    </button>
                  <div className="flex items-center space-x-2">
                    {campaign.status === 'active' ? (
                      <button
                        onClick={() => handleStatusChange(campaign.id, 'paused')}
                        className="p-1 text-yellow-600 hover:text-yellow-700 transition-colors"
                        title="Pause campaign"
                      >
                        <Pause className="h-4 w-4" />
                      </button>
                    ) : campaign.status === 'paused' || campaign.status === 'draft' ? (
                      <button
                        onClick={() => handleStatusChange(campaign.id, 'active')}
                        className="p-1 text-green-600 hover:text-green-700 transition-colors"
                        title="Start campaign"
                      >
                        <Play className="h-4 w-4" />
                      </button>
                    ) : null}
                    
                    <button
                      className="p-1 text-blue-600 hover:text-blue-700 transition-colors"
                      title="Edit campaign"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    
                    <button
                      onClick={() => duplicateCampaign(campaign.id)}
                      className="p-1 text-gray-600 hover:text-gray-700 transition-colors"
                      title="Duplicate campaign"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => deleteCampaign(campaign.id)}
                    className="p-1 text-red-600 hover:text-red-700 transition-colors"
                    title="Delete campaign"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  {deliveryStats[campaign.id] && (
                    <div className="mt-2 text-xs text-gray-700">
                      Sent: {deliveryStats[campaign.id].sent} | Failed: {deliveryStats[campaign.id].failed} | Total: {deliveryStats[campaign.id].total}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};