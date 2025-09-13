import React, { useState, useRef } from 'react';
import { useData } from '../../../contexts/DataContext';
import { Upload, FileText, AlertCircle, CheckCircle, X, Download, Eye } from 'lucide-react';

interface FileValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  preview?: any[];
}

export const DataUpload: React.FC = () => {
  const { importData, addDataSource } = useData();
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [validation, setValidation] = useState<FileValidation | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const validateFile = async (file: File): Promise<FileValidation> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const lines = text.split('\n').filter(line => line.trim());
          
          if (lines.length === 0) {
            resolve({
              isValid: false,
              errors: ['File is empty'],
              warnings: []
            });
            return;
          }

          const headers = lines[0].split(',').map(h => h.trim());
          const requiredFields = ['email'];
          const recommendedFields = ['name', 'phone', 'segment'];
          
          const errors: string[] = [];
          const warnings: string[] = [];
          
          // Check for required fields
          const missingRequired = requiredFields.filter(field => 
            !headers.some(h => h.toLowerCase().includes(field.toLowerCase()))
          );
          
          if (missingRequired.length > 0) {
            errors.push(`Missing required fields: ${missingRequired.join(', ')}`);
          }
          
          // Check for recommended fields
          const missingRecommended = recommendedFields.filter(field => 
            !headers.some(h => h.toLowerCase().includes(field.toLowerCase()))
          );
          
          if (missingRecommended.length > 0) {
            warnings.push(`Consider adding recommended fields: ${missingRecommended.join(', ')}`);
          }

          // Validate data rows
          const dataLines = lines.slice(1, Math.min(6, lines.length)); // Preview first 5 rows
          const preview = dataLines.map(line => {
            const values = line.split(',').map(v => v.trim());
            const row: any = {};
            headers.forEach((header, index) => {
              row[header] = values[index] || '';
            });
            return row;
          });

          // Check for valid emails in preview
          const emailField = headers.find(h => h.toLowerCase().includes('email'));
          if (emailField) {
            const invalidEmails = preview.filter(row => {
              const email = row[emailField];
              return email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
            });
            
            if (invalidEmails.length > 0) {
              warnings.push(`${invalidEmails.length} invalid email(s) detected in preview`);
            }
          }

          if (lines.length > 1000) {
            warnings.push(`Large file detected (${lines.length - 1} records). Processing may take a moment.`);
          }

          resolve({
            isValid: errors.length === 0,
            errors,
            warnings,
            preview
          });
        } catch (error) {
          resolve({
            isValid: false,
            errors: ['Invalid CSV format'],
            warnings: []
          });
        }
      };
      
      reader.readAsText(file);
    });
  };

  const handleFileSelection = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setValidation({
        isValid: false,
        errors: ['Only CSV files are supported'],
        warnings: []
      });
      return;
    }

    setUploadedFile(file);
    setIsProcessing(true);
    
    // Simulate processing time
    for (let i = 0; i <= 100; i += 10) {
      setUploadProgress(i);
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    const validation = await validateFile(file);
    setValidation(validation);
    setIsProcessing(false);
  };

  const handleImport = async () => {
    if (!uploadedFile || !validation?.isValid) return;
    
    setIsProcessing(true);
    
    try {
      // Create new data source
      const newSource = {
        name: uploadedFile.name.replace('.csv', ''),
        type: 'csv' as const,
        status: 'connected' as const,
        recordCount: (validation.preview?.length || 0) * 200, // Simulate full file size
        lastSync: new Date().toISOString(),
        config: { filename: uploadedFile.name }
      };
      
      addDataSource(newSource);
      
      // Simulate data import
      if (validation.preview) {
        await importData('temp-id', validation.preview);
      }
      
      // Reset form
      setUploadedFile(null);
      setValidation(null);
      setUploadProgress(0);
      
    } catch (error) {
      console.error('Import failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = 'email,name,phone,segment,created_at\nuser@example.com,John Doe,+1234567890,high-value,2025-01-20\n';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'customer_data_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Upload Template Download */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Download className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-medium text-blue-900">Download Template</h4>
            <p className="text-sm text-blue-700 mt-1">
              Use our CSV template to ensure your data imports correctly with all required fields.
            </p>
            <button
              onClick={downloadTemplate}
              className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              Download CSV template →
            </button>
          </div>
        </div>
      </div>

      {/* File Upload Area */}
      <div 
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
          isDragging 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400 bg-gray-50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileInputChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="space-y-4">
          <div className="w-12 h-12 mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
            <Upload className="h-6 w-6 text-gray-500" />
          </div>
          
          <div>
            <p className="text-lg font-medium text-gray-900">
              Drop your CSV file here, or click to browse
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Supports files up to 50MB with customer data
            </p>
          </div>
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            <Upload className="w-4 h-4 mr-2" />
            Choose File
          </button>
        </div>
      </div>

      {/* Processing Progress */}
      {isProcessing && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
            <span className="text-sm font-medium text-gray-700">
              Processing file... {uploadProgress}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* File Validation Results */}
      {uploadedFile && validation && !isProcessing && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileText className="h-5 w-5 text-gray-600" />
                <div>
                  <h4 className="text-lg font-medium text-gray-900">{uploadedFile.name}</h4>
                  <p className="text-sm text-gray-500">{(uploadedFile.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setUploadedFile(null);
                  setValidation(null);
                  setUploadProgress(0);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Validation Status */}
          <div className="p-6 space-y-4">
            {validation.errors.length > 0 && (
              <div className="flex items-start space-x-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h5 className="text-sm font-medium text-red-900">Validation Errors</h5>
                  <ul className="text-sm text-red-700 mt-1 space-y-1">
                    {validation.errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {validation.warnings.length > 0 && (
              <div className="flex items-start space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h5 className="text-sm font-medium text-yellow-900">Warnings</h5>
                  <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                    {validation.warnings.map((warning, index) => (
                      <li key={index}>• {warning}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {validation.isValid && (
              <div className="flex items-start space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h5 className="text-sm font-medium text-green-900">File Valid</h5>
                  <p className="text-sm text-green-700 mt-1">
                    Ready to import {validation.preview?.length || 0} preview records
                  </p>
                </div>
              </div>
            )}

            {/* Data Preview */}
            {validation.preview && validation.preview.length > 0 && (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                  <div className="flex items-center space-x-2">
                    <Eye className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Data Preview</span>
                  </div>
                </div>
                <div className="overflow-x-auto max-h-64">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        {Object.keys(validation.preview[0]).map((header) => (
                          <th key={header} className="px-4 py-2 text-left font-medium text-gray-700">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {validation.preview.map((row, index) => (
                        <tr key={index} className="border-b border-gray-100">
                          {Object.values(row).map((value, cellIndex) => (
                            <td key={cellIndex} className="px-4 py-2 text-gray-600">
                              {String(value).substring(0, 30)}
                              {String(value).length > 30 && '...'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Import Actions */}
            {uploadedFile && (
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-500">
                  {validation?.isValid ? 'Ready to import' : 'Fix errors before importing'}
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setUploadedFile(null);
                      setValidation(null);
                      setUploadProgress(0);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleImport}
                    disabled={!validation?.isValid || isProcessing}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Import Data
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Upload Guidelines */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="text-sm font-medium text-gray-900 mb-3">File Requirements</h4>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-center space-x-2">
            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
            <span>CSV format with headers in the first row</span>
          </li>
          <li className="flex items-center space-x-2">
            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
            <span>Required field: <code className="bg-gray-200 px-1 rounded">email</code></span>
          </li>
          <li className="flex items-center space-x-2">
            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
            <span>Recommended fields: <code className="bg-gray-200 px-1 rounded">name</code>, <code className="bg-gray-200 px-1 rounded">phone</code>, <code className="bg-gray-200 px-1 rounded">segment</code></span>
          </li>
          <li className="flex items-center space-x-2">
            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
            <span>Maximum file size: 50MB</span>
          </li>
          <li className="flex items-center space-x-2">
            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
            <span>Encoding: UTF-8 recommended</span>
          </li>
        </ul>
      </div>
    </div>
  );
};