'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Save, 
  RefreshCw, 
  Eye, 
  Download, 
  Upload,
  Filter,
  Search,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Info,
  FileSpreadsheet,
  Database,
  Zap
} from 'lucide-react';

interface DataSourceConfigProps {
  spreadsheetId: string;
  sheetName: string;
  data: any;
  onConfigSave?: (config: DataSourceConfig) => void;
  onClose?: () => void;
}

interface DataSourceConfig {
  id: string;
  name: string;
  description: string;
  spreadsheetId: string;
  sheetName: string;
  range: string;
  syncFrequency: 'realtime' | 'hourly' | 'daily' | 'weekly' | 'manual';
  dataTransformation: {
    enabled: boolean;
    rules: TransformationRule[];
  };
  filters: {
    enabled: boolean;
    conditions: FilterCondition[];
  };
  aiProcessing: {
    enabled: boolean;
    taskType: string;
    prompt: string;
    model: string;
  };
  outputFormat: 'json' | 'csv' | 'excel' | 'raw';
  createdAt: Date;
  updatedAt: Date;
}

interface TransformationRule {
  id: string;
  type: 'rename_column' | 'format_data' | 'calculate_field' | 'filter_rows' | 'sort_data';
  config: Record<string, any>;
  enabled: boolean;
}

interface FilterCondition {
  id: string;
  column: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'starts_with' | 'ends_with';
  value: string;
  enabled: boolean;
}

export default function DataSourceConfig({ 
  spreadsheetId, 
  sheetName, 
  data, 
  onConfigSave, 
  onClose 
}: DataSourceConfigProps) {
  const [config, setConfig] = useState<DataSourceConfig>({
    id: `config_${Date.now()}`,
    name: `${sheetName} Data Source`,
    description: `Data from ${sheetName} in Google Sheets`,
    spreadsheetId,
    sheetName,
    range: 'A1:Z1000',
    syncFrequency: 'hourly',
    dataTransformation: {
      enabled: false,
      rules: []
    },
    filters: {
      enabled: false,
      conditions: []
    },
    aiProcessing: {
      enabled: false,
      taskType: 'analyze-data',
      prompt: 'Analyze this data and provide insights',
      model: 'gemma3:1b'
    },
    outputFormat: 'json',
    createdAt: new Date(),
    updatedAt: new Date()
  });

  const [isSaving, setIsSaving] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'basic' | 'transformation' | 'filters' | 'ai' | 'preview'>('basic');

  useEffect(() => {
    if (data && data.values) {
      // Convert sheet data to preview format
      const headers = data.values[0] || [];
      const rows = data.values.slice(1, 11) || []; // First 10 rows for preview
      
      const formattedData = rows.map((row: string[], index: number) => {
        const obj: any = { _row: index + 2 }; // +2 because we skip header and 0-index
        headers.forEach((header: string, colIndex: number) => {
          obj[header] = row[colIndex] || '';
        });
        return obj;
      });
      
      setPreviewData(formattedData);
    }
  }, [data]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Save configuration to localStorage or API
      const savedConfigs = JSON.parse(localStorage.getItem('data_source_configs') || '[]');
      console.log('Current saved configs:', savedConfigs);
      console.log('Saving new config:', config);
      
      const existingIndex = savedConfigs.findIndex((c: DataSourceConfig) => c.id === config.id);
      
      if (existingIndex >= 0) {
        savedConfigs[existingIndex] = { ...config, updatedAt: new Date() };
        console.log('Updated existing config at index:', existingIndex);
      } else {
        savedConfigs.push(config);
        console.log('Added new config, total configs:', savedConfigs.length);
      }
      
      localStorage.setItem('data_source_configs', JSON.stringify(savedConfigs));
      console.log('Saved to localStorage:', savedConfigs);
      console.log('localStorage after save:', localStorage.getItem('data_source_configs'));
      
      onConfigSave?.(config);
      
      // Show success message
      alert('Configuration saved successfully!');
    } catch (error) {
      console.error('Error saving configuration:', error);
      alert('Failed to save configuration');
    } finally {
      setIsSaving(false);
    }
  };

  const addTransformationRule = () => {
    const newRule: TransformationRule = {
      id: `rule_${Date.now()}`,
      type: 'rename_column',
      config: {},
      enabled: true
    };
    
    setConfig(prev => ({
      ...prev,
      dataTransformation: {
        ...prev.dataTransformation,
        rules: [...prev.dataTransformation.rules, newRule]
      }
    }));
  };

  const updateTransformationRule = (ruleId: string, updates: Partial<TransformationRule>) => {
    setConfig(prev => ({
      ...prev,
      dataTransformation: {
        ...prev.dataTransformation,
        rules: prev.dataTransformation.rules.map(rule => 
          rule.id === ruleId ? { ...rule, ...updates } : rule
        )
      }
    }));
  };

  const removeTransformationRule = (ruleId: string) => {
    setConfig(prev => ({
      ...prev,
      dataTransformation: {
        ...prev.dataTransformation,
        rules: prev.dataTransformation.rules.filter(rule => rule.id !== ruleId)
      }
    }));
  };

  const addFilterCondition = () => {
    const newCondition: FilterCondition = {
      id: `filter_${Date.now()}`,
      column: '',
      operator: 'equals',
      value: '',
      enabled: true
    };
    
    setConfig(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        conditions: [...prev.filters.conditions, newCondition]
      }
    }));
  };

  const updateFilterCondition = (conditionId: string, updates: Partial<FilterCondition>) => {
    setConfig(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        conditions: prev.filters.conditions.map(condition => 
          condition.id === conditionId ? { ...condition, ...updates } : condition
        )
      }
    }));
  };

  const removeFilterCondition = (conditionId: string) => {
    setConfig(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        conditions: prev.filters.conditions.filter(condition => condition.id !== conditionId)
      }
    }));
  };

  const getColumnNames = () => {
    return data?.values?.[0] || [];
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configure Data Source</h1>
          <p className="text-gray-600">
            {config.name} • {config.spreadsheetId}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Configuration
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 border-b border-gray-200">
        {[
          { id: 'basic', label: 'Basic Settings', icon: Settings },
          { id: 'transformation', label: 'Data Transformation', icon: RefreshCw },
          { id: 'filters', label: 'Filters', icon: Filter },
          { id: 'ai', label: 'AI Processing', icon: Zap },
          { id: 'preview', label: 'Preview', icon: Eye }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Basic Settings */}
      {activeTab === 'basic' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={config.name}
                  onChange={(e) => setConfig(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={config.description}
                  onChange={(e) => setConfig(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data Range</label>
                <input
                  type="text"
                  value={config.range}
                  onChange={(e) => setConfig(prev => ({ ...prev, range: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., A1:Z1000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sync Frequency</label>
                <select
                  value={config.syncFrequency}
                  onChange={(e) => setConfig(prev => ({ ...prev, syncFrequency: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="realtime">Real-time</option>
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="manual">Manual</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Output Format</label>
                <select
                  value={config.outputFormat}
                  onChange={(e) => setConfig(prev => ({ ...prev, outputFormat: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="json">JSON</option>
                  <option value="csv">CSV</option>
                  <option value="excel">Excel</option>
                  <option value="raw">Raw Data</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Data Transformation */}
      {activeTab === 'transformation' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Data Transformation Rules</CardTitle>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={config.dataTransformation.enabled}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      dataTransformation: { ...prev.dataTransformation, enabled: e.target.checked }
                    }))}
                  />
                  <label className="text-sm font-medium">Enable Transformations</label>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {config.dataTransformation.enabled && (
                <div className="space-y-4">
                  {config.dataTransformation.rules.map((rule, index) => (
                    <div key={rule.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">Rule {index + 1}</h4>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={rule.enabled}
                            onChange={(e) => updateTransformationRule(rule.id, { enabled: e.target.checked })}
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeTransformationRule(rule.id)}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                          <select
                            value={rule.type}
                            onChange={(e) => updateTransformationRule(rule.id, { type: e.target.value as any })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="rename_column">Rename Column</option>
                            <option value="format_data">Format Data</option>
                            <option value="calculate_field">Calculate Field</option>
                            <option value="filter_rows">Filter Rows</option>
                            <option value="sort_data">Sort Data</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Configuration</label>
                          <input
                            type="text"
                            placeholder="Enter configuration..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button onClick={addTransformationRule} variant="outline">
                    Add Transformation Rule
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      {activeTab === 'filters' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Data Filters</CardTitle>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={config.filters.enabled}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      filters: { ...prev.filters, enabled: e.target.checked }
                    }))}
                  />
                  <label className="text-sm font-medium">Enable Filters</label>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {config.filters.enabled && (
                <div className="space-y-4">
                  {config.filters.conditions.map((condition, index) => (
                    <div key={condition.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">Filter {index + 1}</h4>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={condition.enabled}
                            onChange={(e) => updateFilterCondition(condition.id, { enabled: e.target.checked })}
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeFilterCondition(condition.id)}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Column</label>
                          <select
                            value={condition.column}
                            onChange={(e) => updateFilterCondition(condition.id, { column: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select column...</option>
                            {getColumnNames().map((col: string) => (
                              <option key={col} value={col}>{col}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Operator</label>
                          <select
                            value={condition.operator}
                            onChange={(e) => updateFilterCondition(condition.id, { operator: e.target.value as any })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="equals">Equals</option>
                            <option value="contains">Contains</option>
                            <option value="greater_than">Greater Than</option>
                            <option value="less_than">Less Than</option>
                            <option value="starts_with">Starts With</option>
                            <option value="ends_with">Ends With</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
                          <input
                            type="text"
                            value={condition.value}
                            onChange={(e) => updateFilterCondition(condition.id, { value: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter filter value..."
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button onClick={addFilterCondition} variant="outline">
                    Add Filter Condition
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* AI Processing */}
      {activeTab === 'ai' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">AI Processing</CardTitle>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={config.aiProcessing.enabled}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      aiProcessing: { ...prev.aiProcessing, enabled: e.target.checked }
                    }))}
                  />
                  <label className="text-sm font-medium">Enable AI Processing</label>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {config.aiProcessing.enabled && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Task Type</label>
                    <select
                      value={config.aiProcessing.taskType}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        aiProcessing: { ...prev.aiProcessing, taskType: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="analyze-data">Analyze Data</option>
                      <option value="extract-insights">Extract Insights</option>
                      <option value="classify-data">Classify Data</option>
                      <option value="summarize-data">Summarize Data</option>
                      <option value="generate-recommendations">Generate Recommendations</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">AI Prompt</label>
                    <textarea
                      value={config.aiProcessing.prompt}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        aiProcessing: { ...prev.aiProcessing, prompt: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={4}
                      placeholder="Describe what you want the AI to do with this data..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">AI Model</label>
                    <select
                      value={config.aiProcessing.model}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        aiProcessing: { ...prev.aiProcessing, model: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="gemma3:1b">Gemma 3:1b (Fast)</option>
                      <option value="gemma2:2b">Gemma 2:2b (Balanced)</option>
                      <option value="llama3.2:3b">Llama 3.2:3b (Advanced)</option>
                    </select>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Preview */}
      {activeTab === 'preview' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Data Preview</CardTitle>
              <p className="text-sm text-gray-600">
                Showing first 10 rows of your data
              </p>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-3 py-2 text-left font-medium">Row</th>
                      {getColumnNames().map((header: string, index: number) => (
                        <th key={index} className="border border-gray-300 px-3 py-2 text-left font-medium">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((row: any, index: number) => (
                      <tr key={index}>
                        <td className="border border-gray-300 px-3 py-2 font-mono text-sm text-gray-500">
                          {row._row}
                        </td>
                        {getColumnNames().map((header: string, colIndex: number) => (
                          <td key={colIndex} className="border border-gray-300 px-3 py-2">
                            {row[header] || ''}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 text-sm text-gray-500">
                Total columns: {getColumnNames().length} • 
                Preview rows: {previewData.length} • 
                Full data: {data?.values?.length - 1 || 0} rows
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
