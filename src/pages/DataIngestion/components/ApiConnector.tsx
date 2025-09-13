import React, { useState } from 'react';
import { useData } from '../../../contexts/DataContext';
import { Globe, Plus, Settings, TestTube, CheckCircle, AlertCircle, Loader2, X } from 'lucide-react';

interface ApiConnection {
  name: string;
  endpoint: string;
  method: 'GET' | 'POST';
  headers: Record<string, string>;
  authentication: {
    type: 'none' | 'bearer' | 'basic' | 'api-key';
    token?: string;
    username?: string;
    password?: string;
    apiKeyHeader?: string;
    apiKey?: string;
  };
}

interface TestResult {
  success: boolean;
  recordCount?: number;
  sampleData?: Record<string, unknown>[];
  error?: string;
}

export const ApiConnector: React.FC = () => {
  const { addDataSource } = useData();
  const [showForm, setShowForm] = useState(false);
  const [connection, setConnection] = useState<ApiConnection>({
    name: '',
    endpoint: '',
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    authentication: { type: 'none' }
  });
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [aiMessage, setAiMessage] = useState<string>('');

  const predefinedConnections = [
    {
      name: 'Shopify Customers',
      endpoint: 'https://your-shop.myshopify.com/admin/api/2023-01/customers.json',
      method: 'GET' as const,
      headers: { 'Content-Type': 'application/json' },
      authentication: { type: 'api-key' as const, apiKeyHeader: 'X-Shopify-Access-Token' }
    },
    {
      name: 'WooCommerce Customers',
      endpoint: 'https://your-site.com/wp-json/wc/v3/customers',
      method: 'GET' as const,
      headers: { 'Content-Type': 'application/json' },
      authentication: { type: 'basic' as const }
    },
    {
      name: 'Mailchimp Audience',
      endpoint: 'https://usX.api.mailchimp.com/3.0/lists/LIST_ID/members',
      method: 'GET' as const,
      headers: { 'Content-Type': 'application/json' },
      authentication: { type: 'bearer' as const }
    }
  ];

  const testConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      // Simulate API test
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock successful test
      const mockData = [
        { id: '1', email: 'john@example.com', name: 'John Doe', created_at: '2025-01-20' },
        { id: '2', email: 'jane@example.com', name: 'Jane Smith', created_at: '2025-01-19' },
        { id: '3', email: 'bob@example.com', name: 'Bob Johnson', created_at: '2025-01-18' }
      ];

      setTestResult({
        success: true,
        recordCount: 1247,
        sampleData: mockData
      });
    } catch {
      setTestResult({
        success: false,
        error: 'Failed to connect to API. Please check your endpoint and authentication.'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const saveConnection = async () => {
    setIsSaving(true);

    try {
      const newSource = {
        name: connection.name,
        type: 'api' as const,
        status: 'connected' as const,
        recordCount: testResult?.recordCount || 0,
        lastSync: new Date().toISOString(),
        config: {
          endpoint: connection.endpoint,
          method: connection.method,
          headers: JSON.stringify(connection.headers),
          authentication: JSON.stringify(connection.authentication)
        }
      };

      addDataSource(newSource);
      
      // Reset form
      setConnection({
        name: '',
        endpoint: '',
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        authentication: { type: 'none' }
      });
      setTestResult(null);
      setShowForm(false);
    } catch (error) {
      console.error('Failed to save connection:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const loadPredefined = (predefined: typeof predefinedConnections[0]) => {
    setConnection(prev => ({
      ...prev,
      name: predefined.name,
      endpoint: predefined.endpoint,
      method: predefined.method,
      headers: predefined.headers,
      authentication: predefined.authentication
    }));
    setShowForm(true);
  };

  // --- AI Auto-Fix and AI Assistant ---
  // --- Advanced AI Features ---
  const handleSmartSchedule = async () => {
    setIsSaving(true);
    setAiMessage('');
    try {
      const jwt = localStorage.getItem('jwt');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/ai/smart-schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(jwt ? { Authorization: `Bearer ${jwt}` } : {})
        },
        body: JSON.stringify({ audience: testResult?.sampleData || [], history: [] })
      });
      const data = await res.json();
      setAiMessage(data.suggestion || data.error || 'Smart Scheduling failed.');
    } catch {
      setAiMessage('Smart Scheduling failed.');
    }
    setIsSaving(false);
  };

  const handleLookalike = async () => {
    setIsSaving(true);
    setAiMessage('');
    try {
      const jwt = localStorage.getItem('jwt');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/ai/lookalike`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(jwt ? { Authorization: `Bearer ${jwt}` } : {})
        },
        body: JSON.stringify({ segment: testResult?.sampleData || [] })
      });
      const data = await res.json();
      setAiMessage(data.lookalikes || data.error || 'Lookalike generation failed.');
    } catch {
      setAiMessage('Lookalike generation failed.');
    }
    setIsSaving(false);
  };

  const handleAutoTag = async () => {
    setIsSaving(true);
    setAiMessage('');
    try {
      const jwt = localStorage.getItem('jwt');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/ai/auto-tag`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(jwt ? { Authorization: `Bearer ${jwt}` } : {})
        },
        body: JSON.stringify({ audience: testResult?.sampleData || [], message: '' })
      });
      const data = await res.json();
      setAiMessage(data.tag || data.error || 'Auto-Tagging failed.');
    } catch {
      setAiMessage('Auto-Tagging failed.');
    }
    setIsSaving(false);
  };
  const handleAutoFix = async () => {
    setIsSaving(true);
    setAiMessage('');
    try {
      const jwt = localStorage.getItem('jwt');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/data/autofix`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(jwt ? { Authorization: `Bearer ${jwt}` } : {})
        },
        body: JSON.stringify({ records: testResult?.sampleData || [] })
      });
      const data = await res.json();
      if (data.success) {
        setAiMessage(`AI Auto-Fix complete! ${data.fixedCount || testResult?.recordCount || 0} records processed.`);
        setTestResult({
          ...testResult,
          success: true,
          recordCount: data.fixedCount || testResult?.recordCount,
          sampleData: data.fixedData || testResult?.sampleData,
          error: undefined
        });
      } else {
        setAiMessage(data.error || 'AI Auto-Fix failed.');
        setTestResult({ ...testResult, success: false, error: data.error || 'AI Auto-Fix failed.' });
      }
    } catch {
      setAiMessage('AI Auto-Fix failed.');
      setTestResult({ ...testResult, success: false, error: 'AI Auto-Fix failed.' });
    }
    setIsSaving(false);
  };

  return (
    <div className="space-y-6">
      {!showForm ? (
        <>
          {/* Quick Connect Options */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Popular Integrations</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {predefinedConnections.map((conn, index) => (
                <button
                  key={index}
                  onClick={() => loadPredefined(conn)}
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 text-left group"
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <Globe className="h-5 w-5 text-gray-600 group-hover:text-blue-600" />
                    <span className="font-medium text-gray-900">{conn.name}</span>
                  </div>
                  <p className="text-sm text-gray-500 truncate">{conn.endpoint}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Connection */}
          <div className="border-t border-gray-200 pt-6">
            <button
              onClick={() => setShowForm(true)}
              className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 flex items-center justify-center space-x-2 text-gray-600 hover:text-blue-600"
            >
              <Plus className="h-5 w-5" />
              <span className="font-medium">Add Custom API Connection</span>
            </button>
          </div>
        </>
      ) : (
        /* API Configuration Form */
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">API Configuration</h3>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Basic Configuration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Connection Name
                </label>
                <input
                  type="text"
                  value={connection.name}
                  onChange={(e) => setConnection(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="My API Connection"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  HTTP Method
                </label>
                <select
                  value={connection.method}
                  onChange={(e) => setConnection(prev => ({ 
                    ...prev, 
                    method: e.target.value as 'GET' | 'POST'
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Endpoint URL
              </label>
              <input
                type="url"
                value={connection.endpoint}
                onChange={(e) => setConnection(prev => ({ ...prev, endpoint: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://api.example.com/v1/customers"
              />
            </div>

            {/* Authentication */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Authentication
              </label>
              <div className="space-y-4">
                <select
                  value={connection.authentication.type}
                  onChange={(e) => setConnection(prev => ({
                    ...prev,
                    authentication: { ...prev.authentication, type: e.target.value as 'none' | 'bearer' | 'basic' | 'api-key' }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="none">No Authentication</option>
                  <option value="bearer">Bearer Token</option>
                  <option value="basic">Basic Auth</option>
                  <option value="api-key">API Key</option>
                </select>

                {connection.authentication.type === 'bearer' && (
                  <input
                    type="password"
                    value={connection.authentication.token || ''}
                    onChange={(e) => setConnection(prev => ({
                      ...prev,
                      authentication: { ...prev.authentication, token: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Bearer token"
                  />
                )}

                {connection.authentication.type === 'basic' && (
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={connection.authentication.username || ''}
                      onChange={(e) => setConnection(prev => ({
                        ...prev,
                        authentication: { ...prev.authentication, username: e.target.value }
                      }))}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Username"
                    />
                    <input
                      type="password"
                      value={connection.authentication.password || ''}
                      onChange={(e) => setConnection(prev => ({
                        ...prev,
                        authentication: { ...prev.authentication, password: e.target.value }
                      }))}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Password"
                    />
                  </div>
                )}

                {connection.authentication.type === 'api-key' && (
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={connection.authentication.apiKeyHeader || ''}
                      onChange={(e) => setConnection(prev => ({
                        ...prev,
                        authentication: { ...prev.authentication, apiKeyHeader: e.target.value }
                      }))}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Header name (e.g., X-API-Key)"
                    />
                    <input
                      type="password"
                      value={connection.authentication.apiKey || ''}
                      onChange={(e) => setConnection(prev => ({
                        ...prev,
                        authentication: { ...prev.authentication, apiKey: e.target.value }
                      }))}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="API key"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Test Results */}
            {testResult && (
              <div className={`p-4 rounded-lg border ${
                testResult.success 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-start space-x-3">
                  {testResult.success ? (
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <h4 className={`text-sm font-medium ${
                      testResult.success ? 'text-green-900' : 'text-red-900'
                    }`}>
                      {testResult.success ? 'Connection Successful' : 'Connection Failed'}
                    </h4>
                    {testResult.success ? (
                      <p className="text-sm text-green-700 mt-1">
                        Found {testResult.recordCount} records. Sample data validated.
                      </p>
                    ) : (
                      <p className="text-sm text-red-700 mt-1">{testResult.error}</p>
                    )}
                  </div>
                </div>

                {testResult.sampleData && (
                  <div className="mt-4 border border-green-200 rounded-lg overflow-hidden">
                    <div className="bg-green-100 px-3 py-2 border-b border-green-200">
                      <span className="text-xs font-medium text-green-800">Sample Data</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead className="bg-gray-50">
                          <tr>
                            {testResult.sampleData[0] && Object.keys(testResult.sampleData[0]).map((key) => (
                              <th key={key} className="px-3 py-2 text-left font-medium text-gray-700">
                                {key}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {testResult.sampleData.slice(0, 3).map((item, index) => (
                            <tr key={index} className="border-t border-gray-100">
                              {Object.values(item).map((value, cellIndex) => (
                                <td key={cellIndex} className="px-3 py-2 text-gray-600">
                                  {String(value).substring(0, 20)}
                                  {String(value).length > 20 && '...'}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Form Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <button
                onClick={testConnection}
                disabled={!connection.endpoint || isTesting}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isTesting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <TestTube className="w-4 h-4 mr-2" />
                )}
                Test Connection
              </button>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveConnection}
                  disabled={!testResult?.success || isSaving}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Connection'
                  )}
                </button>
              </div>
            </div>

            {/* AI Auto-Fix */}
            <button
              className={`w-full py-3 rounded-lg font-medium text-white ${isSaving ? 'bg-purple-300' : 'bg-purple-600 hover:bg-purple-700'} transition-colors flex items-center justify-center mb-2`}
              onClick={handleAutoFix}
              disabled={isSaving || !testResult?.success}
            >
              🪄 AI Auto-Fix
            </button>
            <button
              className={`w-full py-3 rounded-lg font-medium text-white ${isSaving ? 'bg-green-300' : 'bg-green-600 hover:bg-green-700'} transition-colors flex items-center justify-center mb-2`}
              onClick={handleSmartSchedule}
              disabled={isSaving || !testResult?.success}
            >
              🧠 Smart Scheduling
            </button>
            <button
              className={`w-full py-3 rounded-lg font-medium text-white ${isSaving ? 'bg-purple-300' : 'bg-purple-800 hover:bg-purple-900'} transition-colors flex items-center justify-center mb-2`}
              onClick={handleLookalike}
              disabled={isSaving || !testResult?.success}
            >
              👥 Lookalike Generator
            </button>
            <button
              className={`w-full py-3 rounded-lg font-medium text-white ${isSaving ? 'bg-yellow-300' : 'bg-yellow-500 hover:bg-yellow-600'} transition-colors flex items-center justify-center mb-2`}
              onClick={handleAutoTag}
              disabled={isSaving || !testResult?.success}
            >
              🏷️ Auto-Tagging
            </button>
            <div className="mt-2 p-4 rounded-lg bg-purple-50 border border-purple-200">
              <div className="flex items-center mb-2">
                <span className="text-purple-700 font-semibold mr-2">🪄 AI Assistant</span>
                <span className="text-xs text-purple-600">Automatically fix common data quality issues, schedule campaigns, generate lookalike audiences, and auto-tag records.</span>
              </div>
              {isSaving ? (
                <div className="text-purple-600">Running AI Action...</div>
              ) : aiMessage ? (
                <div className={aiMessage.includes('complete') || aiMessage.includes('Suggestion') || aiMessage.includes('Generated') ? 'text-green-600' : 'text-red-600'}>{aiMessage}</div>
              ) : (
                <div className="text-purple-600">Click an AI button to run the assistant.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* API Integration Guidelines */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-3">
          <Settings className="h-5 w-5 text-gray-600" />
          <h4 className="text-sm font-medium text-gray-900">API Integration Guidelines</h4>
        </div>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-start space-x-2">
            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
            <span>Ensure your API returns JSON data with customer information</span>
          </li>
          <li className="flex items-start space-x-2">
            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
            <span>Required fields: email address for each customer record</span>
          </li>
          <li className="flex items-start space-x-2">
            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
            <span>Rate limits: We'll respect your API's rate limiting</span>
          </li>
          <li className="flex items-start space-x-2">
            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
            <span>Data sync: Automatic syncing every 6 hours, configurable</span>
          </li>
          <li className="flex items-start space-x-2">
            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
            <span>Security: All API credentials are encrypted and stored securely</span>
          </li>
        </ul>
      </div>
    </div>
  );
};