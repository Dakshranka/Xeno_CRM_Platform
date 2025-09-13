  // Simulate open and click events for a campaign
  const simulateOpen = async (id: string, percentage: number = 60) => {
    const jwt = localStorage.getItem('jwt');
    await fetch(`/api/campaigns/${id}/simulate-open`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(jwt ? { Authorization: `Bearer ${jwt}` } : {})
      },
      body: JSON.stringify({ percentage })
    });
    window.dispatchEvent(new CustomEvent('refreshAnalytics'));
  };

  const simulateClick = async (id: string, percentage: number = 30) => {
    const jwt = localStorage.getItem('jwt');
    await fetch(`/api/campaigns/${id}/simulate-click`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(jwt ? { Authorization: `Bearer ${jwt}` } : {})
      },
      body: JSON.stringify({ percentage })
    });
    window.dispatchEvent(new CustomEvent('refreshAnalytics'));
  };
// Returns color class for campaign type
function getTypeColor(type: string) {
  switch (type) {
    case 'email':
      return 'border-blue-500';
    case 'sms':
      return 'border-green-500';
    case 'push':
      return 'border-purple-500';
    default:
      return 'border-gray-300';
  }
}
import { Mail, Smartphone, Bell } from 'lucide-react';
// Returns icon component for campaign type
function getTypeIcon(type: string) {
  switch (type) {
    case 'email':
      return <Mail className="h-5 w-5 text-blue-500" />;
    case 'sms':
      return <Smartphone className="h-5 w-5 text-green-500" />;
    case 'push':
      return <Bell className="h-5 w-5 text-purple-500" />;
    default:
      return <Mail className="h-5 w-5 text-gray-400" />;
  }
}
import React, { useState } from 'react';
import { useCampaigns } from '../../../contexts/CampaignContext';
import { Calendar, Clock, Play, Pause, Settings, TrendingUp } from 'lucide-react';

export const CampaignScheduler: React.FC = () => {
  const { campaigns, updateCampaign } = useCampaigns();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState<'calendar' | 'timeline'>('calendar');

  const scheduledCampaigns = campaigns.filter(c => c.scheduledAt);
  
  const getCampaignsForDate = (date: string) => {
    return scheduledCampaigns.filter(c => 
      c.scheduledAt && c.scheduledAt.split('T')[0] === date
    );
  };

  const getOptimalTimes = () => {
    return [
      { time: '09:00', label: 'Morning Peak', engagement: 85, recommended: true },
      { time: '12:00', label: 'Lunch Break', engagement: 72, recommended: false },
      { time: '14:00', label: 'Afternoon Peak', engagement: 89, recommended: true },
      { time: '18:00', label: 'Evening Peak', engagement: 76, recommended: false },
      { time: '20:00', label: 'Prime Time', engagement: 81, recommended: true }
    ];
  };

  const generateCalendarDays = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    const firstDay = new Date(currentYear, currentMonth, 1);
  // ...existing code...
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      days.push(date);
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays();
  const today = new Date();

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-medium text-gray-900">Campaign Calendar</h3>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'calendar'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Calendar
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'timeline'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Timeline
            </button>
          </div>
        </div>

        <div className="text-sm text-gray-500">
          {scheduledCampaigns.length} scheduled campaigns
        </div>
      </div>

      {viewMode === 'calendar' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar View */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-medium text-gray-900">
                    {today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </h4>
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                      Today
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-4">
                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-px mb-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="p-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wide">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
                  {calendarDays.map((date, index) => {
                    const dateStr = date.toISOString().split('T')[0];
                    const campaignsForDay = getCampaignsForDate(dateStr);
                    const isToday = dateStr === today.toISOString().split('T')[0];
                    const isCurrentMonth = date.getMonth() === today.getMonth();
                    const isSelected = dateStr === selectedDate;

                    return (
                      <button
                        key={index}
                        onClick={() => setSelectedDate(dateStr)}
                        className={`p-2 min-h-[60px] bg-white hover:bg-gray-50 transition-colors text-left ${
                          isSelected ? 'ring-2 ring-blue-500' : ''
                        }`}
                      >
                        <div className={`text-sm font-medium ${
                          isToday 
                            ? 'text-blue-600' 
                            : isCurrentMonth 
                            ? 'text-gray-900' 
                            : 'text-gray-400'
                        }`}>
                          {date.getDate()}
                        </div>
                        
                        {campaignsForDay.length > 0 && (
                          <div className="mt-1">
                            {campaignsForDay.slice(0, 2).map((campaign, idx) => (
                              <div
                                key={idx}
                                className="text-xs bg-blue-100 text-blue-800 px-1 py-0.5 rounded mb-1 truncate"
                              >
                                {campaign.name}
                              </div>
                            ))}
                            {campaignsForDay.length > 2 && (
                              <div className="text-xs text-gray-500">
                                +{campaignsForDay.length - 2} more
                              </div>
                            )}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Day Details */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">
                {new Date(selectedDate).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h4>
              
              <div className="space-y-3">
                {getCampaignsForDate(selectedDate).map((campaign) => {
                  // ...existing code...
                  
                  return (
                    <div key={campaign.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${getTypeColor(campaign.type)}`}>
                        {getTypeIcon(campaign.type)}
                        <button className="ml-2 px-2 py-1 text-xs bg-green-100 rounded" onClick={() => simulateOpen(campaign.id, 60)}>Simulate Open</button>
                        <button className="ml-2 px-2 py-1 text-xs bg-purple-100 rounded" onClick={() => simulateClick(campaign.id, 30)}>Simulate Click</button>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {campaign.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(campaign.scheduledAt!).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <button className="p-1 text-blue-600 hover:text-blue-700 transition-colors">
                          <Settings className="h-3 w-3" />
                        </button>
                        {campaign.status === 'active' ? (
                          <button 
                            onClick={() => updateCampaign(campaign.id, { status: 'paused' })}
                            className="p-1 text-yellow-600 hover:text-yellow-700 transition-colors"
                          >
                            <Pause className="h-3 w-3" />
                          </button>
                        ) : (
                          <button 
                            onClick={() => updateCampaign(campaign.id, { status: 'active' })}
                            className="p-1 text-green-600 hover:text-green-700 transition-colors"
                          >
                            <Play className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
                
                {getCampaignsForDate(selectedDate).length === 0 && (
                  <div className="text-center py-8">
                    <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No campaigns scheduled for this day</p>
                  </div>
                )}
              </div>
            </div>

            {/* Optimal Send Times */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                <TrendingUp className="h-4 w-4 mr-2 text-green-600" />
                Optimal Send Times
              </h4>
              
              <div className="space-y-2">
                {getOptimalTimes().map((timeSlot) => (
                  <div key={timeSlot.time} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{timeSlot.time}</div>
                      <div className="text-xs text-gray-500">{timeSlot.label}</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-xs text-gray-600">{timeSlot.engagement}%</div>
                      {timeSlot.recommended && (
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Timeline View */
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="space-y-4">
            {scheduledCampaigns
              .sort((a, b) => new Date(a.scheduledAt!).getTime() - new Date(b.scheduledAt!).getTime())
              .map((campaign) => {
                // ...existing code...
                const scheduledDate = new Date(campaign.scheduledAt!);
                
                return (
                  <div key={campaign.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                    <div className="flex-shrink-0">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${getTypeColor(campaign.type)}`}>
                        {getTypeIcon(campaign.type)}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">{campaign.name}</h4>
                      <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                        <span className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{scheduledDate.toLocaleDateString()}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{scheduledDate.toLocaleTimeString('en-US', { 
                            hour: 'numeric', 
                            minute: '2-digit' 
                          })}</span>
                        </span>
                        <span>{campaign.audienceSize.toLocaleString()} recipients</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(campaign.status)}`}>
                        {campaign.status}
                      </span>
                      
                      <div className="flex space-x-1">
                        <button className="p-1 text-blue-600 hover:text-blue-700 transition-colors">
                          <Settings className="h-4 w-4" />
                        </button>
                        {campaign.status === 'active' ? (
                          <button 
                            onClick={() => updateCampaign(campaign.id, { status: 'paused' })}
                            className="p-1 text-yellow-600 hover:text-yellow-700 transition-colors"
                          >
                            <Pause className="h-4 w-4" />
                          </button>
                        ) : (
                          <button 
                            onClick={() => updateCampaign(campaign.id, { status: 'active' })}
                            className="p-1 text-green-600 hover:text-green-700 transition-colors"
                          >
                            <Play className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            
            {scheduledCampaigns.length === 0 && (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">No scheduled campaigns</h4>
                <p className="text-gray-600">All your campaigns will appear here once scheduled.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
  
  function getStatusColor(status: string): string {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'paused': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }
};