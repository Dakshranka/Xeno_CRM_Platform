import React, { useState } from 'react';
import { useData } from '../../../contexts/DataContext';
import { CheckCircle, AlertTriangle, XCircle, Wand2, RefreshCw, FileCheck, TrendingUp } from 'lucide-react';

interface ValidationRule {
  id: string;
  name: string;
  description: string;
  type: 'email' | 'phone' | 'required' | 'format' | 'duplicate';
  severity: 'error' | 'warning';
  field: string;
  enabled: boolean;
}

interface ValidationResult {
  total: number;
  valid: number;
  warnings: number;
  errors: number;
  issues: {
    type: string;
    message: string;
    count: number;
    severity: 'error' | 'warning';
  }[];
}

export const DataValidation: React.FC = () => {
  const { dataRecords, dataSources } = useData();
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [validationRules, setValidationRules] = useState<ValidationRule[]>([
    {
      id: 'email-required',
      name: 'Email Required',
      description: 'Every record must have a valid email address',
      type: 'email',
      severity: 'error',
      field: 'email',
      enabled: true
    },
    {
      id: 'email-format',
      name: 'Email Format',
      description: 'Email addresses must be in valid format',
      type: 'format',
      severity: 'error',
      field: 'email',
      enabled: true
    },
    {
      id: 'phone-format',
      name: 'Phone Format',
      description: 'Phone numbers should follow international format',
      type: 'format',
      severity: 'warning',
      field: 'phone',
      enabled: true
    },
    {
      id: 'duplicate-email',
      name: 'Duplicate Emails',
      description: 'Detect and flag duplicate email addresses',
      type: 'duplicate',
      severity: 'warning',
      field: 'email',
      enabled: true
    },
    {
      id: 'name-required',
      name: 'Name Required',
      description: 'Customer name helps with personalization',
      type: 'required',
      severity: 'warning',
      field: 'name',
      enabled: false
    }
  ]);

  const [validationResult, setValidationResult] = useState<ValidationResult>({
    total: dataRecords.length,
    valid: Math.floor(dataRecords.length * 0.85),
    warnings: Math.floor(dataRecords.length * 0.12),
    errors: Math.floor(dataRecords.length * 0.03),
    issues: [
      {
        type: 'Invalid Email Format',
        message: 'Email addresses not in valid format',
        count: 23,
        severity: 'error'
      },
      {
        type: 'Missing Phone Numbers',
        message: 'Records without phone numbers',
        count: 156,
        severity: 'warning'
      },
      {
        type: 'Duplicate Emails',
        message: 'Multiple records with same email',
        count: 45,
        severity: 'warning'
      },
      {
        type: 'Invalid Phone Format',
        message: 'Phone numbers in incorrect format',
        count: 78,
        severity: 'warning'
      }
    ]
  });

  const [isValidating, setIsValidating] = useState(false);
  const [autoFixEnabled] = useState(true);
  const [aiInsight, setAiInsight] = useState<string>('');
  const [aiLoading, setAiLoading] = useState(false);

  const toggleRule = (ruleId: string) => {
    setValidationRules(prev => 
      prev.map(rule => 
        rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
      )
    );
  };

  const fetchAiInsight = async () => {
    setAiLoading(true);
    try {
      const jwt = localStorage.getItem('jwt');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/ai/data-validation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(jwt ? { Authorization: `Bearer ${jwt}` } : {})
        },
        body: JSON.stringify({ records: dataRecords })
      });
      const data = await res.json();
      setAiInsight(data.insight || data.error || 'No AI insight available.');
    } catch {
      setAiInsight('Error fetching AI insight.');
    }
    setAiLoading(false);
  };

  const runValidation = async () => {
    setIsValidating(true);
    try {
      const jwt = localStorage.getItem('jwt');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/data/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(jwt ? { Authorization: `Bearer ${jwt}` } : {})
        },
        body: JSON.stringify({ records: dataRecords, rules: validationRules })
      });
      const data = await res.json();
      setValidationResult(data.result || data.error || 'Validation failed.');
    } catch {
      // fallback: keep previous result
    }
    setIsValidating(false);
  };

  const autoFix = async () => {
    setIsValidating(true);
    try {
      const jwt = localStorage.getItem('jwt');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/data/autofix`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(jwt ? { Authorization: `Bearer ${jwt}` } : {})
        },
        body: JSON.stringify({ records: dataRecords, rules: validationRules })
      });
      const data = await res.json();
      setValidationResult(data.result || data.error || 'Auto-fix failed.');
    } catch {
      // fallback: keep previous result
    }
    setIsValidating(false);
  };

  const getValidationScore = () => {
    if (!validationResult || typeof validationResult.valid !== 'number' || typeof validationResult.total !== 'number' || validationResult.total === 0) {
      return 0;
    }
    return Math.round((validationResult.valid / validationResult.total) * 100);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };


  const validationScore = getValidationScore();

  return (
    <div className="space-y-6">
      {/* Data Quality Overview */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Data Quality Score</h3>
            <p className="text-sm text-gray-600">Overall health of your customer data</p>
          </div>
          <div className="text-right">
            <div className={`text-3xl font-bold ${getScoreColor(validationScore)}`}>
              {validationScore}%
            </div>
            <p className="text-xs text-gray-500">Quality Score</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {validationResult && typeof validationResult.valid === 'number' ? validationResult.valid.toLocaleString() : 0}
            </div>
            <div className="text-sm text-gray-600">Valid Records</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {validationResult && typeof validationResult.warnings === 'number' ? validationResult.warnings.toLocaleString() : 0}
            </div>
            <div className="text-sm text-gray-600">Warnings</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {validationResult && typeof validationResult.errors === 'number' ? validationResult.errors.toLocaleString() : 0}
            </div>
            <div className="text-sm text-gray-600">Errors</div>
          </div>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div className="flex h-full">
            <div 
              className="bg-green-500 transition-all duration-500"
              style={{ width: `${validationResult && typeof validationResult.valid === 'number' && typeof validationResult.total === 'number' && validationResult.total > 0 ? (validationResult.valid / validationResult.total) * 100 : 0}%` }}
            ></div>
            <div 
              className="bg-yellow-500 transition-all duration-500"
              style={{ width: `${validationResult && typeof validationResult.warnings === 'number' && typeof validationResult.total === 'number' && validationResult.total > 0 ? (validationResult.warnings / validationResult.total) * 100 : 0}%` }}
            ></div>
            <div 
              className="bg-red-500 transition-all duration-500"
              style={{ width: `${validationResult && typeof validationResult.errors === 'number' && typeof validationResult.total === 'number' && validationResult.total > 0 ? (validationResult.errors / validationResult.total) * 100 : 0}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Validation Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Data Source Selection */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Data Source</h4>
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="all">All Sources</option>
              {dataSources.map((source) => (
                <option key={source.id} value={source.id}>{source.name}</option>
              ))}
            </select>

            <div className="mt-6 space-y-3">
              <button
                onClick={runValidation}
                disabled={isValidating}
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isValidating ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <FileCheck className="w-4 h-4 mr-2" />
                )}
                Run Validation
              </button>

              {autoFixEnabled && (
                <button
                  onClick={autoFix}
                  disabled={isValidating || validationResult.errors === 0}
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-purple-300 rounded-lg text-sm font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Wand2 className="w-4 h-4 mr-2" />
                  AI Auto-Fix
                </button>
              )}
            </div>

            <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <Wand2 className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-900">AI Assistant</span>
              </div>
              <p className="text-xs text-purple-700 mt-1">
                Automatically fix common data quality issues like formatting and duplicates.
              </p>
            </div>
          </div>
        </div>

        {/* Validation Rules */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h4 className="text-lg font-medium text-gray-900">Validation Rules</h4>
              <p className="text-sm text-gray-600 mt-1">Configure which data quality checks to apply</p>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                {validationRules.map((rule) => (
                  <div key={rule.id} className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={rule.enabled}
                        onChange={() => toggleRule(rule.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h5 className="text-sm font-medium text-gray-900">{rule.name}</h5>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          rule.severity === 'error' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {rule.severity}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{rule.description}</p>
                    </div>

                    <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {rule.field}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Validation Issues */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-medium text-gray-900">Validation Issues</h4>
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-600 font-medium">
                {validationScore}% data quality
              </span>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          {(!validationResult || !Array.isArray(validationResult.issues) || validationResult.issues.length === 0) ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h5 className="text-lg font-medium text-gray-900 mb-2">All Good!</h5>
              <p className="text-gray-600">No validation issues found in your data.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {validationResult.issues.map((issue, index) => (
                <div key={index} className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg">
                  {issue.severity === 'error' ? (
                    <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                  )}
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h5 className="text-sm font-medium text-gray-900">{issue.type}</h5>
                      <span className="text-sm font-medium text-gray-600">
                        {issue.count} records
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{issue.message}</p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors">
                      View Details
                    </button>
                    <button className="text-xs font-medium text-purple-600 hover:text-purple-700 transition-colors">
                      Auto-Fix
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* AI Recommendations */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Wand2 className="h-5 w-5 text-purple-600" />
          <h4 className="text-lg font-semibold text-purple-900">AI Data Insights</h4>
          <button
            className="ml-auto bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700"
            onClick={fetchAiInsight}
            disabled={aiLoading}
          >
            {aiLoading ? 'Loading...' : 'AI Validate'}
          </button>
        </div>
        <div className="text-purple-800 text-sm whitespace-pre-line min-h-[48px]">
          {aiInsight || 'Click "AI Validate" for recommendations.'}
        </div>
      </div>
    </div>
  );
};