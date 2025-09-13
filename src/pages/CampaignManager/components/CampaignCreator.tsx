import { useState, useEffect, Fragment } from 'react';
import { 
  Mail, 
  MessageSquare, 
  Bell, 
  Users, 
  Wand2, 
  Calendar,
  Send,
  Eye,
  Target,
  Settings,
  Edit
} from 'lucide-react';
import { useCampaigns } from '../../../contexts/CampaignContext';
import { useData } from '../../../contexts/DataContext';
import { RuleBuilder } from './RuleBuilder';

interface CampaignCreatorProps {
  onCancel: () => void;
}

interface CampaignForm {
  _id?: string;
  name: string;
  type: 'email' | 'sms' | 'push';
  content: {
    subject?: string;
    message: string;
    template?: string;
  };
  targeting: {
    segments: string[];
    filters: Record<string, unknown>;
  };
  schedule: {
    type: 'immediate' | 'scheduled';
    scheduledAt?: string;
  };
}

export const CampaignCreator: React.FC<CampaignCreatorProps> = ({ onCancel }) => {
  // Delivery log history integration

  // Audience preview integration
  interface AudienceMember {
    id: string;
    name: string;
    email: string;
  }
  const [audiencePreview, setAudiencePreview] = useState<{ size: number; audience: AudienceMember[] } | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const handleAudiencePreview = async () => {
    setIsPreviewLoading(true);
    setAudiencePreview(null);
    try {
      const jwt = localStorage.getItem('jwt');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/campaigns/audience-preview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(jwt ? { Authorization: `Bearer ${jwt}` } : {})
        },
        body: JSON.stringify({ rules: campaign.targeting.filters })
      });
      const data = await res.json();
      setAudiencePreview(data);
    } catch {
      setAudiencePreview(null);
    }
    setIsPreviewLoading(false);
  };

  // AI-powered Smart Scheduling, Lookalike, Auto-Tagging
  const [isAiLoading, setIsAiLoading] = useState(false);

  const handleSmartSchedule = async () => {
    setIsAiLoading(true);
    try {
      const jwt = localStorage.getItem('jwt');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/ai/smart-schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(jwt ? { Authorization: `Bearer ${jwt}` } : {})
        },
        body: JSON.stringify({ audience: [campaign], history: [] })
      });
      await res.json();
      // Optionally handle response or show notification here
    } catch {
      // Optionally handle error or show notification here
    }
    setIsAiLoading(false);
  };

  const handleLookalike = async () => {
    setIsAiLoading(true);
    try {
      const jwt = localStorage.getItem('jwt');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/ai/lookalike`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(jwt ? { Authorization: `Bearer ${jwt}` } : {})
        },
        body: JSON.stringify({ segment: [campaign] })
      });
      await res.json();
      // Optionally handle response or show notification here
    } catch {
      // Optionally handle error or show notification here
    }
    setIsAiLoading(false);
  };

  const handleAutoTag = async () => {
    setIsAiLoading(true);
    try {
      const jwt = localStorage.getItem('jwt');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/ai/auto-tag`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(jwt ? { Authorization: `Bearer ${jwt}` } : {})
        },
        body: JSON.stringify({ audience: [campaign], message: campaign.content.message || '' })
      });
      await res.json();
      // Optionally handle response or show notification here
    } catch {
      // Optionally handle error or show notification here
    }
    setIsAiLoading(false);
  };

  const { addCampaign } = useCampaigns();
  const { getAudienceInsights } = useData();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [campaign, setCampaign] = useState<CampaignForm>({
    name: '',
    type: 'email',
    content: {
      subject: '',
      message: '',
      template: 'default'
    },
    targeting: {
      segments: [],
      filters: {}
    },
    schedule: {
      type: 'immediate'
    }
  });

  const [audienceSize, setAudienceSize] = useState(0);
  const insights = getAudienceInsights();

  const steps = [
    { id: 1, name: 'Campaign Type', icon: Settings },
    { id: 2, name: 'Content', icon: Edit },
    { id: 3, name: 'Audience', icon: Target },
    { id: 4, name: 'Schedule', icon: Calendar },
    { id: 5, name: 'Review', icon: Eye }
  ];

  const campaignTypes = [
    {
      type: 'email' as const,
      name: 'Email Campaign',
      description: 'Send personalized emails to your audience',
      icon: Mail,
      color: 'border-indigo-200 bg-indigo-50 text-indigo-700'
    },
    {
      type: 'sms' as const,
      name: 'SMS Campaign',
      description: 'Direct text messages for urgent communications',
      icon: MessageSquare,
      color: 'border-green-200 bg-green-50 text-green-700'
    },
    {
      type: 'push' as const,
      name: 'Push Notification',
      description: 'App notifications for engaged users',
      icon: Bell,
      color: 'border-purple-200 bg-purple-50 text-purple-700'
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    const newCampaign = {
      ...campaign,
      audienceSize,
      deliveryRate: 0,
      openRate: 0,
      clickRate: 0,
      createdAt: new Date().toISOString(),
      status: campaign.schedule.type === 'immediate' ? 'active' as const : 'draft' as const,
      scheduledAt: campaign.schedule.scheduledAt
    };

    addCampaign(newCampaign);
    onCancel();
  };

  useEffect(() => {
    const baseSize = insights.totalRecords;
    const segmentMultiplier = campaign.targeting.segments.length > 0 ? 0.6 : 1;
    const estimatedSize = Math.floor(baseSize * segmentMultiplier);
    setAudienceSize(estimatedSize);
  }, [campaign.targeting.segments, insights.totalRecords]);

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Choose Campaign Type</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {campaignTypes.map((type) => (
                <button
                  key={type.type}
                  onClick={() => setCampaign(prev => ({ ...prev, type: type.type }))}
                  className={`p-6 border-2 rounded-lg text-left transition-all duration-200 ${
                    campaign.type === type.type
                      ? type.color + ' border-2'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <type.icon className={`h-8 w-8 mb-3 ${
                    campaign.type === type.type ? '' : 'text-gray-400'
                  }`} />
                  <h4 className={`font-medium mb-2 ${
                    campaign.type === type.type ? '' : 'text-gray-900'
                  }`}>
                    {type.name}
                  </h4>
                  <p className={`text-sm ${
                    campaign.type === type.type ? '' : 'text-gray-600'
                  }`}>
                    {type.description}
                  </p>
                </button>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Campaign Name
              </label>
              <input
                type="text"
                value={campaign.name}
                onChange={(e) => setCampaign(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter campaign name"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Create Content</h3>
            
            {campaign.type === 'email' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject Line
                </label>
                <input
                  type="text"
                  value={campaign.content.subject || ''}
                  onChange={(e) => setCampaign(prev => ({
                    ...prev,
                    content: { ...prev.content, subject: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter email subject"
                />
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Message Content
                </label>
                <button className="inline-flex items-center text-xs font-medium text-purple-600 hover:text-purple-700 transition-colors">
                  <Wand2 className="w-3 h-3 mr-1" />
                  AI Assistant
                </button>
              </div>
              <textarea
                value={campaign.content.message}
                onChange={(e) => setCampaign(prev => ({
                  ...prev,
                  content: { ...prev.content, message: e.target.value }
                }))}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={`Enter your ${campaign.type} message...`}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Use variables: {'{name}'}, {'{email}'}, {'{segment}'}</span>
                <span>{campaign.content.message.length} characters</span>
              </div>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Wand2 className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-900">AI Suggestions</span>
              </div>
              <div className="space-y-2">
                <button className="block w-full text-left text-sm text-purple-700 hover:text-purple-800 transition-colors">
                  • "Welcome to our community! Here's what you can expect..."
                </button>
                <button className="block w-full text-left text-sm text-purple-700 hover:text-purple-800 transition-colors">
                  • "{'{name}'}, don't miss out on exclusive offers just for you"
                </button>
                <button className="block w-full text-left text-sm text-purple-700 hover:text-purple-800 transition-colors">
                  • "Your weekly update is here with personalized recommendations"
                </button>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Select Audience</h3>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Users className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Estimated Reach</span>
              </div>
              <div className="text-2xl font-bold text-blue-900">
                {audienceSize.toLocaleString()} recipients
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Select Segments</h4>
              <div className="space-y-2">
                {insights.topSegments.map((segment: { name: string; count: number }) => (
                  <label key={segment.name} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                    <input
                      type="checkbox"
                      checked={campaign.targeting.segments.includes(segment.name)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setCampaign(prev => ({
                            ...prev,
                            targeting: {
                              ...prev.targeting,
                              segments: [...prev.targeting.segments, segment.name]
                            }
                          }));
                        } else {
                          setCampaign(prev => ({
                            ...prev,
                            targeting: {
                              ...prev.targeting,
                              segments: prev.targeting.segments.filter(s => s !== segment.name)
                            }
                          }));
                        }
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2">{segment.name} <span className="text-xs text-gray-500">({segment.count})</span></span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-6 mt-6">
              <h3 className="text-lg font-medium text-gray-900">Define Audience</h3>
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Segment Rule Builder</h4>
                  <RuleBuilder setCampaign={setCampaign} />
              </div>
              <button
                onClick={handleAudiencePreview}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
                disabled={isPreviewLoading}
              >
                {isPreviewLoading ? 'Previewing...' : 'Preview Audience Size'}
              </button>
              {audiencePreview && (
                <div className="mt-2 text-sm text-gray-700">
                  Audience Size: {audiencePreview.size}
                </div>
              )}
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Calendar className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-900">Optimal Send Time</span>
              </div>
              <p className="text-sm text-yellow-800">
                Based on your audience data, the best time to send is Tuesday-Thursday, 10 AM - 2 PM 
                for maximum engagement.
              </p>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Schedule Campaign</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Schedule Type
                </label>
                <select
                  value={campaign.schedule.type}
                  onChange={(e) => setCampaign(prev => ({
                    ...prev,
                    schedule: { ...prev.schedule, type: e.target.value as 'immediate' | 'scheduled' }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="immediate">Send Immediately</option>
                  <option value="scheduled">Schedule for Later</option>
                </select>
              </div>

              {campaign.schedule.type === 'scheduled' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Schedule Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={campaign.schedule.scheduledAt || ''}
                    onChange={(e) => setCampaign(prev => ({
                      ...prev,
                      schedule: { ...prev.schedule, scheduledAt: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Review & Launch</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Campaign Details</h4>
                  <div className="mt-2 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium">{campaign.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-medium capitalize">{campaign.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Audience Size:</span>
                      <span className="font-medium">{audienceSize.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Schedule:</span>
                      <span className="font-medium">
                        {campaign.schedule.type === 'immediate' 
                          ? 'Send Immediately' 
                          : `Scheduled for ${new Date(campaign.schedule.scheduledAt!).toLocaleString()}`
                        }
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700">Selected Segments</h4>
                  <div className="mt-2">
                    {campaign.targeting.segments.length === 0 ? (
                      <span className="text-sm text-gray-500">All segments</span>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {campaign.targeting.segments.map((segment) => (
                          <span key={segment} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {segment}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Content Preview</h4>
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  {campaign.type === 'email' && campaign.content.subject && (
                    <div className="mb-3">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Subject:</span>
                      <div className="text-sm font-medium text-gray-900">{campaign.content.subject}</div>
                    </div>
                  )}
                  <div>
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Message:</span>
                    <div className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">
                      {campaign.content.message || 'No message content'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Wand2 className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-900">AI Performance Prediction</span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold text-green-700">94.5%</div>
                  <div className="text-xs text-green-600">Predicted Delivery</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-green-700">28.3%</div>
                  <div className="text-xs text-green-600">Predicted Open Rate</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-green-700">7.1%</div>
                  <div className="text-xs text-green-600">Predicted Click Rate</div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-2">
              <button
                onClick={handleSmartSchedule}
                disabled={isAiLoading}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                {isAiLoading ? 'Processing...' : 'Smart Scheduling'}
              </button>
              <button
                onClick={handleLookalike}
                disabled={isAiLoading}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
              >
                <Users className="h-4 w-4" />
                {isAiLoading ? 'Processing...' : 'Lookalike Generator'}
              </button>
              <button
                onClick={handleAutoTag}
                disabled={isAiLoading}
                className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50 flex items-center gap-2"
              >
                <Wand2 className="h-4 w-4" />
                {isAiLoading ? 'Processing...' : 'Auto-Tagging'}
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Step Navigation */}
      <div className="flex items-center justify-between mb-6">
        {steps.map((step, index) => (
          <Fragment key={step.id}>
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                currentStep === step.id
                  ? 'bg-blue-600 text-white'
                  : currentStep > step.id
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {currentStep > step.id ? (
                  <span>✓</span>
                ) : (
                  step.id
                )}
              </div>
              <div className="ml-3 hidden sm:block">
                <div className={`text-sm font-medium ${
                  currentStep >= step.id ? 'text-gray-900' : 'text-gray-500'
                }`}>
                  {step.name}
                </div>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div className={`flex-1 h-px mx-4 ${
                currentStep > step.id ? 'bg-green-600' : 'bg-gray-200'
              }`} />
            )}
          </Fragment>
        ))}
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        {renderStepContent()}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>

        <div className="flex space-x-3">
          {currentStep > 1 && (
            <button
              onClick={handlePrevious}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Previous
            </button>
          )}
          
          {currentStep < steps.length ? (
            <button
              onClick={handleNext}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 transition-colors"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="inline-flex items-center px-6 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors"
            >
              <Send className="w-4 h-4 mr-2" />
              {campaign.schedule.type === 'immediate' ? 'Launch Campaign' : 'Schedule Campaign'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};