import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface DataSource {
  id: string;
  name: string;
  type: 'csv' | 'api' | 'database' | 'webhook';
  status: 'connected' | 'disconnected' | 'syncing' | 'error';
  recordCount: number;
  lastSync: string;
    config: Record<string, string | number | boolean | null>;
}

export interface DataRecord {
  id: string;
  email: string;
  name?: string;
  phone?: string;
    attributes: Record<string, string | number | boolean | null>;
  segments: string[];
  createdAt: string;
  updatedAt: string;
}

interface AudienceInsights {
  totalRecords: number;
  segments: Record<string, number>;
  averageEngagement: number;
  topSegments: { name: string; count: number }[];
}

interface DataContextType {
  dataSources: DataSource[];
  dataRecords: DataRecord[];
  addDataSource: (source: Omit<DataSource, 'id'>) => void;
  updateDataSource: (id: string, updates: Partial<DataSource>) => void;
  deleteDataSource: (id: string) => void;
  importData: (sourceId: string, data: DataRecord[]) => Promise<void>;
  getAudienceInsights: () => AudienceInsights;
}



const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [dataSources, setDataSources] = useState<DataSource[]>([]);

  const [dataRecords, setDataRecords] = useState<DataRecord[]>([]);

  // Fetch data sources from backend API
  React.useEffect(() => {
    const fetchDataSources = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/data-sources`, {
          credentials: 'include',
        });
        if (res.ok) {
          const sources = await res.json();
          setDataSources(sources);
        }
      } catch (err) {
        console.error('Failed to fetch data sources', err);
      }
    };
    fetchDataSources();
  }, []);

  // Fetch data records from backend API
  React.useEffect(() => {
    const fetchDataRecords = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/data-records`, {
          credentials: 'include',
        });
        if (res.ok) {
          const records = await res.json();
          setDataRecords(records);
        }
      } catch (err) {
        console.error('Failed to fetch data records', err);
      }
    };
    fetchDataRecords();
  }, []);

  const addDataSource = (source: Omit<DataSource, 'id'>) => {
    const newSource = {
      ...source,
      id: Date.now().toString()
    };
    setDataSources(prev => [...prev, newSource]);
  };

  const updateDataSource = (id: string, updates: Partial<DataSource>) => {
    setDataSources(prev => prev.map(source => 
      source.id === id ? { ...source, ...updates } : source
    ));
  };

  const deleteDataSource = (id: string) => {
    setDataSources(prev => prev.filter(source => source.id !== id));
  };

  const importData = async (sourceId: string, data: DataRecord[]) => {
    // Simulate API processing
    updateDataSource(sourceId, { status: 'syncing' });
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const processedRecords: DataRecord[] = data.map((item, index) => {
      const { email, name, phone, segments, attributes = {}, ...rest } = item;
      return {
        id: `${sourceId}-${index}`,
        email: email || `user${index}@example.com`,
        name: name || `User ${index}`,
        phone,
        attributes: { ...attributes, ...rest },
        segments: segments || ['general'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    });

    setDataRecords(prev => [...prev, ...processedRecords]);
    updateDataSource(sourceId, { 
      status: 'connected', 
      recordCount: data.length,
      lastSync: new Date().toISOString()
    });
  };

  const getAudienceInsights = () => {
    const totalRecords = dataRecords.length;
    const segments = dataRecords.reduce((acc, record) => {
      record.segments.forEach(segment => {
        acc[segment] = (acc[segment] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    return {
      totalRecords,
      segments,
      averageEngagement: 0.34,
      topSegments: Object.entries(segments)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }))
    };
  };

  const value = {
    dataSources,
    dataRecords,
    addDataSource,
    updateDataSource,
    deleteDataSource,
    importData,
    getAudienceInsights
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};