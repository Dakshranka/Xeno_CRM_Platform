import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Campaign {
  id: string;
  name: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  type: 'email' | 'sms' | 'push' | 'multi-channel';
  audienceSize: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  createdAt: string;
  scheduledAt?: string;
  content: {
    subject?: string;
    message: string;
    template?: string;
  };
  targeting: {
    segments: string[];
    filters: Record<string, unknown>;
  };
}

interface CampaignContextType {
  campaigns: Campaign[];
  addCampaign: (campaign: Omit<Campaign, 'id'>) => void;
  updateCampaign: (id: string, updates: Partial<Campaign>) => void;
  deleteCampaign: (id: string) => void;
  getCampaign: (id: string) => Campaign | undefined;
  sendCampaign: (id: string) => Promise<{ sent: number; failed: number; total: number } | null>;
}

export const CampaignContext = createContext<CampaignContextType & { selectedCampaignId?: string } | undefined>(undefined);

export const useCampaigns = () => {
  const context = useContext(CampaignContext);
  if (context === undefined) {
    throw new Error('useCampaigns must be used within a CampaignProvider');
  }
  return context;
};

interface CampaignProviderProps {
  children: ReactNode;
}

export const CampaignProvider: React.FC<CampaignProviderProps> = ({ children }) => {
  const sendCampaign = async (id: string) => {
    const jwt = localStorage.getItem('jwt');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/campaigns/${id}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(jwt ? { Authorization: `Bearer ${jwt}` } : {})
        }
      });
      if (res.ok) {
        return await res.json();
      }
      return null;
    } catch (err) {
      console.error('Failed to send campaign', err);
      return null;
    }
  };
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('');

  React.useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const jwt = localStorage.getItem('jwt');
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/campaigns`, {
          headers: {
            'Content-Type': 'application/json',
            ...(jwt ? { Authorization: `Bearer ${jwt}` } : {})
          },
        });
        if (res.ok) {
          const data = await res.json();
          setCampaigns(data);
        }
      } catch (err) {
        console.error('Failed to fetch campaigns', err);
      }
    };
    fetchCampaigns();
  }, []);

  const addCampaign = (campaign: Omit<Campaign, 'id'>) => {
    const jwt = localStorage.getItem('jwt');
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/campaigns`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(jwt ? { Authorization: `Bearer ${jwt}` } : {})
      },
      body: JSON.stringify(campaign)
    })
      .then(res => res.json())
      .then(data => {
        if (data && data._id) {
          setCampaigns(prev => [...prev, { ...data, id: data._id }]);
        }
      })
      .catch(err => {
        console.error('Failed to add campaign', err);
      });
  };

  const updateCampaign = (id: string, updates: Partial<Campaign>) => {
    setCampaigns(prev => prev.map(campaign => 
      campaign.id === id ? { ...campaign, ...updates } : campaign
    ));
  };

  const deleteCampaign = (id: string) => {
    setCampaigns(prev => prev.filter(campaign => campaign.id !== id));
  };

  const getCampaign = (id: string) => {
    return campaigns.find(campaign => campaign.id === id);
  };

  const value = {
    campaigns,
    addCampaign,
    updateCampaign,
    deleteCampaign,
    getCampaign,
    sendCampaign,
    selectedCampaignId,
    setSelectedCampaignId
  };

  return (
    <CampaignContext.Provider value={value}>
      {children}
    </CampaignContext.Provider>
  );
};