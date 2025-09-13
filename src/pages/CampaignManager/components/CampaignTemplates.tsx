import React, { useState } from 'react';
import { Mail, MessageSquare, Bell, Star, TrendingUp } from 'lucide-react';

interface CampaignTemplatesProps {
  onUseTemplate: () => void;
}

const templates = [
  {
    id: 'welcome-email',
    name: 'Welcome Email Series',
    description: 'Onboard new customers with a warm welcome and key information',
    type: 'email',
    category: 'onboarding',
    rating: 4.9,
    usage: 1247,
    preview: {
  subject: 'Welcome to [Company Name]! Here\'s what\'s next...',
    content: 'Hi {{name}},\n\nWelcome to our community! We\'re excited to have you on board.\n\nHere\'s what you can expect:\n- Exclusive offers and early access\n- Weekly tips and insights\n- 24/7 customer support\n\nGet started by exploring our most popular features...'
    }
  },
  {
    id: 'abandoned-cart',
    name: 'Abandoned Cart Recovery',
    description: 'Re-engage customers who left items in their cart',
    type: 'email',
    category: 'ecommerce',
    rating: 4.7,
    usage: 892,
    preview: {
      subject: 'You left something behind, {{name}}...',
    content: 'Hi {{name}},\n\nWe noticed you were interested in some great items but didn\'t complete your purchase.\n\nYour cart is waiting:\n- [Product Name] - $XX.XX\n- [Product Name] - $XX.XX\n\nComplete your order now and get FREE shipping!'
    }
  },
  {
    id: 'flash-sale-sms',
    name: 'Flash Sale SMS',
    description: 'Quick SMS for time-sensitive promotions',
    type: 'sms',
    category: 'promotional',
    rating: 4.6,
    usage: 2341,
    preview: {
      content: '🔥 FLASH SALE ALERT! 50% OFF everything for the next 4 hours only! Use code FLASH50. Shop now: [link] Reply STOP to opt out.'
    }
  },
  {
    id: 'reengagement-push',
    name: 'Re-engagement Push',
    description: 'Bring back inactive users with compelling notifications',
    type: 'push',
    category: 'retention',
    rating: 4.4,
    usage: 567,
    preview: {
      content: 'We miss you! Come back and discover what\'s new. Tap to see your personalized recommendations.'
    }
  },
  {
    id: 'birthday-email',
    name: 'Birthday Celebration',
    description: 'Personal birthday wishes with special offers',
    type: 'email',
    category: 'lifecycle',
    rating: 4.8,
    usage: 689,
    preview: {
      subject: 'Happy Birthday {{name}}! 🎉 Special gift inside',
      content: 'Happy Birthday {{name}}!\n\n🎉 Today is all about you! We\'ve prepared a special birthday gift:\n\n🎁 25% OFF your next purchase\n🎂 Free birthday dessert at our cafe\n⭐ Exclusive access to new collection\n\nUse code: BIRTHDAY25\nValid until: {{expiry_date}}'
    }
  },
  {
    id: 'product-launch-multi',
    name: 'Product Launch Sequence',
    description: 'Multi-channel announcement for new product launches',
    type: 'email',
    category: 'announcement',
    rating: 4.5,
    usage: 423,
    preview: {
      subject: 'Introducing [Product Name] - You asked, we delivered!',
      content: 'Hi {{name}},\n\nThe wait is over! We\'re thrilled to introduce [Product Name].\n\n✨ What makes it special:\n• Feature 1\n• Feature 2\n• Feature 3\n\nBe among the first to experience it. Early bird pricing available for 48 hours only!'
    }
  }
];

const categories = [
  { id: 'all', name: 'All Templates' },
  { id: 'onboarding', name: 'Onboarding' },
  { id: 'promotional', name: 'Promotional' },
  { id: 'ecommerce', name: 'E-commerce' },
  { id: 'retention', name: 'Retention' },
  { id: 'lifecycle', name: 'Lifecycle' },
  { id: 'announcement', name: 'Announcements' }
];

export const CampaignTemplates: React.FC<CampaignTemplatesProps> = ({ onUseTemplate }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const filteredTemplates = selectedCategory === 'all' 
    ? templates 
    : templates.filter(t => t.category === selectedCategory);

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

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === category.id
                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredTemplates.map((template) => {
          const TypeIcon = getTypeIcon(template.type);
          
          return (
            <div key={template.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${getTypeColor(template.type)}`}>
                      <TypeIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">{template.name}</h4>
                      <p className="text-sm text-gray-600">{template.description}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4 mb-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span>{template.rating}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="h-4 w-4" />
                    <span>{template.usage} uses</span>
                  </div>
                </div>

                {/* Preview */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  {template.preview.subject && (
                    <div className="mb-2">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Subject:</span>
                      <div className="text-sm font-medium text-gray-800">{template.preview.subject}</div>
                    </div>
                  )}
                  <div>
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Content:</span>
                    <div className="text-sm text-gray-700 mt-1 line-clamp-4">
                      {template.preview.content}
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setSelectedTemplate(selectedTemplate === template.id ? null : template.id)}
                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {selectedTemplate === template.id ? 'Hide Preview' : 'Preview'}
                  </button>
                  <button
                    onClick={onUseTemplate}
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Use Template
                  </button>
                </div>
              </div>
              
              {/* Expanded Preview */}
              {selectedTemplate === template.id && (
                <div className="border-t border-gray-200 p-6 bg-gray-50">
                  <h5 className="text-sm font-medium text-gray-900 mb-3">Full Preview</h5>
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    {template.preview.subject && (
                      <div className="mb-3 pb-3 border-b border-gray-100">
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Subject Line</div>
                        <div className="text-sm font-medium text-gray-900">{template.preview.subject}</div>
                      </div>
                    )}
                    <div>
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Message Content</div>
                      <div className="text-sm text-gray-700 whitespace-pre-line">{template.preview.content}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Custom Template CTA */}
      <div className="text-center py-8 border-t border-gray-200">
        <h4 className="text-lg font-medium text-gray-900 mb-2">Need something custom?</h4>
        <p className="text-gray-600 mb-4">Create your own template from scratch or request a custom template from our team.</p>
        <div className="flex justify-center space-x-3">
          <button 
            onClick={onUseTemplate}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Start from Scratch
          </button>
          <button className="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-lg hover:bg-purple-700 transition-colors">
            Request Custom Template
          </button>
        </div>
      </div>
    </div>
  );
};