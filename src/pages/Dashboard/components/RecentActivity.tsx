import React from 'react';
import { Activity, Mail, MessageSquare, Bell, Database } from 'lucide-react';

const activities = [
  {
    id: 1,
    type: 'campaign',
    icon: Mail,
    title: 'Welcome Email Campaign launched',
    description: 'Targeting 12.5K new users',
    timestamp: '2 minutes ago',
    color: 'bg-blue-100 text-blue-600'
  },
  {
    id: 2,
    type: 'data',
    icon: Database,
    title: 'Customer data sync completed',
    description: '3.2K records updated',
    timestamp: '15 minutes ago',
    color: 'bg-green-100 text-green-600'
  },
  {
    id: 3,
    type: 'notification',
    icon: Bell,
    title: 'High engagement alert',
    description: 'SMS campaign exceeding targets by 15%',
    timestamp: '1 hour ago',
    color: 'bg-purple-100 text-purple-600'
  },
  {
    id: 4,
    type: 'campaign',
    icon: MessageSquare,
    title: 'Push notification sent',
    description: 'Re-engagement campaign to 5.6K users',
    timestamp: '3 hours ago',
    color: 'bg-indigo-100 text-indigo-600'
  },
  {
    id: 5,
    type: 'data',
    icon: Database,
    title: 'API integration configured',
    description: 'Analytics API connected successfully',
    timestamp: '5 hours ago',
    color: 'bg-green-100 text-green-600'
  }
];

export const RecentActivity: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center space-x-2">
          <Activity className="h-5 w-5 text-gray-700" />
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        </div>
      </div>
      
      <div className="p-6">
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3 group">
              <div className={`flex-shrink-0 w-8 h-8 rounded-lg ${activity.color} flex items-center justify-center`}>
                <activity.icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors cursor-pointer">
                  {activity.title}
                </p>
                <p className="text-sm text-gray-500">{activity.description}</p>
                <p className="text-xs text-gray-400 mt-1">{activity.timestamp}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6">
          <button className="w-full text-center text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
            View all activity
          </button>
        </div>
      </div>
    </div>
  );
};